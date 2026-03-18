import type { Asset, Position, PriceQuote } from '@/types';

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

export async function postBuy(req: BuyRequest): Promise<BuyResponse> {
  const res = await fetch(`${API_BASE}/buy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Network error' }));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<BuyResponse>;
}
