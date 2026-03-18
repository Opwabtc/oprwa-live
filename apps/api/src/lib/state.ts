import { computeDemandFactor, computePrice, toScaled } from './pricing.js';
import { MOCK_ASSETS } from './assets.js';
import type { Asset, AssetBase } from './assets.js';

export type TxStatus = 'PENDING' | 'SETTLED' | 'FAILED';

export interface DemandState {
  buys: number;
  sells: number;
  liquidity: number;
}

export interface Position {
  id: string;
  asset_id: string;
  token_id: number;
  amount: number;
  entry_price: number;
  current_price: number;
  pnl: number;
  pnl_pct: number;
  status: TxStatus;
  created_at: number;
  settled_at?: number;
}

export interface Transaction {
  id: string;
  asset_id: string;
  token_id: number;
  amount: number;
  price_per_fraction: number;
  total_price: number;
  fee: number;
  total_cost: number;
  wallet: string;
  status: TxStatus;
  created_at: number;
  settled_at?: number;
}

// Simulated demand state — updates on buy
const demandState: Map<string, DemandState> = new Map([
  ['sp-commercial-tower', { buys: 4200000, sells: 1000000, liquidity: 50000000 }],
  ['us-tbill-fund', { buys: 6800000, sells: 2000000, liquidity: 50000000 }],
  ['gold-vault-reserve', { buys: 3100000, sells: 1500000, liquidity: 50000000 }],
]);

// Portfolio: wallet address → positions
const portfolio: Map<string, Position[]> = new Map();

// All transactions
const transactions: Map<string, Transaction> = new Map();

export function getDemandState(assetId: string): DemandState | undefined {
  return demandState.get(assetId);
}

export function updateDemandState(assetId: string, buyVolume: number): void {
  const current = demandState.get(assetId);
  if (current === undefined) return;
  demandState.set(assetId, {
    ...current,
    buys: current.buys + buyVolume,
  });
}

export function getEnrichedAsset(base: AssetBase): Asset {
  const demand = demandState.get(base.id);
  const demandFactor =
    demand !== undefined
      ? computeDemandFactor(demand.buys, demand.sells, demand.liquidity)
      : 0;

  const navPerFraction = base.nav / base.total_fractions;
  const price_per_fraction = computePrice(navPerFraction, base.spread, demandFactor);

  return {
    ...base,
    demand_factor: demandFactor,
    price_per_fraction,
  };
}

export function getAllAssets(): Asset[] {
  return MOCK_ASSETS.map(getEnrichedAsset);
}

export function getAssetById(id: string): Asset | undefined {
  const base = MOCK_ASSETS.find((a) => a.id === id);
  if (base === undefined) return undefined;
  return getEnrichedAsset(base);
}

export function getPortfolio(wallet: string): Position[] {
  // Refresh current_price, pnl, pnl_pct on every read
  const positions = portfolio.get(wallet) ?? [];
  return positions.map((pos) => {
    const asset = getAssetById(pos.asset_id);
    const current_price = asset?.price_per_fraction ?? pos.entry_price;
    const pnl = (current_price - pos.entry_price) * pos.amount;
    const pnl_pct =
      pos.entry_price > 0
        ? ((current_price - pos.entry_price) / pos.entry_price) * 100
        : 0;
    return { ...pos, current_price, pnl, pnl_pct };
  });
}

export function addTransaction(tx: Transaction): void {
  transactions.set(tx.id, tx);
}

export function getTransaction(id: string): Transaction | undefined {
  return transactions.get(id);
}

export function settleTransaction(txId: string): void {
  const tx = transactions.get(txId);
  if (tx === undefined) return;

  const now = Date.now();
  const settled: Transaction = { ...tx, status: 'SETTLED', settled_at: now };
  transactions.set(txId, settled);

  // Add position to portfolio
  const asset = getAssetById(tx.asset_id);
  const current_price = asset?.price_per_fraction ?? tx.price_per_fraction;

  const position: Position = {
    id: `pos_${txId}`,
    asset_id: tx.asset_id,
    token_id: tx.token_id,
    amount: tx.amount,
    entry_price: tx.price_per_fraction,
    current_price,
    pnl: 0,
    pnl_pct: 0,
    status: 'SETTLED',
    created_at: tx.created_at,
    settled_at: now,
  };

  const walletPositions = portfolio.get(tx.wallet) ?? [];
  walletPositions.push(position);
  portfolio.set(tx.wallet, walletPositions);

  // Update demand state — increase buys by total purchase value
  updateDemandState(tx.asset_id, tx.total_price);
}

export function getDemandFactorScaled(assetId: string): number {
  const demand = demandState.get(assetId);
  if (demand === undefined) return 500;
  const df = computeDemandFactor(demand.buys, demand.sells, demand.liquidity);
  return toScaled(df);
}
