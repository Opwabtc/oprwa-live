import React from 'react';
import { Link } from 'react-router-dom';
import { useWalletStore } from '@/store/walletStore';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useAssets } from '@/hooks/useAssets';
import { AssetCard } from '@/components/AssetCard';
import { WalletConnectButton } from '@/components/WalletConnectButton';

function truncateAddress(addr: string): string {
  if (addr.length <= 20) return addr;
  return `${addr.slice(0, 10)}...${addr.slice(-8)}`;
}

export function Dashboard(): React.JSX.Element {
  const { address, connected, verified, network } = useWalletStore();
  const { positions } = usePortfolio(address);
  const { assets } = useAssets();

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
          {!connected && (
            <WalletConnectButton />
          )}
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

        {/* Featured assets */}
        <div className="dashboard__assets">
          <div className="dashboard__assets-header">
            <h2 className="dashboard__assets-title">Featured Assets</h2>
            <Link to="/marketplace" className="btn btn--ghost btn--sm">
              View all
            </Link>
          </div>
          <div className="asset-grid">
            {assets.slice(0, 2).map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
            {assets.length === 0 &&
              [0, 1].map((i) => (
                <div
                  key={i}
                  className="glass-card"
                  style={{ height: '200px' }}
                  aria-hidden="true"
                >
                  <div className="skeleton-block skeleton-block--header" />
                  <div className="skeleton-block skeleton-block--body" />
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
