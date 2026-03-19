import { Hono } from 'hono';
import { getAssetById } from '../lib/state.js';
import { computeFee } from '../lib/pricing.js';

const priceRouter = new Hono();

priceRouter.get('/price/:assetId', (c) => {
  const assetId = c.req.param('assetId');
  const amountParam = c.req.query('amount');
  const amount = amountParam !== undefined ? parseInt(amountParam, 10) : 1;

  if (isNaN(amount) || amount < 1 || amount > 1_000_000 || !Number.isInteger(amount)) {
    return c.json({ error: 'Invalid amount parameter' }, 400);
  }

  const asset = getAssetById(assetId);
  if (asset === undefined) {
    return c.json({ error: 'Asset not found', asset_id: assetId }, 404);
  }

  const totalValue = asset.price_per_fraction * amount;
  const fee = computeFee(totalValue, asset.demand_factor);

  return c.json({
    asset_id: assetId,
    amount,
    price_per_fraction: asset.price_per_fraction,
    total_price: totalValue,
    fee,
    total_cost: totalValue + fee,
    demand_factor: asset.demand_factor,
    spread: asset.spread,
  });
});

export default priceRouter;
