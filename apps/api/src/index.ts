import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import assetsRouter from './routes/assets.js';
import priceRouter from './routes/price.js';
import portfolioRouter from './routes/portfolio.js';

const app = new Hono();

app.use(
  '/*',
  cors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  })
);

app.route('/api', assetsRouter);
app.route('/api', priceRouter);
app.route('/api', portfolioRouter);

app.get('/', (c) => {
  return c.json({
    name: 'OPRWA API',
    version: '1.0.0',
    endpoints: [
      'GET /api/assets',
      'GET /api/assets/:id',
      'GET /api/price/:assetId?amount=N',
      'GET /api/portfolio/:wallet',
      'POST /api/buy',
    ],
  });
});

const port = 3001;

console.log(`OPRWA API running on http://localhost:${port}`);

serve({ fetch: app.fetch, port });

export default app;
