import React from 'react';
import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { usePricing } from '@/hooks/usePricing';
import { postBuy } from '@/lib/api';
import { useWalletStore } from '@/store/walletStore';
import { usePortfolioStore } from '@/store/portfolioStore';
import { onModalOpen, onModalClose } from '@/lib/lenis';
import type { Asset, Transaction } from '@/types';

type ModalState = 'idle' | 'signing' | 'pending' | 'settled' | 'error';

interface BuyModalProps {
  open: boolean;
  onClose: () => void;
  asset: Asset;
}

export function BuyModal({ open, onClose, asset }: BuyModalProps): React.JSX.Element | null {
  const [amount, setAmount] = useState(1);
  const [state, setState] = useState<ModalState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [lastTxId, setLastTxId] = useState<string | null>(null);
  const { address, refreshPortfolio } = useWalletStore();
  const { addPendingTx, settleTx } = usePortfolioStore();
  const { quote, loading: quoteLoading } = usePricing(asset.id, amount);

  useEffect(() => {
    if (open) {
      onModalOpen();
      setState('idle');
      setAmount(1);
      setErrorMsg('');
      setLastTxId(null);
    } else {
      onModalClose();
    }
    return () => {
      onModalClose();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && state === 'idle') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose, state]);

  if (!open) return null;

  const handleBuy = async (): Promise<void> => {
    if (!address) return;
    setState('signing');

    try {
      const res = await postBuy({ assetId: asset.id, amount, wallet: address });
      setLastTxId(res.tx_id);
      setState('pending');

      const tx: Transaction = {
        id: res.tx_id,
        asset_id: asset.id,
        token_id: asset.token_id,
        amount,
        price_per_fraction: res.price_per_fraction,
        total_price: res.total_price,
        fee: res.fee,
        total_cost: res.total_cost,
        wallet: address,
        status: 'PENDING',
        created_at: res.created_at,
      };
      addPendingTx(tx);

      // Settle after 3s and refresh on-chain portfolio
      setTimeout(() => {
        settleTx(res.tx_id);
        setState('settled');
        void refreshPortfolio();
      }, 3000);
    } catch (err) {
      setState('error');
      setErrorMsg(err instanceof Error ? err.message : 'Transaction failed. Please check your wallet.');
    }
  };

  const formatSats = (sats: number): string =>
    `${sats.toLocaleString('en-US', { useGrouping: true })} sats`;

  const isRealTx = lastTxId !== null && lastTxId !== '' && !lastTxId.startsWith('mock_');

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && state === 'idle') onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Buy ${asset.name}`}
    >
      <div className="modal buy-modal">
        <div className="modal__header">
          <h2 className="modal__title">Buy Fractions</h2>
          <button
            className="modal__close"
            onClick={onClose}
            disabled={state === 'signing' || state === 'pending'}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal__body">
          {state === 'settled' ? (
            <div className="buy-modal__success">
              <CheckCircle size={48} color="var(--success)" />
              <h3>Position Added</h3>
              <p>
                {amount} fraction{amount !== 1 ? 's' : ''} of {asset.name} added to your portfolio.
              </p>
              {isRealTx && lastTxId !== null && (
                <div className="buy-modal__explorer-links">
                  <a
                    href={`https://mempool.opnet.org/testnet4/tx/${lastTxId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="buy-modal__explorer-link"
                  >
                    View on Mempool
                  </a>
                  <a
                    href={`https://opscan.org/transactions/${lastTxId}?network=testnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="buy-modal__explorer-link buy-modal__explorer-link--primary"
                  >
                    View on OPScan
                  </a>
                </div>
              )}
              <button className="btn btn--primary btn--md" onClick={onClose}>
                View Portfolio
              </button>
            </div>
          ) : state === 'error' ? (
            <div className="buy-modal__error">
              <AlertCircle size={48} color="var(--danger)" />
              <h3>Transaction Failed</h3>
              <p>{errorMsg}</p>
              <button
                className="btn btn--secondary btn--md"
                onClick={() => setState('idle')}
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="buy-modal__asset">
                <span className="buy-modal__asset-name">{asset.name}</span>
                <span className="buy-modal__asset-yield">{asset.yield_pct}% APY</span>
              </div>

              <div className="buy-modal__field">
                <label htmlFor="fraction-amount" className="buy-modal__label">
                  Number of Fractions
                </label>
                <input
                  id="fraction-amount"
                  type="number"
                  min={1}
                  max={asset.available_fractions}
                  value={amount}
                  onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="buy-modal__input"
                  disabled={state !== 'idle'}
                  aria-label="Number of fractions to buy"
                />
              </div>

              <div className="buy-modal__quote">
                {quoteLoading ? (
                  <div className="buy-modal__skeleton-rows">
                    <div className="skeleton-row" />
                    <div className="skeleton-row" />
                    <div className="skeleton-row" />
                  </div>
                ) : quote ? (
                  <>
                    <div className="buy-modal__row">
                      <span>Price per fraction</span>
                      <span className="buy-modal__value">{formatSats(quote.price_per_fraction)}</span>
                    </div>
                    <div className="buy-modal__row">
                      <span>Subtotal ({amount} fractions)</span>
                      <span className="buy-modal__value">{formatSats(quote.total_price)}</span>
                    </div>
                    <div className="buy-modal__row">
                      <span>Protocol fee</span>
                      <span className="buy-modal__value buy-modal__fee">{formatSats(quote.fee)}</span>
                    </div>
                    <div className="buy-modal__row buy-modal__total">
                      <span>Total</span>
                      <span className="buy-modal__value">{formatSats(quote.total_cost)}</span>
                    </div>
                  </>
                ) : null}
              </div>

              <div className="buy-modal__demand">
                <span>Market pressure: </span>
                <span
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

              <button
                className="btn btn--primary btn--lg buy-modal__cta"
                onClick={() => void handleBuy()}
                disabled={state !== 'idle' || !address || quoteLoading}
                aria-busy={state === 'signing' || state === 'pending'}
              >
                {state === 'signing'
                  ? 'Signing...'
                  : state === 'pending'
                    ? 'Confirming...'
                    : !address
                      ? 'Connect Wallet First'
                      : 'Sign Transaction'}
              </button>

              {state === 'pending' && (
                <p className="buy-modal__pending-note">
                  Transaction submitted. Settlement in progress...
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
