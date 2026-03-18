import type { Asset, Position, PriceQuote } from '@/types';
import { OPNetRWAVaultAdapter, CONTRACT_ADDRESS } from '@oprwa/contracts';

// --- Asset metadata (static, deterministic) ---

interface AssetMeta {
  id: string;
  name: string;
  tokenId: number;
  yield_pct: number;
  category: Asset['category'];
  location: string;
  nav: number;
  spread: number;
}

const ASSET_META: AssetMeta[] = [
  {
    id: 'sp-commercial-tower',
    name: 'Sao Paulo Commercial Tower',
    tokenId: 0,
    yield_pct: 12,
    category: 'real_estate',
    location: 'Sao Paulo, BR',
    nav: 1000,
    spread: 2.0,
  },
  {
    id: 'us-tbill-fund',
    name: 'US T-Bill Fund',
    tokenId: 1,
    yield_pct: 5.2,
    category: 'fixed_income',
    location: 'United States',
    nav: 1000,
    spread: 1.5,
  },
  {
    id: 'gold-vault-reserve',
    name: 'Gold Vault Reserve',
    tokenId: 2,
    yield_pct: 8.5,
    category: 'commodity',
    location: 'Switzerland',
    nav: 1000,
    spread: 2.5,
  },
];

const MAX_SUPPLY = 1_000_000n; // matches contract deployment
const PRICE_PER_FRACTION = 1000; // sats per fraction — fixed in contract

function getAdapter(): OPNetRWAVaultAdapter {
  const envAddress: string | undefined =
    typeof import.meta.env !== 'undefined'
      ? (import.meta.env['VITE_CONTRACT_ADDRESS'] as string | undefined)
      : undefined;
  return new OPNetRWAVaultAdapter(envAddress ?? CONTRACT_ADDRESS, 'testnet');
}

/**
 * Fetch all assets — data sourced from on-chain totalSupplyOf() calls.
 * Static metadata (name, yield, category) is deterministic from the deployment spec.
 */
export async function fetchAssets(): Promise<Asset[]> {
  const adapter = getAdapter();

  const assets = await Promise.all(
    ASSET_META.map(async (meta) => {
      try {
        const supply = await adapter.totalSupplyOf(meta.tokenId);
        const available = MAX_SUPPLY > supply ? MAX_SUPPLY - supply : 0n;

        // Derive demand factor from supply: neutral (0) when supply is low
        // When more than 50% is sold, demand_factor > 0
        const soldRatio = Number(supply) / Number(MAX_SUPPLY);
        const demandFactor = soldRatio > 0.5 ? (soldRatio - 0.5) * 2 : 0;

        return {
          id: meta.id,
          name: meta.name,
          category: meta.category,
          nav: meta.nav,
          yield_pct: meta.yield_pct,
          total_fractions: Number(MAX_SUPPLY),
          available_fractions: Number(available),
          spread: meta.spread,
          demand_factor: demandFactor,
          price_per_fraction: PRICE_PER_FRACTION,
          token_id: meta.tokenId,
        } satisfies Asset;
      } catch {
        // Return asset with full availability if contract call fails
        return {
          id: meta.id,
          name: meta.name,
          category: meta.category,
          nav: meta.nav,
          yield_pct: meta.yield_pct,
          total_fractions: Number(MAX_SUPPLY),
          available_fractions: Number(MAX_SUPPLY),
          spread: meta.spread,
          demand_factor: 0,
          price_per_fraction: PRICE_PER_FRACTION,
          token_id: meta.tokenId,
        } satisfies Asset;
      }
    })
  );

  return assets;
}

/**
 * Fetch a single asset by ID.
 */
export async function fetchAsset(id: string): Promise<Asset> {
  const assets = await fetchAssets();
  const asset = assets.find((a) => a.id === id);
  if (!asset) throw new Error(`Asset not found: ${id}`);
  return asset;
}

/**
 * Compute price quote using on-chain fee calculation.
 * Falls back to local deterministic formula if network call fails.
 */
export async function fetchPrice(assetId: string, amount: number): Promise<PriceQuote> {
  const meta = ASSET_META.find((m) => m.id === assetId);
  if (!meta) throw new Error(`Unknown asset: ${assetId}`);

  const totalPrice = amount * PRICE_PER_FRACTION;
  const adapter = getAdapter();

  let fee: number;
  try {
    const feeResult = await adapter.collectFee(BigInt(totalPrice));
    fee = Number(feeResult);
  } catch {
    // Local deterministic fallback: 2.5% fee minimum 1000 sats
    const pctFee = Math.round(totalPrice * 0.025);
    fee = pctFee > 1000 ? pctFee : 1000;
  }

  return {
    asset_id: assetId,
    amount,
    price_per_fraction: PRICE_PER_FRACTION,
    total_price: totalPrice,
    fee,
    total_cost: totalPrice + fee,
    demand_factor: 0,
    spread: meta.spread,
  };
}

/**
 * Fetch portfolio positions for a wallet from on-chain balances.
 */
export async function fetchPortfolio(wallet: string): Promise<Position[]> {
  // M-02 fix: validate wallet address format before passing to contract calls.
  // OPNet testnet addresses are bech32 starting with "opt1" or "tb1". Bitcoin mainnet: "bc1".
  if (!wallet) return [];
  const isValidAddress = /^(opt1|tb1|bc1)[a-z0-9]{25,87}$/.test(wallet);
  if (!isValidAddress) return [];

  const adapter = getAdapter();
  const now = Date.now();

  const results = await Promise.allSettled(
    ASSET_META.map(async (meta) => {
      const balance = await adapter.balanceOf(wallet, meta.id);
      if (balance === 0n) return null;

      const pos: Position = {
        id: `pos_${meta.id}_${wallet.slice(-8)}`,
        asset_id: meta.id,
        token_id: meta.tokenId,
        amount: Number(balance),
        entry_price: PRICE_PER_FRACTION,
        current_price: PRICE_PER_FRACTION,
        pnl: 0,
        pnl_pct: 0,
        status: 'SETTLED',
        created_at: now,
      };
      return pos;
    })
  );

  const positions: Position[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value !== null) {
      positions.push(result.value);
    }
  }
  return positions;
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
 * Uses OPNetRWAVaultAdapter directly — no localhost API server required.
 * Flow: simulate -> sendTransaction (signer: null — wallet signs)
 *
 * Both explorer links are shown on success:
 *   - Mempool: https://mempool.opnet.org/testnet4/tx/{txid}
 *   - OPScan:  https://opscan.org/transactions/{txid}?network=testnet
 */
export async function postBuy(req: BuyRequest): Promise<BuyResponse> {
  const adapter = getAdapter();
  const result = await adapter.mint(req.assetId, BigInt(req.amount), req.wallet);

  if (result.status === 'FAILED') {
    const friendlyMsg = friendlyError(result.error);
    throw new Error(friendlyMsg);
  }

  const totalPrice = req.amount * PRICE_PER_FRACTION;
  let fee: number;
  try {
    const feeResult = await adapter.collectFee(BigInt(totalPrice));
    fee = Number(feeResult);
  } catch {
    const pctFee = Math.round(totalPrice * 0.025);
    fee = pctFee > 1000 ? pctFee : 1000;
  }

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
    price_per_fraction: PRICE_PER_FRACTION,
    total_price: totalPrice,
    fee,
    total_cost: totalPrice + fee,
    created_at: Date.now(),
  };
}

/**
 * Map contract error messages to user-friendly strings.
 */
function friendlyError(raw?: string): string {
  if (!raw) return 'Transaction failed. Please check your wallet.';
  if (raw.includes('insufficient') || raw.includes('balance'))
    return 'Insufficient balance. Make sure you have enough BTC to cover the transaction.';
  if (raw.includes('whitelist'))
    return 'Your address is not whitelisted for this asset.';
  if (raw.includes('sold out') || raw.includes('supply'))
    return 'This asset is sold out. No fractions available.';
  if (raw.includes('rejected') || raw.includes('denied'))
    return 'Transaction rejected in wallet. Please approve the transaction.';
  // M-03 fix: do not leak raw contract error strings to UI — they may contain
  // internal state, storage pointers, or SDK internals useful to an attacker.
  console.error('[oprwa] contract error (hidden from UI):', raw);
  return 'Transaction failed. Please try again or contact support.';
}
