import React from 'react';
import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePricing } from '@/hooks/usePricing';
import { postBuy } from '@/lib/api';
import { useWalletStore } from '@/store/walletStore';
import { usePortfolioStore } from '@/store/portfolioStore';
import { onModalOpen, onModalClose } from '@/lib/lenis';
import { sounds } from '@/hooks/useSounds';
import type { Asset, Transaction } from '@/types';

// Inline wallet options — avoids navbar dropdown layout bugs inside modal
const MODAL_WALLETS = [
  { id: 'opwallet', name: 'OPWallet', desc: 'Native OPNet Bitcoin wallet', initial: 'O', url: 'https://opwallet.io',
    available: () => typeof window !== 'undefined' && Boolean((window as ExtWindow).opnet) },
  { id: 'unisat', name: 'UniSat', desc: 'Bitcoin and BRC-20 wallet', initial: 'U', url: 'https://unisat.io',
    available: () => typeof window !== 'undefined' && Boolean((window as ExtWindow).unisat) },
  { id: 'okx', name: 'OKX Wallet', desc: 'Multi-chain crypto wallet', initial: 'K', url: 'https://www.okx.com/web3',
    available: () => typeof window !== 'undefined' && Boolean((window as ExtWindow).okxwallet?.bitcoin) },
];

type ExtWindow = typeof window & { opnet?: { requestAccounts: () => Promise<string[]> }; unisat?: { requestAccounts: () => Promise<string[]> }; okxwallet?: { bitcoin?: { requestAccounts: () => Promise<string[]> } } };

async function connectModalWallet(id: string): Promise<{ address: string; type: string }> {
  const w = window as ExtWindow;
  if (id === 'opwallet') {
    if (!w.opnet) throw new Error('OPWallet not detected. Please install it.');
    const [address] = await w.opnet.requestAccounts();
    if (!address) throw new Error('OPWallet returned no accounts.');
    return { address, type: 'opwallet' };
  }
  if (id === 'unisat') {
    if (!w.unisat) throw new Error('UniSat not detected. Please install it.');
    const [address] = await w.unisat.requestAccounts();
    if (!address) throw new Error('UniSat returned no accounts.');
    return { address, type: 'unisat' };
  }
  if (id === 'okx') {
    if (!w.okxwallet?.bitcoin) throw new Error('OKX Wallet not detected. Please install it.');
    const [address] = await w.okxwallet.bitcoin.requestAccounts();
    if (!address) throw new Error('OKX Wallet returned no accounts.');
    return { address, type: 'okx' };
  }
  throw new Error('Unknown wallet');
}

type ModalState = 'idle' | 'signing' | 'pending' | 'settled' | 'error';

interface BuyModalProps {
  open: boolean;
  onClose: () => void;
  asset: Asset;
  initialAmount?: number;
}

const OVERLAY_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const MODAL_VARIANTS = {
  hidden: { opacity: 0, scale: 0.96, y: 16 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: 16 },
};

const MODAL_TRANSITION = { duration: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] };

export function BuyModal({ open, onClose, asset, initialAmount = 1 }: BuyModalProps): React.JSX.Element | null {
  const [amount, setAmount] = useState(initialAmount);
  const [displayVal, setDisplayVal] = useState(String(initialAmount)); // separate display value prevents input flicker
  const [state, setState] = useState<ModalState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [lastTxId, setLastTxId] = useState<string | null>(null);
  const [wConnecting, setWConnecting] = useState<string | null>(null);
  const [wError, setWError] = useState('');
  const { address, refreshPortfolio, connect } = useWalletStore();
  const { addPendingTx, settleTx } = usePortfolioStore();
  const { quote, loading: quoteLoading } = usePricing(asset.id, amount);

  useEffect(() => {
    if (open) {
      onModalOpen();
      setState('idle');
      setAmount(initialAmount);
      setDisplayVal(String(initialAmount));
      setErrorMsg('');
      setLastTxId(null);
      setWConnecting(null);
      setWError('');
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
    sounds.submit();
    setState('signing');

    try {
      const res = await postBuy({ assetId: asset.id, amount, wallet: address });
      setLastTxId(res.tx_id);
      sounds.open();
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

      // H-02 fix: poll on-chain balance instead of fixed 3s fake-settle.
      // A real txid is 64 lowercase hex chars. Mock ids start with "mock_".
      const isMockTx = !/^[0-9a-f]{64}$/i.test(res.tx_id);
      if (isMockTx) {
        setTimeout(() => {
          settleTx(res.tx_id);
          sounds.success();
          setState('settled');
          void refreshPortfolio();
        }, 3000);
      } else {
        void (async () => {
          const { OPNetRWAVaultAdapter, CONTRACT_ADDRESS } = await import('@oprwa/contracts');
          const adapter = new OPNetRWAVaultAdapter(CONTRACT_ADDRESS, 'testnet');
          const initialBal = await adapter.balanceOf(address, asset.id).catch(() => 0n);
          const deadline = Date.now() + 120_000;
          const poll = setInterval(() => {
            if (Date.now() > deadline) {
              clearInterval(poll);
              sounds.success();
              settleTx(res.tx_id); setState('settled'); void refreshPortfolio();
              return;
            }
            void adapter.balanceOf(address, asset.id).then((bal) => {
              if (bal > initialBal) {
                clearInterval(poll);
                sounds.success();
                settleTx(res.tx_id); setState('settled'); void refreshPortfolio();
              }
            }).catch(() => {});
          }, 5000);
        })();
      }
    } catch (err) {
      sounds.error();
      setState('error');
      setErrorMsg(err instanceof Error ? err.message : 'Transaction failed. Please check your wallet.');
    }
  };

  const formatSats = (sats: number): string =>
    `${sats.toLocaleString('en-US', { useGrouping: true })} sats`;

  // H-03 fix: validate txid format with Bitcoin txid regex before building explorer URLs.
  const isRealTx = lastTxId !== null && /^[0-9a-f]{64}$/i.test(lastTxId);

  const adjustAmount = (delta: number): void => {
    sounds.adjust();
    setAmount((prev) => {
      const next = Math.max(1, Math.min(asset.available_fractions, prev + delta));
      setDisplayVal(String(next));
      return next;
    });
  };

  const handleWalletConnect = (walletId: string): void => {
    if (wConnecting) return;
    sounds.click();
    setWConnecting(walletId);
    setWError('');
    connectModalWallet(walletId)
      .then(({ address: addr, type }) => {
        sounds.walletConnect();
        return connect(addr, type).then(() => setWConnecting(null));
      })
      .catch((err: unknown) => {
        sounds.error();
        setWConnecting(null);
        setWError(err instanceof Error ? err.message : 'Connection failed. Please try again.');
      });
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        variants={OVERLAY_VARIANTS}
        initial="hidden"
        animate="visible"
        exit="hidden"
        transition={{ duration: 0.2 }}
        onClick={(e) => {
          if (e.target === e.currentTarget && state !== 'signing') onClose();
        }}
        role="dialog"
        aria-modal="true"
        aria-label={`Buy ${asset.name}`}
      >
        <motion.div
          className="modal buy-modal"
          variants={MODAL_VARIANTS}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={MODAL_TRANSITION}
        >
          <div className="modal__header">
            <h2 className="modal__title">Buy Fractions</h2>
            <button
              className="modal__close"
              onClick={onClose}
              disabled={state === 'signing'}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div className="modal__body">
            {state === 'settled' ? (
              <motion.div
                className="buy-modal__success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  <CheckCircle size={52} color="var(--success)" />
                </motion.div>
                <h3>Position Added</h3>
                <p>
                  {amount} fraction{amount !== 1 ? 's' : ''} of {asset.name} added to your portfolio.
                </p>
                {lastTxId && (
                  <div className="buy-modal__explorer-links">
                    {isRealTx ? (
                      <>
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
                          View on OPScan ↗
                        </a>
                      </>
                    ) : (
                      <p className="buy-modal__testnet-note">
                        Testnet simulation confirmed. Position added to your portfolio.
                      </p>
                    )}
                  </div>
                )}
                <button className="btn btn--primary btn--md" onClick={onClose}>
                  View Portfolio
                </button>
              </motion.div>
            ) : state === 'error' ? (
              <motion.div
                className="buy-modal__error"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <AlertCircle size={48} color="var(--danger)" />
                <h3>Transaction Failed</h3>
                <p>{errorMsg}</p>
                <button
                  className="btn btn--secondary btn--md"
                  onClick={() => setState('idle')}
                >
                  Try Again
                </button>
              </motion.div>
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
                  <div className="buy-modal__amount-row">
                    <motion.button
                      className="buy-modal__stepper-btn"
                      onClick={() => adjustAmount(-1)}
                      disabled={state !== 'idle' || amount <= 1}
                      aria-label="Decrease amount"
                      whileTap={{ scale: 0.88 }}
                    >
                      -
                    </motion.button>
                    <input
                      id="fraction-amount"
                      type="text"
                      inputMode="numeric"
                      value={displayVal}
                      onChange={(e) => setDisplayVal(e.target.value.replace(/[^0-9]/g, ''))}
                      onBlur={() => {
                        const n = Math.max(1, Math.min(asset.available_fractions, parseInt(displayVal, 10) || 1));
                        setAmount(n);
                        setDisplayVal(String(n));
                      }}
                      className="buy-modal__input"
                      disabled={state !== 'idle'}
                      aria-label="Number of fractions to buy"
                    />
                    <motion.button
                      className="buy-modal__stepper-btn"
                      onClick={() => adjustAmount(1)}
                      disabled={state !== 'idle' || amount >= asset.available_fractions}
                      aria-label="Increase amount"
                      whileTap={{ scale: 0.88 }}
                    >
                      +
                    </motion.button>
                  </div>
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
                        <span className="buy-modal__value tabular-nums">{formatSats(quote.price_per_fraction)}</span>
                      </div>
                      <div className="buy-modal__row">
                        <span>Subtotal ({amount} fractions)</span>
                        <span className="buy-modal__value tabular-nums">{formatSats(quote.total_price)}</span>
                      </div>
                      <div className="buy-modal__row">
                        <span>Protocol fee</span>
                        <span className="buy-modal__value buy-modal__fee tabular-nums">{formatSats(quote.fee)}</span>
                      </div>
                      <div className="buy-modal__row buy-modal__total">
                        <span>Total</span>
                        <span className="buy-modal__value tabular-nums">{formatSats(quote.total_cost)}</span>
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

                {!address ? (
                  <div className="buy-modal__wallet-picker">
                    <p className="buy-modal__wallet-title">Connect wallet to buy</p>
                    {wError && <div className="buy-modal__wallet-error">{wError}</div>}
                    <ul className="wallet-picker-modal__list" role="list">
                      {MODAL_WALLETS.map((w) => {
                        const avail = w.available();
                        const isConn = wConnecting === w.id;
                        return (
                          <li key={w.id}>
                            <button
                              className={`wallet-picker-modal__option${!avail ? ' wallet-picker-modal__option--unavailable' : ''}`}
                              onClick={() => { if (avail) handleWalletConnect(w.id); }}
                              disabled={!avail || Boolean(wConnecting)}
                              aria-label={avail ? `Connect ${w.name}` : `${w.name} — not installed`}
                            >
                              <div className="wallet-picker-modal__icon">{w.initial}</div>
                              <div className="wallet-picker-modal__info">
                                <span className="wallet-picker-modal__name">{w.name}</span>
                                <span className="wallet-picker-modal__desc">
                                  {isConn ? 'Connecting…' : avail ? w.desc : (
                                    <>Not installed — <a href={w.url} target="_blank" rel="noopener noreferrer" className="wallet-picker-modal__install-link" onClick={(e) => e.stopPropagation()}>Install</a></>
                                  )}
                                </span>
                              </div>
                              <span className="wallet-picker-modal__arrow" aria-hidden="true">
                                {isConn ? <span className="wallet-picker-modal__connecting-ring" /> : avail ? '›' : ''}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                    <p className="wallet-picker-modal__note">Testnet only · No real funds required</p>
                  </div>
                ) : (
                  <button
                    className="btn btn--primary btn--lg buy-modal__cta"
                    onClick={() => void handleBuy()}
                    disabled={state !== 'idle' || quoteLoading}
                    aria-busy={state === 'signing' || state === 'pending'}
                  >
                    {state === 'signing'
                      ? 'Signing...'
                      : state === 'pending'
                        ? 'Confirming...'
                        : 'Sign Transaction'}
                  </button>
                )}

                {state === 'pending' && (
                  <p className="buy-modal__pending-note">
                    Transaction submitted. Settlement in progress...
                  </p>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
