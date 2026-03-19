import React from 'react';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchAsset } from '@/lib/api';
import { usePricing } from '@/hooks/usePricing';
import { BuyModal } from '@/components/BuyModal';
import type { Asset } from '@/types';

const CATEGORY_LABELS: Record<string, string> = {
  real_estate: 'Real Estate',
  fixed_income: 'Fixed Income',
  commodity: 'Commodity',
};

export function AssetDetail(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buyOpen, setBuyOpen] = useState(false);
  const [fractions, setFractions] = useState(1);
  const { quote, loading: quoteLoading } = usePricing(id ?? '', fractions);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchAsset(id)
      .then((data) => {
        setAsset(data);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load asset');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="page container">
        <div className="asset-detail-skeleton" aria-busy="true" aria-label="Loading asset">
          <div className="skeleton-block skeleton-block--title" />
          <div className="skeleton-block skeleton-block--body" />
          <div className="skeleton-block skeleton-block--body" />
        </div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="page container">
        <div className="error-state" role="alert">
          <p>{error ?? 'Asset not found'}</p>
          <Link to="/marketplace" className="btn btn--secondary btn--md">
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const availablePct = ((asset.available_fractions / asset.total_fractions) * 100).toFixed(1);

  return (
    <div className="page asset-detail-page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/marketplace" className="breadcrumb__link">Markets</Link>
          <span className="breadcrumb__sep" aria-hidden="true">/</span>
          <span className="breadcrumb__current">{asset.name}</span>
        </div>

        <div className="asset-detail__layout">
          {/* Left: Info */}
          <div className="asset-detail__info">
            <div className="asset-detail__header">
              <span className="badge badge--category">
                {CATEGORY_LABELS[asset.category] ?? asset.category}
              </span>
              <span className="asset-detail__yield">{asset.yield_pct}% APY</span>
            </div>

            <h1 className="asset-detail__name">{asset.name}</h1>

            <div className="asset-detail__stats glass-card">
              <div className="asset-detail__stat">
                <span className="asset-detail__stat-label">NAV (total)</span>
                <span className="asset-detail__stat-value tabular-nums">
                  ${(asset.nav / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="asset-detail__stat">
                <span className="asset-detail__stat-label">Price / Fraction</span>
                <span className="asset-detail__stat-value tabular-nums">
                  {asset.price_per_fraction.toLocaleString('en-US')} sats
                </span>
              </div>
              <div className="asset-detail__stat">
                <span className="asset-detail__stat-label">Total Fractions</span>
                <span className="asset-detail__stat-value tabular-nums">
                  {asset.total_fractions.toLocaleString('en-US')}
                </span>
              </div>
              <div className="asset-detail__stat">
                <span className="asset-detail__stat-label">Available</span>
                <span className="asset-detail__stat-value tabular-nums">
                  {asset.available_fractions.toLocaleString('en-US')} ({availablePct}%)
                </span>
              </div>
              <div className="asset-detail__stat">
                <span className="asset-detail__stat-label">Spread</span>
                <span className="asset-detail__stat-value tabular-nums">
                  {(asset.spread * 100).toFixed(1)}%
                </span>
              </div>
              <div className="asset-detail__stat">
                <span className="asset-detail__stat-label">Market Pressure</span>
                <span
                  className="asset-detail__stat-value tabular-nums"
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
            </div>
          </div>

          {/* Right: Buy Panel */}
          <div className="asset-detail__buy glass-card">
            <h2 className="asset-detail__buy-title">Buy Fractions</h2>

            <div className="buy-panel__field">
              <label htmlFor="buy-amount" className="buy-panel__label">
                Number of Fractions
              </label>
              <input
                id="buy-amount"
                type="text"
                inputMode="numeric"
                value={fractions}
                onChange={(e) => {
                  const n = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 1;
                  setFractions(Math.max(1, Math.min(asset.available_fractions, n)));
                }}
                className="buy-modal__input"
                aria-label="Fractions to buy"
              />
            </div>

            <div className="buy-panel__quote">
              {quoteLoading ? (
                <>
                  <div className="skeleton-row" />
                  <div className="skeleton-row" />
                  <div className="skeleton-row" />
                </>
              ) : quote ? (
                <>
                  <div className="buy-modal__row">
                    <span>Price per fraction</span>
                    <span className="buy-modal__value tabular-nums">
                      {quote.price_per_fraction.toLocaleString('en-US')} sats
                    </span>
                  </div>
                  <div className="buy-modal__row">
                    <span>Subtotal</span>
                    <span className="buy-modal__value tabular-nums">
                      {quote.total_price.toLocaleString('en-US')} sats
                    </span>
                  </div>
                  <div className="buy-modal__row">
                    <span>Protocol fee</span>
                    <span className="buy-modal__value buy-modal__fee tabular-nums">
                      {quote.fee.toLocaleString('en-US')} sats
                    </span>
                  </div>
                  <div className="buy-modal__row buy-modal__total">
                    <span>Total</span>
                    <span className="buy-modal__value tabular-nums">
                      {quote.total_cost.toLocaleString('en-US')} sats
                    </span>
                  </div>
                </>
              ) : null}
            </div>

            <button
              className="btn btn--primary btn--lg buy-modal__cta"
              onClick={() => setBuyOpen(true)}
              aria-label={`Buy fractions of ${asset.name}`}
            >
              Buy Now
            </button>

            <p className="buy-panel__note">
              Fees enforced on-chain by RWAVault contract.
            </p>
          </div>
        </div>
      </div>

      {buyOpen && (
        <BuyModal open={buyOpen} onClose={() => setBuyOpen(false)} asset={asset} initialAmount={fractions} />
      )}
    </div>
  );
}
