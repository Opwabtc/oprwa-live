/**
 * Post-deploy: call setTreasury() on the deployed RWAVault contract.
 *
 * Usage:
 *   OPNET_MNEMONIC="..." npx tsx scripts/set-treasury.ts [CONTRACT_ADDRESS] [TREASURY_ADDRESS]
 *
 * Examples:
 *   OPNET_MNEMONIC="..." npx tsx scripts/set-treasury.ts \
 *     opt1sqrx3wegg9au7l6amnd7jal5rety53sf9cg04s6sq \
 *     opt1pv5z0n6gn0n8szljp7dewl52548zyvt48pt406cl607wen22amalqfpft8p
 *
 * Defaults (if no args):
 *   CONTRACT  — reads from packages/contracts/src/deployed-address.json
 *   TREASURY  — opt1pv5z0n6gn0n8szljp7dewl52548zyvt48pt406cl607wen22amalqfpft8p
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { networks } from '@btc-vision/bitcoin';
import {
    Mnemonic,
    MLDSASecurityLevel,
    AddressTypes,
} from '@btc-vision/transaction';
import { JSONRpcProvider, getContract } from 'opnet';
import { ABIDataTypes } from '@btc-vision/transaction';
import { BitcoinAbiTypes } from 'opnet';
import type { BitcoinInterfaceAbi } from 'opnet';

const TESTNET_RPC = 'https://testnet.opnet.org';
const NETWORK     = networks.opnetTestnet;
const DEFAULT_TREASURY = 'opt1pv5z0n6gn0n8szljp7dewl52548zyvt48pt406cl607wen22amalqfpft8p';

const mnemonic = process.env.OPNET_MNEMONIC;
if (!mnemonic) {
    console.error('ERROR: OPNET_MNEMONIC environment variable is not set');
    process.exit(1);
}

// Resolve contract and treasury addresses from CLI args or defaults
let contractAddress: string = process.argv[2] ?? '';
let treasuryAddress: string = process.argv[3] ?? DEFAULT_TREASURY;

if (!contractAddress) {
    const addressFile = join(__dirname, '../../packages/contracts/src/deployed-address.json');
    try {
        const data = JSON.parse(readFileSync(addressFile, 'utf8')) as { rwaVault: string };
        contractAddress = data.rwaVault;
    } catch {
        console.error('Could not read deployed-address.json and no CONTRACT_ADDRESS argument provided.');
        process.exit(1);
    }
}

console.log('Contract :', contractAddress);
console.log('Treasury :', treasuryAddress);

// Minimal ABI — only setTreasury needed
const SET_TREASURY_ABI: BitcoinInterfaceAbi = [
    {
        name: 'setTreasury',
        type: BitcoinAbiTypes.Function,
        inputs: [{ name: 'treasury', type: ABIDataTypes.ADDRESS }],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
    },
];

const mnemonicObj = new Mnemonic(mnemonic, '', NETWORK, MLDSASecurityLevel.LEVEL1);
const wallet      = mnemonicObj.deriveOPWallet(AddressTypes.P2WPKH, 0);
const callerAddress = wallet.p2wpkh ?? wallet.p2tr;
console.log('Caller   :', callerAddress);

async function run(): Promise<void> {
    const provider = new JSONRpcProvider({ url: TESTNET_RPC, network: NETWORK });

    const sender = await provider.getPublicKeyInfo(callerAddress, false).catch(() => undefined);

    // Resolve treasury address to Address object — SDK requires an object with 'equals' method,
    // not a raw bech32 string. Use getPublicKeyInfo to get the registered public key.
    console.log('Resolving treasury public key...');
    const treasuryPubKey = await provider.getPublicKeyInfo(treasuryAddress, false).catch(() => undefined);
    if (!treasuryPubKey) {
        console.error('ERROR: Could not resolve treasury address public key from OPNet node.');
        console.error('The treasury address must have sent at least one transaction to be registered.');
        process.exit(1);
    }

    const contract = getContract(contractAddress, SET_TREASURY_ABI, provider, NETWORK, sender) as {
        setTransactionDetails(d: { inputs: unknown[]; outputs: unknown[] }): void;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setTreasury(treasury: any): Promise<{ revert?: string; sendTransaction(opts: object): Promise<{ transactionId: string }> }>;
    };

    contract.setTransactionDetails({ inputs: [], outputs: [] });

    console.log('\nSimulating setTreasury...');
    const sim = await contract.setTreasury(treasuryPubKey);

    if (typeof sim.revert === 'string' && sim.revert !== '') {
        console.error('Simulation reverted:', sim.revert);
        process.exit(1);
    }

    console.log('Simulation OK — sending transaction...');
    const receipt = await sim.sendTransaction({
        signer: wallet.keypair,
        mldsaSigner: wallet.mldsaKeypair,
        refundTo: callerAddress,
        network: NETWORK,
        maximumAllowedSatToSpend: 50_000n,
    });

    console.log('\nsetTreasury TX submitted:', receipt.transactionId);
    console.log('OPScan:', `https://opscan.org/transactions/${receipt.transactionId}?network=testnet`);
    console.log('\nWait ~5 min for confirmation, then verify getTreasury() returns the expected address.');
}

run().catch((err: unknown) => {
    console.error('Failed:', err);
    process.exit(1);
});
