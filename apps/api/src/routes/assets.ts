import { Hono } from 'hono';
import { getAllAssets, getAssetById } from '../lib/state.js';

const assetsRouter = new Hono();

assetsRouter.get('/assets', (c) => {
  const assets = getAllAssets();
  return c.json(assets);
});

assetsRouter.get('/assets/:id', (c) => {
  const id = c.req.param('id');
  const asset = getAssetById(id);
  if (asset === undefined) {
    return c.json({ error: 'Asset not found', asset_id: id }, 404);
  }
  return c.json(asset);
});

export default assetsRouter;
