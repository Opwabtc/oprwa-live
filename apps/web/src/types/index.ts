export type AssetCategory = 'real_estate' | 'fixed_income' | 'commodity';

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  nav: number;
  yield_pct: number;
  total_fractions: number;
  available_fractions: number;
  spread: number;
  demand_factor: number;
  price_per_fraction: number;
  token_id: number;
}

export type TxStatus = 'PENDING' | 'SETTLED' | 'FAILED';

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

export interface PriceQuote {
  asset_id: string;
  amount: number;
  price_per_fraction: number;
  total_price: number;
  fee: number;
  total_cost: number;
  demand_factor: number;
  spread: number;
}

export interface User {
  address: string;
  connected: boolean;
  verified: boolean;
  network: 'testnet' | 'mainnet';
}
