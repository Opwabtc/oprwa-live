/**
 * RWAVault deployment script — OPNet Testnet
 * Usage: OPNET_MNEMONIC="..." npx tsx scripts/deploy-rwaVault.ts
 *
 * Deploys: contracts/build/RWAVault.wasm
 * After deploy, the contract address appears in the console.
 * Update oprwa/packages/contracts/src/deployed-address.json with the new address.
 */
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { networks } from '@btc-vision/bitcoin';
import {
    IDeploymentParameters,
    Mnemonic,
    MLDSASecurityLevel,
    TransactionFactory,
    AddressTypes,
} from '@btc-vision/transaction';
import { JSONRpcProvider } from 'opnet';

const TESTNET_RPC = 'https://testnet.opnet.org';
const WASM_PATH   = join(__dirname, '../build/RWAVault.wasm');
const NETWORK     = networks.opnetTestnet;
const FEE_RATE    = 5;
const GAS_SAT_FEE = 15_000n;

const mnemonic = process.env.OPNET_MNEMONIC;
if (!mnemonic) {
    console.error('ERROR: OPNET_MNEMONIC environment variable is not set');
    process.exit(1);
}

const mnemonicObj = new Mnemonic(mnemonic, '', NETWORK, MLDSASecurityLevel.LEVEL1);
const wallet      = mnemonicObj.deriveOPWallet(AddressTypes.P2WPKH, 0);
console.log('Deployer:', wallet.p2tr);

const provider = new JSONRpcProvider({ url: TESTNET_RPC, network: NETWORK });
const factory  = new TransactionFactory();

async function deploy(): Promise<void> {
    const bytecode = readFileSync(WASM_PATH);
    const utxos    = await provider.utxoManager.getUTXOs({ address: wallet.p2tr });

    if (!utxos.length) {
        console.error('No UTXOs found — fund the deployer wallet first.');
        console.error('Deployer address:', wallet.p2tr);
        process.exit(1);
    }

    const challenge = await provider.getChallenge();
    const params: IDeploymentParameters = {
        from: wallet.p2tr,
        utxos,
        signer: wallet.keypair,
        mldsaSigner: wallet.mldsaKeypair,
        network: NETWORK,
        feeRate: FEE_RATE,
        priorityFee: 0n,
        gasSatFee: GAS_SAT_FEE,
        bytecode,
        challenge,
        linkMLDSAPublicKeyToAddress: true,
        revealMLDSAPublicKey: true,
    };

    const deployment = await factory.signDeployment(params);
    await provider.sendRawTransaction(deployment.transaction[0]);
    await provider.sendRawTransaction(deployment.transaction[1]);

    const contractAddress = deployment.contractAddress;
    console.log('\nRWAVault deployed at:', contractAddress);
    console.log('\nVerify on OPScan:');
    console.log(`  https://opscan.org/accounts/${contractAddress}?network=testnet`);

    // Write the deployed address for downstream packages
    const addressFile = join(__dirname, '../../packages/contracts/src/deployed-address.json');
    const addressData = {
        rwaVault: contractAddress,
        deployTxId: 'see OPScan',
        network: 'testnet',
        deployedAt: new Date().toISOString(),
    };
    writeFileSync(addressFile, JSON.stringify(addressData, null, 2));
    console.log('\nDeployed address written to packages/contracts/src/deployed-address.json');
    console.log('\nNext steps:');
    console.log('  1. Wait ~5 min for block confirmation');
    console.log('  2. Verify contract is live on OPScan');
    console.log('  3. Update any frontend config that reads deployed-address.json');
}

deploy().catch((err: unknown) => {
    console.error('Deployment failed:', err);
    process.exit(1);
});
