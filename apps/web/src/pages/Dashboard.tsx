import React from 'react';
import { useWalletStore } from '@/store/walletStore';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useBTCPrice } from '@/hooks/useBTCPrice';

function truncateAddress(addr: string): string {
  if (addr.length <= 20) return addr;
  return `${addr.slice(0, 10)}...${addr.slice(-8)}`;
}

// Brazilian number format: 1.000.000,00
const fmtBR = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmtBR2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function satsToUSD(sats: number, btcPriceUSD: number): string {
  const usd = (sats / 100_000_000) * btcPriceUSD;
  return fmtBR2.format(usd);
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
  const { address, connected, verified, network, portfolioLoading, refreshPortfolio } = useWalletStore();
  const { positions } = usePortfolio(address);
  const { price: btcPrice } = useBTCPrice();

  const totalSats = positions.reduce(
    (sum, pos) => sum + pos.current_price * pos.amount,
    0
  );
  const totalPnl = positions.reduce((sum, pos) => sum + pos.pnl, 0);
  const totalBTC = totalSats / 100_000_000;

  return (
    <div className="page dashboard-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <button
            className="btn btn--secondary btn--sm dashboard__refresh-btn"
            onClick={() => void refreshPortfolio()}
            disabled={portfolioLoading || !connected}
            aria-label="Refresh portfolio"
            title="Refresh on-chain balances"
          >
            {portfolioLoading ? (
              <span className="dashboard__refresh-spin" aria-hidden="true" />
            ) : '↻'} Refresh
          </button>
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
          {/* BTC balance summary */}
          {connected && totalSats > 0 && (
            <div className="dashboard__wallet-balance">
              <span className="dashboard__wallet-btc tabular-nums">
                {totalBTC.toLocaleString('pt-BR', { minimumFractionDigits: 8, maximumFractionDigits: 8 })} BTC
              </span>
              {btcPrice !== null && (
                <span className="dashboard__wallet-usd tabular-nums">
                  ≈ US$ {satsToUSD(totalSats, btcPrice)}
                </span>
              )}
            </div>
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
              {totalSats > 0 ? `${fmtBR.format(totalSats)} sats` : '--'}
            </span>
            {btcPrice !== null && totalSats > 0 && (
              <span className="dashboard__stat-sub tabular-nums">≈ US$ {satsToUSD(totalSats, btcPrice)}</span>
            )}
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
                ? `${totalPnl >= 0 ? '+' : ''}${fmtBR.format(totalPnl)} sats`
                : '--'}
            </span>
          </div>
        </div>

        {/* Portfolio */}
        <div className="dashboard__assets">
          <div className="dashboard__assets-header">
            <h2 className="dashboard__assets-title">Portfolio</h2>
          </div>
          {portfolioLoading ? (
            <div className="portfolio__grid">
              {[0, 1, 2].map((i) => (
                <div key={i} className="portfolio__card glass-card">
                  <div className="skeleton-block skeleton-block--title" />
                  <div className="skeleton-block skeleton-block--body" />
                  <div className="skeleton-block skeleton-block--body" />
                </div>
              ))}
            </div>
          ) : !connected ? (
            <p className="portfolio__empty">Connect your wallet to view your positions.</p>
          ) : positions.length === 0 ? (
            <p className="portfolio__empty">No positions yet. Buy fractions from the <a href="/#markets" className="text-accent">market</a> to get started.</p>
          ) : (
            <div className="portfolio__grid">
              {positions.map((pos) => (
                <div key={pos.id} className="portfolio__card glass-card glass-card--hoverable">
                  <div className="portfolio__asset-name">
                    {ASSET_NAMES[pos.asset_id] ?? pos.asset_id}
                  </div>
                  <div className="portfolio__row">
                    <span className="portfolio__label">Fractions</span>
                    <span className="portfolio__value tabular-nums">{fmtBR.format(pos.amount)}</span>
                  </div>
                  <div className="portfolio__row">
                    <span className="portfolio__label">Value</span>
                    <span className="portfolio__value tabular-nums">
                      {fmtBR.format(pos.current_price * pos.amount)} sats
                    </span>
                  </div>
                  {btcPrice !== null && (
                    <div className="portfolio__row">
                      <span className="portfolio__label">≈ USD</span>
                      <span className="portfolio__value tabular-nums">
                        US$ {satsToUSD(pos.current_price * pos.amount, btcPrice)}
                      </span>
                    </div>
                  )}
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
