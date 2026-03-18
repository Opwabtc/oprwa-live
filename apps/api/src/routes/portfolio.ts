import { Hono } from 'hono';
import {
  getPortfolio,
  getAssetById,
  addTransaction,
  settleTransaction,
} from '../lib/state.js';
import { computeFee } from '../lib/pricing.js';
import type { Transaction } from '../lib/state.js';

const portfolioRouter = new Hono();

portfolioRouter.get('/portfolio/:wallet', (c) => {
  const wallet = c.req.param('wallet');
  if (!wallet || wallet.length < 10) {
    return c.json({ error: 'Invalid wallet address' }, 400);
  }
  const positions = getPortfolio(wallet);
  return c.json(positions);
});

portfolioRouter.post('/buy', async (c) => {
  let body: { assetId?: string; amount?: number; wallet?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const { assetId, amount, wallet } = body;

  if (!assetId || typeof assetId !== 'string') {
    return c.json({ error: 'assetId is required' }, 400);
  }
  if (!amount || typeof amount !== 'number' || amount < 1) {
    return c.json({ error: 'amount must be a positive number' }, 400);
  }
  if (!wallet || typeof wallet !== 'string' || wallet.length < 10) {
    return c.json({ error: 'wallet address is required' }, 400);
  }

  const asset = getAssetById(assetId);
  if (asset === undefined) {
    return c.json({ error: 'Asset not found', asset_id: assetId }, 404);
  }

  const price_per_fraction = asset.price_per_fraction;
  const total_price = price_per_fraction * amount;
  const fee = computeFee(total_price, asset.demand_factor);
  const total_cost = total_price + fee;
  const now = Date.now();
  const txId = `tx_${now}_${Math.random().toString(36).slice(2, 9)}`;

  const tx: Transaction = {
    id: txId,
    asset_id: assetId,
    token_id: asset.token_id,
    amount,
    price_per_fraction,
    total_price,
    fee,
    total_cost,
    wallet,
    status: 'PENDING',
    created_at: now,
  };

  addTransaction(tx);

  // Settle asynchronously after 3 seconds
  const delay = 2000 + Math.random() * 3000;
  setTimeout(() => {
    settleTransaction(txId);
  }, delay);

  return c.json({
    tx_id: txId,
    status: 'PENDING',
    asset_id: assetId,
    amount,
    price_per_fraction,
    total_price,
    fee,
    total_cost,
    created_at: now,
  });
});

export default portfolioRouter;
