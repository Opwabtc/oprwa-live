/**
 * RWAVaultAdapter — mock implementation of IContractAdapter.
 * Returns simulated values without real OPNet calls.
 * Replace with real walletconnect implementation on mainnet.
 */

import type { IContractAdapter, TxResult } from './IContractAdapter.js';

// Asset ID to token ID mapping (mirrors contract tokenIds)
const ASSET_TOKEN_IDS: Record<string, number> = {
  'sp-commercial-tower': 0,
  'us-tbill-fund': 1,
  'gold-vault-reserve': 2,
};

// Simulated balances: address → assetId → amount
const balances = new Map<string, Map<string, bigint>>();

// Simulated whitelist
const whitelisted = new Set<string>();

// Simulated demand factor (scaled 0–1000, 500 = neutral)
let demandFactorScaled = 500;

/**
 * Compute fee mirroring the contract's collectFee() logic.
 * scaledFactor in [0, 1000]: 500 = neutral
 */
function computeContractFee(txValue: bigint): bigint {
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

function generateTxId(): string {
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
    const txId = generateTxId();
    // Simulate async settlement
    setTimeout(() => {
      // In real impl, the wallet signs and the chain confirms
      console.log(`[RWAVaultAdapter] mint settled: ${assetId} x${amount} (${txId})`);
    }, 3000);
    return { txId, status: 'PENDING' };
  }

  async burn(assetId: string, amount: bigint): Promise<TxResult> {
    const tokenId = ASSET_TOKEN_IDS[assetId];
    if (tokenId === undefined) {
      return { txId: '', status: 'FAILED', error: `Unknown asset: ${assetId}` };
    }
    const txId = generateTxId();
    return { txId, status: 'PENDING' };
  }

  async transfer(to: string, assetId: string, amount: bigint): Promise<TxResult> {
    // Whitelist check on mainnet
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
    const txId = generateTxId();
    return { txId, status: 'PENDING' };
  }

  async balanceOf(address: string, assetId: string): Promise<bigint> {
    const addrMap = getOrCreateBalance(address);
    return addrMap.get(assetId) ?? 0n;
  }

  async collectFee(txValue: bigint): Promise<bigint> {
    return computeContractFee(txValue);
  }

  async isWhitelisted(address: string): Promise<boolean> {
    // Testnet: always true
    if (this.network === 'testnet') return true;
    return whitelisted.has(address);
  }

  /**
   * Update the simulated demand factor (admin only in prod).
   * scaledValue in [0, 1000]: 500 = neutral
   */
  setDemandFactor(scaledValue: number): void {
    demandFactorScaled = Math.max(0, Math.min(1000, scaledValue));
  }
}

/**
 * TestAdapter — returns predictable mock values for unit tests.
 * No network, no async delay.
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
    // Neutral demand factor (500): bps = 250, fee = txValue * 250 / 100000
    const pctFee = (txValue * 250n) / 100000n;
    return pctFee > 1000n ? pctFee : 1000n;
  }

  async isWhitelisted(_address: string): Promise<boolean> {
    return true;
  }
}
