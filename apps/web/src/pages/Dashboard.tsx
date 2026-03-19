import React from 'react';
import { useWalletStore } from '@/store/walletStore';
import { usePortfolio } from '@/hooks/usePortfolio';
function truncateAddress(addr: string): string {
  if (addr.length <= 20) return addr;
  return `${addr.slice(0, 10)}...${addr.slice(-8)}`;
}

const ASSET_NAMES: Record<string, string> = {
  'sp-commercial-tower':       'São Paulo — Faria Lima Tower',
  'us-tbill-fund':             'US Treasury Bill Fund (3M)',
  'gold-vault-reserve':        'Gold Vault Reserve — Zurich',
  'miami-sunset-bay':          'Miami Beach — Sunset Bay Residences',
  'manhattan-midtown-commerce':'Manhattan — Midtown Commerce Tower',
  'dubai-marina-view':         'Dubai Marina — Marina View Tower',
  'eu-corporate-bond-fund':    'EU Investment-Grade Corporate Bond Fund',
  'silver-vault-zurich':       'Silver Vault Reserve — Zurich',
  'london-grade-a-office':     'London — Grade-A Office Portfolio',
};

export function Dashboard(): React.JSX.Element {
  const { address, connected, verified, network } = useWalletStore();
  const { positions } = usePortfolio(address);

  const totalValue = positions.reduce(
    (sum, pos) => sum + pos.current_price * pos.amount,
    0
  );
  const totalPnl = positions.reduce((sum, pos) => sum + pos.pnl, 0);

  return (
    <div className="page dashboard-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
        </div>

        {/* Wallet card */}
        <div className="dashboard__wallet glass-card">
          <div className="dashboard__wallet-info">
            <div className="dashboard__wallet-status">
              <span
                className="dashboard__wallet-dot"
                style={{ background: connected ? 'var(--success)' : 'var(--text-faint)' }}
                aria-hidden="true"
              />
              <span className="dashboard__wallet-label">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
              {verified && (
                <span className="badge badge--success" aria-label="Verified">
                  Verified
                </span>
              )}
            </div>
            {address && (
              <p className="dashboard__wallet-address tabular-nums">
                {truncateAddress(address)}
              </p>
            )}
            <p className="dashboard__wallet-network">
              Network: <strong>{network}</strong>
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="dashboard__stats">
          <div className="dashboard__stat glass-card">
            <span className="dashboard__stat-label">Positions</span>
            <span className="dashboard__stat-value tabular-nums">{positions.length}</span>
          </div>
          <div className="dashboard__stat glass-card">
            <span className="dashboard__stat-label">Total Value</span>
            <span className="dashboard__stat-value tabular-nums">
              {totalValue > 0 ? `${totalValue.toLocaleString('en-US')} sats` : '--'}
            </span>
          </div>
          <div className="dashboard__stat glass-card">
            <span className="dashboard__stat-label">Unrealized P&L</span>
            <span
              className="dashboard__stat-value tabular-nums"
              style={{
                color:
                  totalPnl > 0
                    ? 'var(--success)'
                    : totalPnl < 0
                      ? 'var(--danger)'
                      : 'var(--text)',
              }}
            >
              {totalPnl !== 0
                ? `${totalPnl >= 0 ? '+' : ''}${totalPnl.toLocaleString('en-US', { maximumFractionDigits: 0 })} sats`
                : '--'}
            </span>
          </div>
        </div>

        {/* Portfolio */}
        <div className="dashboard__assets">
          <div className="dashboard__assets-header">
            <h2 className="dashboard__assets-title">Portfolio</h2>
          </div>
          {!connected ? (
            <p className="portfolio__empty">Connect your wallet to view your positions.</p>
          ) : positions.length === 0 ? (
            <p className="portfolio__empty">No positions yet. Buy fractions from the <a href="/#markets" className="text-accent">market</a> to get started.</p>
          ) : (
            <div className="portfolio__grid">
              {positions.map((pos) => (
                <div key={pos.id} className="portfolio__card glass-card">
                  <div className="portfolio__asset-name">
                    {ASSET_NAMES[pos.asset_id] ?? pos.asset_id}
                  </div>
                  <div className="portfolio__row">
                    <span className="portfolio__label">Fractions</span>
                    <span className="portfolio__value tabular-nums">{pos.amount.toLocaleString('en-US')}</span>
                  </div>
                  <div className="portfolio__row">
                    <span className="portfolio__label">Value</span>
                    <span className="portfolio__value tabular-nums">
                      {(pos.current_price * pos.amount).toLocaleString('en-US')} sats
                    </span>
                  </div>
                  <div className="portfolio__row">
                    <span className="portfolio__label">Status</span>
                    <span className="badge badge--success">{pos.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
