import type { Asset, Position, PriceQuote } from '@/types';
import { OPNetRWAVaultAdapter, CONTRACT_ADDRESS } from '@oprwa/contracts';

const API_BASE = '/api';

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Network error' }));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchAssets(): Promise<Asset[]> {
  return fetchJSON<Asset[]>(`${API_BASE}/assets`);
}

export async function fetchAsset(id: string): Promise<Asset> {
  return fetchJSON<Asset>(`${API_BASE}/assets/${id}`);
}

export async function fetchPrice(assetId: string, amount: number): Promise<PriceQuote> {
  return fetchJSON<PriceQuote>(`${API_BASE}/price/${assetId}?amount=${amount}`);
}

export async function fetchPortfolio(wallet: string): Promise<Position[]> {
  return fetchJSON<Position[]>(`${API_BASE}/portfolio/${wallet}`);
}

export interface BuyRequest {
  assetId: string;
  amount: number;
  wallet: string;
}

export interface BuyResponse {
  tx_id: string;
  status: 'PENDING';
  asset_id: string;
  amount: number;
  price_per_fraction: number;
  total_price: number;
  fee: number;
  total_cost: number;
  created_at: number;
}

/**
 * Submit a purchase of RWA fractions.
 *
 * Uses OPNetRWAVaultAdapter directly — bypasses the localhost API server.
 * When CONTRACT_ADDRESS is 'PENDING', the adapter returns a mock tx_id
 * so the UI can be fully developed before the contract is deployed.
 *
 * Both explorer links are logged on success:
 *   - Mempool: https://mempool.opnet.org/testnet4/tx/{txid}
 *   - OPScan:  https://opscan.org/transactions/{txid}?network=testnet
 */
export async function postBuy(req: BuyRequest): Promise<BuyResponse> {
  const envAddress: string | undefined =
    typeof import.meta.env !== 'undefined'
      ? (import.meta.env['VITE_CONTRACT_ADDRESS'] as string | undefined)
      : undefined;
  const contractAddress = envAddress ?? CONTRACT_ADDRESS;

  const adapter = new OPNetRWAVaultAdapter(contractAddress, 'testnet');
  const result = await adapter.mint(req.assetId, BigInt(req.amount), req.wallet);

  if (result.status === 'FAILED') {
    throw new Error(result.error ?? 'Transaction failed');
  }

  // Fee estimate: approximate using amount × 1000 sats (1 fraction = 1000 sats base price)
  const satAmount = BigInt(req.amount) * 1000n;
  const fee = await adapter.collectFee(satAmount);

  const totalPrice = req.amount * 1000;
  const feeNum = Number(fee);

  if (result.txId !== '' && !result.txId.startsWith('mock_')) {
    const mempoolUrl = `https://mempool.opnet.org/testnet4/tx/${result.txId}`;
    const opscanUrl = `https://opscan.org/transactions/${result.txId}?network=testnet`;
    console.info('[postBuy] Transaction submitted:');
    console.info(`  Mempool: ${mempoolUrl}`);
    console.info(`  OPScan:  ${opscanUrl}`);
  }

  return {
    tx_id: result.txId,
    status: 'PENDING',
    asset_id: req.assetId,
    amount: req.amount,
    price_per_fraction: 1000,
    total_price: totalPrice,
    fee: feeNum,
    total_cost: totalPrice + feeNum,
    created_at: Date.now(),
  };
}
