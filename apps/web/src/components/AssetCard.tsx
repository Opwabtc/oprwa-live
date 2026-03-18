import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BuyModal } from './BuyModal';
import type { Asset } from '@/types';

const CATEGORY_LABELS: Record<string, string> = {
  real_estate: 'Real Estate',
  fixed_income: 'Fixed Income',
  commodity: 'Commodity',
};

interface AssetCardProps {
  asset: Asset;
  index?: number;
}

export function AssetCard({ asset, index = 0 }: AssetCardProps): React.JSX.Element {
  const [buyOpen, setBuyOpen] = useState(false);

  const availablePct = ((asset.available_fractions / asset.total_fractions) * 100).toFixed(1);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: index * 0.08,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="asset-card glass-card glass-card--hoverable"
      >
        <div className="asset-card__header">
          <span className="badge badge--category">
            {CATEGORY_LABELS[asset.category] ?? asset.category}
          </span>
          <span className="asset-card__yield">
            {asset.yield_pct}% APY
          </span>
        </div>

        <h3 className="asset-card__name">{asset.name}</h3>

        <div className="asset-card__stats">
          <div className="asset-card__stat">
            <span className="asset-card__stat-label">Price / Fraction</span>
            <span className="asset-card__stat-value tabular-nums" style={{ fontFamily: 'var(--font-mono)' }}>
              {asset.price_per_fraction.toLocaleString('en-US')} sats
            </span>
          </div>
          <div className="asset-card__stat">
            <span className="asset-card__stat-label">Available</span>
            <span className="asset-card__stat-value tabular-nums">{availablePct}%</span>
          </div>
        </div>

        <div className="asset-card__demand">
          <span className="asset-card__demand-label">Market</span>
          <span
            className="asset-card__demand-value tabular-nums"
            style={{
              color:
                asset.demand_factor > 0
                  ? 'var(--accent)'
                  : asset.demand_factor < 0
                    ? 'var(--danger)'
                    : 'var(--text-muted)',
            }}
          >
            {asset.demand_factor > 0 ? '+' : ''}
            {(asset.demand_factor * 100).toFixed(2)}%
          </span>
        </div>

        <div className="asset-card__actions">
          <Link
            to={`/asset/${asset.id}`}
            className="btn btn--secondary btn--sm"
            aria-label={`View details for ${asset.name}`}
          >
            Details
          </Link>
          <button
            className="btn btn--primary btn--sm"
            onClick={() => setBuyOpen(true)}
            aria-label={`Buy fractions of ${asset.name}`}
          >
            Buy
          </button>
        </div>
      </motion.div>

      <BuyModal open={buyOpen} onClose={() => setBuyOpen(false)} asset={asset} />
    </>
  );
}
