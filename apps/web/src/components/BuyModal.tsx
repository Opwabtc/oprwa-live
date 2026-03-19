import React from 'react';
import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Clock, ExternalLink, Copy } from 'lucide-react';
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

/** Maps raw wallet/SDK error strings to clear user-facing messages. */
function friendlyError(raw: string): { title: string; detail: string } {
  const msg = raw.toLowerCase();

  if (msg.includes('insufficient') || msg.includes('not enough') || msg.includes('balance') || msg.includes('utxo') || msg.includes('funds')) {
    return {
      title: 'Insufficient BTC Balance',
      detail: 'Your wallet does not have enough Bitcoin to cover this purchase plus network fees. Add more BTC to your wallet and try again.',
    };
  }
  if (msg.includes('reject') || msg.includes('cancel') || msg.includes('denied') || msg.includes('refused') || msg.includes('user declined')) {
    return {
      title: 'Transaction Cancelled',
      detail: 'You rejected the signature request in your wallet. No funds were moved.',
    };
  }
  if (msg.includes('revert')) {
    const reason = raw.replace(/revert:?/i, '').trim() || 'Contract rejected the transaction.';
    return {
      title: 'Contract Reverted',
      detail: reason,
    };
  }
  if (msg.includes('network') || msg.includes('timeout') || msg.includes('rpc') || msg.includes('fetch')) {
    return {
      title: 'Network Error',
      detail: 'Could not reach the OPNet node. Check your connection and try again.',
    };
  }
  if (msg.includes('not detected') || msg.includes('not found') || msg.includes('not installed')) {
    return {
      title: 'Wallet Not Found',
      detail: raw,
    };
  }
  return {
    title: 'Transaction Failed',
    detail: raw || 'An unexpected error occurred. Please try again.',
  };
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

function TxLink({ txId }: { txId: string }): React.JSX.Element {
  const [copied, setCopied] = useState(false);
  const isReal = /^[0-9a-f]{64}$/i.test(txId);
  const short = isReal ? `${txId.slice(0, 10)}…${txId.slice(-8)}` : txId.slice(0, 18) + '…';

  const copy = (): void => {
    void navigator.clipboard.writeText(txId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div className="buy-modal__txid-row">
      <span className="buy-modal__txid-label">TX ID</span>
      <div className="buy-modal__txid-value">
        <span className="buy-modal__txid-hash tabular-nums">{short}</span>
        <button className="buy-modal__txid-copy" onClick={copy} title="Copy TX ID" aria-label="Copy transaction ID">
          {copied ? <span className="buy-modal__copied">✓</span> : <Copy size={13} />}
        </button>
        {isReal && (
          <a
            href={`https://opscan.org/transactions/${txId}?network=testnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="buy-modal__txid-scan"
            title="View on OPScan"
            aria-label="View transaction on OPScan explorer"
          >
            <ExternalLink size={13} />
            <span>OPScan</span>
          </a>
        )}
      </div>
    </div>
  );
}

export function BuyModal({ open, onClose, asset, initialAmount = 1 }: BuyModalProps): React.JSX.Element | null {
  const [amount, setAmount] = useState(initialAmount);
  const [displayVal, setDisplayVal] = useState(String(initialAmount));
  const [state, setState] = useState<ModalState>('idle');
  const [errInfo, setErrInfo] = useState<{ title: string; detail: string } | null>(null);
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
      setErrInfo(null);
      setLastTxId(null);
      setWConnecting(null);
      setWError('');
    } else {
      onModalClose();
    }
    return () => { onModalClose(); };
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
      const raw = err instanceof Error ? err.message : String(err);
      setErrInfo(friendlyError(raw));
      setState('error');
    }
  };

  const formatSats = (sats: number): string =>
    `${sats.toLocaleString('en-US', { useGrouping: true })} sats`;

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

  const blockClose = state === 'signing' || state === 'pending';

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        variants={OVERLAY_VARIANTS}
        initial="hidden"
        animate="visible"
        exit="hidden"
        transition={{ duration: 0.2 }}
        onClick={(e) => { if (e.target === e.currentTarget && !blockClose) onClose(); }}
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
              disabled={blockClose}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div className="modal__body">
            <AnimatePresence mode="wait">

              {/* ── SETTLED ─────────────────────────────────── */}
              {state === 'settled' && (
                <motion.div
                  key="settled"
                  className="buy-modal__feedback buy-modal__feedback--success"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  <motion.div
                    className="buy-modal__feedback-icon"
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.45, delay: 0.08, ease: [0.34, 1.56, 0.64, 1] }}
                  >
                    <CheckCircle size={56} strokeWidth={1.5} />
                  </motion.div>
                  <h3 className="buy-modal__feedback-title">Position Confirmed</h3>
                  <p className="buy-modal__feedback-desc">
                    <strong>{amount.toLocaleString()}</strong> fraction{amount !== 1 ? 's' : ''} of{' '}
                    <strong>{asset.name}</strong> added to your portfolio.
                  </p>

                  {lastTxId && <TxLink txId={lastTxId} />}

                  {lastTxId && !/^[0-9a-f]{64}$/i.test(lastTxId) && (
                    <p className="buy-modal__testnet-note">
                      Testnet simulation — position recorded locally.
                    </p>
                  )}

                  <div className="buy-modal__feedback-actions">
                    <button className="btn btn--primary btn--md" onClick={onClose}>
                      View Portfolio →
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── ERROR ───────────────────────────────────── */}
              {state === 'error' && (
                <motion.div
                  key="error"
                  className="buy-modal__feedback buy-modal__feedback--error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="buy-modal__feedback-icon">
                    <AlertCircle size={52} strokeWidth={1.5} />
                  </div>
                  <h3 className="buy-modal__feedback-title">{errInfo?.title ?? 'Transaction Failed'}</h3>
                  <p className="buy-modal__feedback-desc">{errInfo?.detail}</p>
                  <div className="buy-modal__feedback-actions">
                    <button className="btn btn--secondary btn--md" onClick={() => setState('idle')}>
                      Try Again
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── PENDING ─────────────────────────────────── */}
              {state === 'pending' && (
                <motion.div
                  key="pending"
                  className="buy-modal__feedback buy-modal__feedback--pending"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  <div className="buy-modal__feedback-icon">
                    <Clock size={52} strokeWidth={1.5} />
                    <div className="buy-modal__pending-ring" aria-hidden="true" />
                  </div>
                  <h3 className="buy-modal__feedback-title">Confirming on Bitcoin</h3>
                  <p className="buy-modal__feedback-desc">
                    Your transaction is in the mempool. Waiting for block confirmation…
                  </p>
                  {lastTxId && <TxLink txId={lastTxId} />}
                  <p className="buy-modal__pending-hint">
                    This window will update automatically when confirmed.
                  </p>
                </motion.div>
              )}

              {/* ── SIGNING ─────────────────────────────────── */}
              {state === 'signing' && (
                <motion.div
                  key="signing"
                  className="buy-modal__feedback buy-modal__feedback--signing"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  <div className="buy-modal__signing-spinner" aria-hidden="true" />
                  <h3 className="buy-modal__feedback-title">Waiting for Signature</h3>
                  <p className="buy-modal__feedback-desc">
                    Check your wallet — approve the transaction to continue.
                  </p>
                </motion.div>
              )}

              {/* ── IDLE (buy form) ──────────────────────────── */}
              {state === 'idle' && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
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
                        disabled={amount <= 1}
                        aria-label="Decrease amount"
                        whileTap={{ scale: 0.88 }}
                      >−</motion.button>
                      <input
                        id="fraction-amount"
                        type="text"
                        inputMode="numeric"
                        value={displayVal}
                        onChange={(e) => setDisplayVal(e.target.value.replace(/[^0-9]/g, ''))}
                        onBlur={() => {
                          const n = Math.max(1, Math.min(asset.available_fractions, parseInt(displayVal, 10) || 1));
                          setAmount(n); setDisplayVal(String(n));
                        }}
                        className="buy-modal__input"
                        aria-label="Number of fractions to buy"
                      />
                      <motion.button
                        className="buy-modal__stepper-btn"
                        onClick={() => adjustAmount(1)}
                        disabled={amount >= asset.available_fractions}
                        aria-label="Increase amount"
                        whileTap={{ scale: 0.88 }}
                      >+</motion.button>
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
                    <span style={{ color: asset.demand_factor > 0 ? 'var(--accent)' : asset.demand_factor < 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                      {asset.demand_factor > 0 ? '+' : ''}{(asset.demand_factor * 100).toFixed(2)}%
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
                      disabled={quoteLoading}
                      aria-busy={false}
                    >
                      Sign Transaction
                    </button>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
