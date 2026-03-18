/**
 * RWAVaultAdapter — OPNet real implementation + mock fallback.
 *
 * When contractAddress is 'PENDING' or 'MOCK', all write operations return a
 * simulated result so the UI can be developed without a deployed contract.
 * When a real address is provided, it uses the OPNet SDK to call the contract.
 */

import type { IContractAdapter, TxResult } from './IContractAdapter.js';
import { RWA_VAULT_ABI } from './abi/RWAVaultAbi.js';

// Asset ID to on-chain tokenId mapping (mirrors contract storage)
const ASSET_TOKEN_IDS: Record<string, number> = {
  'sp-commercial-tower': 0,
  'us-tbill-fund': 1,
  'gold-vault-reserve': 2,
};

const RPC_URL = 'https://testnet.opnet.org';

// Simulated balances for mock mode: address → assetId → amount
const balances = new Map<string, Map<string, bigint>>();

// Simulated demand factor (scaled 0–1000, 500 = neutral)
let demandFactorScaled = 500;

function computeMockFee(txValue: bigint): bigint {
  const scaled = demandFactorScaled;
  let bps: number;
  if (scaled >= 500) {
    bps = 250 + (scaled - 500) / 2;
  } else {
    bps = 250 - (500 - scaled) / 2;
  }
  bps = Math.max(250, Math.min(750, bps));
  const pctFee = (txValue * BigInt(Math.round(bps))) / 100000n;
  return pctFee > 1000n ? pctFee : 1000n;
}

function generateMockTxId(): string {
  return `mock_tx_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function getOrCreateBalance(address: string): Map<string, bigint> {
  let addrMap = balances.get(address);
  if (addrMap === undefined) {
    addrMap = new Map<string, bigint>();
    balances.set(address, addrMap);
  }
  return addrMap;
}

function isPendingAddress(address: string): boolean {
  return address === 'PENDING' || address === 'MOCK';
}

/**
 * Minimal interface for a simulated tx returned by OPNet contract method calls.
 */
interface OPNetSimResult {
  revert?: string;
  sendTransaction(opts: {
    signer: null;
    mldsaSigner: null;
    refundTo: string;
    network: unknown;
    maximumAllowedSatToSpend: bigint;
  }): Promise<{ transactionId: string }>;
}

/**
 * Typed interface for the RWAVault contract proxy returned by getContract().
 */
interface RWAVaultContract {
  purchase(tokenId: bigint, amount: bigint): Promise<OPNetSimResult>;
  balanceOf(account: string, tokenId: bigint): Promise<{ properties: { balance: bigint } }>;
  collectFee(txValue: bigint): Promise<{ properties: { fee: bigint } }>;
}

/**
 * OPNetRWAVaultAdapter — real OPNet contract calls with mock fallback.
 * Uses dynamic imports so the OPNet SDK is only loaded in browser environments.
 */
export class OPNetRWAVaultAdapter implements IContractAdapter {
  private readonly contractAddress: string;
  private readonly network: 'testnet' | 'mainnet';

  constructor(
    contractAddress: string,
    network: 'testnet' | 'mainnet' = 'testnet',
  ) {
    this.contractAddress = contractAddress;
    this.network = network;
  }

  /**
   * Purchase fractions of an RWA asset on-chain via purchase().
   * @param assetId - Frontend asset identifier (e.g. 'sp-commercial-tower')
   * @param amount - Number of fractions as bigint (smallest unit)
   * @param callerAddress - Bitcoin P2TR address of caller (used as refundTo)
   */
  async mint(
    assetId: string,
    amount: bigint,
    callerAddress?: string,
  ): Promise<TxResult> {
    if (isPendingAddress(this.contractAddress)) {
      return { txId: generateMockTxId(), status: 'PENDING' };
    }

    const tokenId = ASSET_TOKEN_IDS[assetId];
    if (tokenId === undefined) {
      return { txId: '', status: 'FAILED', error: `Unknown asset: ${assetId}` };
    }

    try {
      const opnet = await import('opnet');
      const btcBitcoin = await import('@btc-vision/bitcoin');

      const NETWORK =
        this.network === 'testnet'
          ? btcBitcoin.networks.opnetTestnet
          : btcBitcoin.networks.bitcoin;

      const provider = new opnet.JSONRpcProvider({ url: RPC_URL, network: NETWORK });

      // getContract: 4 params (no senderAddress) — wallet injects sender at sign time
      const contract = opnet.getContract(
        this.contractAddress,
        RWA_VAULT_ABI,
        provider,
        NETWORK,
      ) as unknown as RWAVaultContract;

      // 1. Simulate FIRST — BTC transfers are irreversible
      const sim = await contract.purchase(BigInt(tokenId), amount);

      if (typeof sim.revert === 'string' && sim.revert !== '') {
        return { txId: '', status: 'FAILED', error: sim.revert };
      }

      // 2. Send — wallet signs (signer: null = NEVER pass keypair from frontend)
      const receipt = await sim.sendTransaction({
        signer: null,
        mldsaSigner: null,
        refundTo: callerAddress ?? '',
        network: NETWORK,
        maximumAllowedSatToSpend: 100_000n,
      });

      return {
        txId: receipt.transactionId,
        status: 'PENDING',
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { txId: '', status: 'FAILED', error: msg };
    }
  }

  async burn(_assetId: string, _amount: bigint): Promise<TxResult> {
    return {
      txId: '',
      status: 'FAILED',
      error: 'burn not supported in UI — admin operation only',
    };
  }

  async transfer(_to: string, _assetId: string, _amount: bigint): Promise<TxResult> {
    return { txId: '', status: 'FAILED', error: 'use purchase instead' };
  }

  async balanceOf(address: string, assetId: string): Promise<bigint> {
    if (isPendingAddress(this.contractAddress)) {
      const addrMap = getOrCreateBalance(address);
      return addrMap.get(assetId) ?? 0n;
    }

    const tokenId = ASSET_TOKEN_IDS[assetId];
    if (tokenId === undefined) return 0n;

    try {
      const opnet = await import('opnet');
      const btcBitcoin = await import('@btc-vision/bitcoin');

      const NETWORK =
        this.network === 'testnet'
          ? btcBitcoin.networks.opnetTestnet
          : btcBitcoin.networks.bitcoin;

      const provider = new opnet.JSONRpcProvider({ url: RPC_URL, network: NETWORK });
      const contract = opnet.getContract(
        this.contractAddress,
        RWA_VAULT_ABI,
        provider,
        NETWORK,
      ) as unknown as RWAVaultContract;

      const result = await contract.balanceOf(address, BigInt(tokenId));
      return result.properties.balance ?? 0n;
    } catch {
      return 0n;
    }
  }

  async collectFee(txValue: bigint): Promise<bigint> {
    if (isPendingAddress(this.contractAddress)) {
      return computeMockFee(txValue);
    }

    try {
      const opnet = await import('opnet');
      const btcBitcoin = await import('@btc-vision/bitcoin');

      const NETWORK =
        this.network === 'testnet'
          ? btcBitcoin.networks.opnetTestnet
          : btcBitcoin.networks.bitcoin;

      const provider = new opnet.JSONRpcProvider({ url: RPC_URL, network: NETWORK });
      const contract = opnet.getContract(
        this.contractAddress,
        RWA_VAULT_ABI,
        provider,
        NETWORK,
      ) as unknown as RWAVaultContract;

      const result = await contract.collectFee(txValue);
      return result.properties.fee ?? computeMockFee(txValue);
    } catch {
      return computeMockFee(txValue);
    }
  }

  async isWhitelisted(_address: string): Promise<boolean> {
    // Testnet: whitelist is disabled — always return true
    return true;
  }

  /**
   * Update the simulated demand factor (admin only in production).
   * @param scaledValue - Value in [0, 1000]: 500 = neutral
   */
  setDemandFactor(scaledValue: number): void {
    demandFactorScaled = Math.max(0, Math.min(1000, scaledValue));
  }
}

/**
 * RWAVaultAdapter — mock implementation (no OPNet calls).
 * Kept for backwards compatibility. Prefer OPNetRWAVaultAdapter.
 */
export class RWAVaultAdapter implements IContractAdapter {
  private readonly network: 'testnet' | 'mainnet';

  constructor(network: 'testnet' | 'mainnet' = 'testnet') {
    this.network = network;
  }

  async mint(assetId: string, amount: bigint): Promise<TxResult> {
    const tokenId = ASSET_TOKEN_IDS[assetId];
    if (tokenId === undefined) {
      return { txId: '', status: 'FAILED', error: `Unknown asset: ${assetId}` };
    }
    const txId = generateMockTxId();
    setTimeout(() => {
      console.log(
        `[RWAVaultAdapter] mock mint: ${assetId} x${amount} (${txId})`,
      );
    }, 3000);
    return { txId, status: 'PENDING' };
  }

  async burn(assetId: string, _amount: bigint): Promise<TxResult> {
    const tokenId = ASSET_TOKEN_IDS[assetId];
    if (tokenId === undefined) {
      return { txId: '', status: 'FAILED', error: `Unknown asset: ${assetId}` };
    }
    return { txId: generateMockTxId(), status: 'PENDING' };
  }

  async transfer(to: string, assetId: string, _amount: bigint): Promise<TxResult> {
    if (this.network === 'mainnet') {
      const eligible = await this.isWhitelisted(to);
      if (!eligible) {
        return { txId: '', status: 'FAILED', error: 'Recipient not whitelisted' };
      }
    }
    const tokenId = ASSET_TOKEN_IDS[assetId];
    if (tokenId === undefined) {
      return { txId: '', status: 'FAILED', error: `Unknown asset: ${assetId}` };
    }
    return { txId: generateMockTxId(), status: 'PENDING' };
  }

  async balanceOf(address: string, assetId: string): Promise<bigint> {
    const addrMap = getOrCreateBalance(address);
    return addrMap.get(assetId) ?? 0n;
  }

  async collectFee(txValue: bigint): Promise<bigint> {
    return computeMockFee(txValue);
  }

  async isWhitelisted(_address: string): Promise<boolean> {
    if (this.network === 'testnet') return true;
    return false;
  }
}

/**
 * TestAdapter — returns predictable mock values for unit tests.
 * No network calls, no async delay.
 */
export class TestAdapter implements IContractAdapter {
  async mint(_assetId: string, _amount: bigint): Promise<TxResult> {
    return { txId: 'test_tx_mint', status: 'SETTLED' };
  }

  async burn(_assetId: string, _amount: bigint): Promise<TxResult> {
    return { txId: 'test_tx_burn', status: 'SETTLED' };
  }

  async transfer(_to: string, _assetId: string, _amount: bigint): Promise<TxResult> {
    return { txId: 'test_tx_transfer', status: 'SETTLED' };
  }

  async balanceOf(_address: string, _assetId: string): Promise<bigint> {
    return 100n;
  }

  async collectFee(txValue: bigint): Promise<bigint> {
    const pctFee = (txValue * 250n) / 100000n;
    return pctFee > 1000n ? pctFee : 1000n;
  }

  async isWhitelisted(_address: string): Promise<boolean> {
    return true;
  }
}
