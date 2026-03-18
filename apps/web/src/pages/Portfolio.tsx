import React from 'react';
import { Link } from 'react-router-dom';
import { useWalletStore } from '@/store/walletStore';
import { usePortfolio } from '@/hooks/usePortfolio';
import { PositionCard } from '@/components/PositionCard';

const ASSET_NAMES: Record<string, string> = {
  'sp-commercial-tower': 'Sao Paulo Commercial Tower',
  'us-tbill-fund': 'US T-Bill Fund',
  'gold-vault-reserve': 'Gold Vault Reserve',
};

export function Portfolio(): React.JSX.Element {
  const { address, connected } = useWalletStore();
  const { positions, loading, error } = usePortfolio(address);

  if (!connected) {
    return (
      <div className="page container">
        <div className="empty-state empty-state--centered">
          <h1 className="page-title">Portfolio</h1>
          <p>Connect your wallet to view your positions.</p>
          <Link to="/marketplace" className="btn btn--primary btn--md">
            Browse Markets
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page container">
        <h1 className="page-title">Portfolio</h1>
        <div className="position-grid" aria-busy="true" aria-label="Loading positions">
          {[0, 1].map((i) => (
            <div key={i} className="glass-card" style={{ padding: '1.5rem', height: '160px' }}>
              <div className="skeleton-block skeleton-block--header" />
              <div className="skeleton-block skeleton-block--body" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page container">
        <h1 className="page-title">Portfolio</h1>
        <div className="error-state" role="alert">
          <p>Failed to load portfolio: {error}</p>
        </div>
      </div>
    );
  }

  const totalValue = positions.reduce(
    (sum, pos) => sum + pos.current_price * pos.amount,
    0
  );
  const totalPnl = positions.reduce((sum, pos) => sum + pos.pnl, 0);

  return (
    <div className="page portfolio-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Portfolio</h1>
          {positions.length > 0 && (
            <div className="portfolio-summary">
              <div className="portfolio-summary__stat">
                <span className="portfolio-summary__label">Total Value</span>
                <span className="portfolio-summary__value tabular-nums">
                  {totalValue.toLocaleString('en-US')} sats
                </span>
              </div>
              <div className="portfolio-summary__stat">
                <span className="portfolio-summary__label">Unrealized P&L</span>
                <span
                  className="portfolio-summary__value tabular-nums"
                  style={{ color: totalPnl >= 0 ? 'var(--success)' : 'var(--danger)' }}
                >
                  {totalPnl >= 0 ? '+' : ''}
                  {totalPnl.toLocaleString('en-US', { maximumFractionDigits: 0 })} sats
                </span>
              </div>
            </div>
          )}
        </div>

        {positions.length === 0 ? (
          <div className="empty-state">
            <p>No positions yet. Start investing in real world assets.</p>
            <Link to="/marketplace" className="btn btn--primary btn--md">
              Browse Markets
            </Link>
          </div>
        ) : (
          <div className="position-grid">
            {positions.map((pos) => (
              <PositionCard
                key={pos.id}
                position={pos}
                assetName={ASSET_NAMES[pos.asset_id] ?? pos.asset_id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
