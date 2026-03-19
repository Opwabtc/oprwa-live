import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchAsset, postBuy } from '@/lib/api';
import { usePricing } from '@/hooks/usePricing';
import { useWalletStore } from '@/store/walletStore';
import { usePortfolioStore } from '@/store/portfolioStore';
import { sounds } from '@/hooks/useSounds';
import type { Asset, Transaction } from '@/types';

const CATEGORY_LABELS: Record<string, string> = {
  real_estate: 'Real Estate',
  fixed_income: 'Fixed Income',
  commodity: 'Commodity',
};

type BuyState = 'idle' | 'signing' | 'pending' | 'settled' | 'error';

export function AssetDetail(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fractions, setFractions] = useState(1);
  const [buyState, setBuyState] = useState<BuyState>('idle');
  const [buyError, setBuyError] = useState<string | null>(null);
  const [lastTxId, setLastTxId] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { quote, loading: quoteLoading } = usePricing(id ?? '', fractions);
  const { address, refreshPortfolio } = useWalletStore();
  const { addPendingTx, settleTx } = usePortfolioStore();

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

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

  const handleDirectBuy = async (): Promise<void> => {
    if (!address || !asset) return;
    sounds.submit();
    setBuyState('signing');
    setBuyError(null);

    try {
      const res = await postBuy({ assetId: asset.id, amount: fractions, wallet: address });
      setLastTxId(res.tx_id);
      sounds.open();
      setBuyState('pending');

      const tx: Transaction = {
        id: res.tx_id,
        asset_id: asset.id,
        token_id: asset.token_id,
        amount: fractions,
        price_per_fraction: res.price_per_fraction,
        total_price: res.total_price,
        fee: res.fee,
        total_cost: res.total_cost,
        wallet: address,
        status: 'PENDING',
        created_at: res.created_at,
      };
      addPendingTx(tx);

      const isMockTx = !/^[0-9a-f]{64}$/i.test(res.tx_id);
      if (isMockTx) {
        setTimeout(() => {
          settleTx(res.tx_id);
          sounds.success();
          setBuyState('settled');
          void refreshPortfolio();
        }, 3000);
      } else {
        void (async () => {
          const { OPNetRWAVaultAdapter, CONTRACT_ADDRESS } = await import('@oprwa/contracts');
          const adapter = new OPNetRWAVaultAdapter(CONTRACT_ADDRESS, 'testnet');
          const initialBal = await adapter.balanceOf(address, asset.id).catch(() => 0n);
          const deadline = Date.now() + 120_000;
          pollRef.current = setInterval(() => {
            if (Date.now() > deadline) {
              if (pollRef.current) clearInterval(pollRef.current);
              sounds.success();
              settleTx(res.tx_id);
              setBuyState('settled');
              void refreshPortfolio();
              return;
            }
            void adapter.balanceOf(address, asset.id).then((bal: unknown) => {
              if (typeof bal === 'bigint' && bal > initialBal) {
                if (pollRef.current) clearInterval(pollRef.current);
                sounds.success();
                settleTx(res.tx_id);
                setBuyState('settled');
                void refreshPortfolio();
              }
            }).catch(() => {});
          }, 5000);
        })();
      }
    } catch (err) {
      sounds.error();
      setBuyError(err instanceof Error ? err.message : 'Transaction failed. Please try again.');
      setBuyState('error');
    }
  };

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
          <Link to="/#markets" className="breadcrumb__link">Markets</Link>
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

          {/* Right: Buy Panel — direct execution, no modal */}
          <div className="asset-detail__buy glass-card">
            <h2 className="asset-detail__buy-title">Buy Fractions</h2>

            {buyState === 'settled' ? (
              <div className="buy-panel__success" role="status">
                <p className="buy-panel__success-msg">
                  Purchase confirmed. {fractions.toLocaleString()} fraction{fractions !== 1 ? 's' : ''} added to your portfolio.
                </p>
                {lastTxId && (
                  <a
                    href={`https://opscan.org/transactions/${lastTxId}?network=testnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="buy-panel__tx-link"
                  >
                    View on OPScan
                  </a>
                )}
                <button className="btn btn--secondary btn--md" onClick={() => setBuyState('idle')} style={{ marginTop: '12px' }}>
                  Buy More
                </button>
                <Link to="/app" className="btn btn--primary btn--md" style={{ marginTop: '8px' }}>
                  View Portfolio
                </Link>
              </div>
            ) : buyState === 'pending' ? (
              <div className="buy-panel__pending" role="status" aria-live="polite">
                <p className="buy-panel__pending-msg">
                  Transaction submitted. Waiting for confirmation on Bitcoin...
                </p>
                {lastTxId && (
                  <a
                    href={`https://opscan.org/transactions/${lastTxId}?network=testnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="buy-panel__tx-link"
                  >
                    Track on OPScan
                  </a>
                )}
              </div>
            ) : (
              <>
                <div className="buy-panel__field">
                  <label htmlFor="buy-amount" className="buy-panel__label">Number of fractions</label>
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
                    disabled={buyState === 'signing'}
                  />
                </div>

                {quote && (
                  <div className="buy-panel__total">
                    <span className="buy-panel__total-label">Total cost</span>
                    <span className="buy-panel__total-value tabular-nums">
                      {quote.total_cost.toLocaleString('en-US')} sats
                    </span>
                  </div>
                )}

                {buyState === 'error' && buyError && (
                  <div className="buy-panel__error" role="alert">
                    <p>{buyError}</p>
                  </div>
                )}

                {!address ? (
                  <p className="buy-panel__connect-msg">Connect your wallet to buy fractions.</p>
                ) : (
                  <button
                    className="btn btn--primary btn--lg buy-modal__cta"
                    onClick={() => void handleDirectBuy()}
                    disabled={!quote || quoteLoading || buyState === 'signing'}
                    aria-label={`Buy fractions of ${asset.name}`}
                    aria-busy={buyState === 'signing'}
                  >
                    {buyState === 'signing' ? 'Waiting for signature...' : quoteLoading ? 'Calculating...' : 'Buy Now'}
                  </button>
                )}

                <p className="buy-panel__note">Fees enforced on-chain by RWAVault contract.</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
