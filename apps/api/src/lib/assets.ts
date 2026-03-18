export type AssetCategory = 'real_estate' | 'fixed_income' | 'commodity';

export interface AssetBase {
  id: string;
  name: string;
  category: AssetCategory;
  nav: number;
  yield_pct: number;
  total_fractions: number;
  available_fractions: number;
  spread: number;
  token_id: number;
}

export interface Asset extends AssetBase {
  demand_factor: number;
  price_per_fraction: number;
}

export const MOCK_ASSETS: AssetBase[] = [
  {
    id: 'sp-commercial-tower',
    name: 'São Paulo Commercial Tower',
    category: 'real_estate',
    nav: 100000000,
    yield_pct: 8.4,
    total_fractions: 10000,
    available_fractions: 8743,
    spread: 0.02,
    token_id: 0,
  },
  {
    id: 'us-tbill-fund',
    name: 'US T-Bill Fund',
    category: 'fixed_income',
    nav: 50000000,
    yield_pct: 5.2,
    total_fractions: 5000,
    available_fractions: 4210,
    spread: 0.015,
    token_id: 1,
  },
  {
    id: 'gold-vault-reserve',
    name: 'Gold Vault Reserve',
    category: 'commodity',
    nav: 75000000,
    yield_pct: 3.1,
    total_fractions: 7500,
    available_fractions: 6100,
    spread: 0.025,
    token_id: 2,
  },
];
