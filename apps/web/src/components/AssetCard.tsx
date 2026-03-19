import React, { useRef, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BuyModal } from './BuyModal';
import { ScrambleText } from './ScrambleText';
import { useBTCPrice } from '@/hooks/useBTCPrice';
import type { Asset } from '@/types';

const CATEGORY_LABELS: Record<string, string> = {
  real_estate: 'Real Estate',
  fixed_income: 'Fixed Income',
  commodity: 'Commodity',
};

const CATEGORY_BADGE_CLASS: Record<string, string> = {
  real_estate: 'badge--real-estate',
  fixed_income: 'badge--fixed-income',
  commodity: 'badge--commodity',
};

interface AssetCardProps {
  asset: Asset;
  index?: number;
}

export function AssetCard({ asset, index = 0 }: AssetCardProps): React.JSX.Element {
  const [buyOpen, setBuyOpen] = useState(false);
  const [showUSD, setShowUSD] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { price: btcPrice } = useBTCPrice();

  const availablePct = ((asset.available_fractions / asset.total_fractions) * 100).toFixed(1);

  const usdPrice = btcPrice !== null
    ? ((asset.price_per_fraction / 100_000_000) * btcPrice).toFixed(2)
    : null;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    el.style.transform = `perspective(900px) rotateX(${-dy * 6}deg) rotateY(${dx * 6}deg) translateZ(6px)`;
    el.style.setProperty('--mx', (((e.clientX - rect.left) / rect.width) * 100).toFixed(1));
    el.style.setProperty('--my', (((e.clientY - rect.top) / rect.height) * 100).toFixed(1));
  }, []);

  const handleMouseLeave = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = '';
    el.style.setProperty('--mx', '50');
    el.style.setProperty('--my', '50');
  }, []);

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
        className="asset-card-wrapper"
      >
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="asset-card glass-card glass-card--hoverable"
        >
          <div className="asset-card__header">
            <span className={`badge ${CATEGORY_BADGE_CLASS[asset.category] ?? 'badge--category'}`}>
              {CATEGORY_LABELS[asset.category] ?? asset.category}
            </span>
            <span className="asset-card__yield">
              {asset.yield_pct}% APY
            </span>
          </div>

          <h3 className="asset-card__name">
            <ScrambleText steps={8} speed={28}>{asset.name}</ScrambleText>
          </h3>

          <div className="asset-card__stats">
            <div
              className="asset-card__stat asset-card__stat--price"
              onClick={() => setShowUSD((v) => !v)}
              title={showUSD ? 'Show sats' : 'Show USD'}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') setShowUSD((v) => !v); }}
              aria-label="Toggle price currency"
            >
              <span className="asset-card__stat-label">Price / Fraction</span>
              <span
                className="asset-card__stat-value tabular-nums"
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: showUSD ? 'var(--success)' : undefined,
                  transition: 'color 0.2s ease',
                }}
              >
                {showUSD && usdPrice !== null
                  ? `≈ $${usdPrice}`
                  : `${asset.price_per_fraction.toLocaleString('en-US')} sats`}
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
                      : 'var(--text-2)',
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
        </div>
      </motion.div>

      <BuyModal open={buyOpen} onClose={() => setBuyOpen(false)} asset={asset} />
    </>
  );
}
