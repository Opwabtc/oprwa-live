import React from 'react';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletStore } from '@/store/walletStore';
import { onModalOpen, onModalClose } from '@/lib/lenis';

interface WalletOption {
  id: string;
  name: string;
  description: string;
  initial: string;
  installUrl: string;
  check: () => boolean;
}

const WALLETS: WalletOption[] = [
  {
    id: 'opwallet',
    name: 'OPWallet',
    description: 'Native OPNet Bitcoin wallet',
    initial: 'O',
    installUrl: 'https://opwallet.io',
    check: () => typeof window !== 'undefined' && Boolean(window.opnet),
  },
  {
    id: 'unisat',
    name: 'UniSat',
    description: 'Bitcoin and BRC-20 wallet',
    initial: 'U',
    installUrl: 'https://unisat.io',
    check: () => typeof window !== 'undefined' && Boolean(window.unisat),
  },
  {
    id: 'okx',
    name: 'OKX Wallet',
    description: 'Multi-chain crypto wallet',
    initial: 'K',
    installUrl: 'https://www.okx.com/web3',
    check: () =>
      typeof window !== 'undefined' && Boolean(window.okxwallet?.bitcoin),
  },
];

type ConnectState = 'idle' | 'connecting' | 'error';

interface WalletPickerModalProps {
  open: boolean;
  onClose: () => void;
}

async function connectWallet(
  walletId: string
): Promise<{ address: string; type: string }> {
  if (walletId === 'opwallet') {
    if (!window.opnet) throw new Error('OPWallet not detected. Please install it.');
    const accounts = await window.opnet.requestAccounts();
    const address = accounts[0];
    if (!address) throw new Error('OPWallet returned no accounts.');
    return { address, type: 'opwallet' };
  }

  if (walletId === 'unisat') {
    if (!window.unisat) throw new Error('UniSat not detected. Please install it.');
    const accounts = await window.unisat.requestAccounts();
    const address = accounts[0];
    if (!address) throw new Error('UniSat returned no accounts.');
    return { address, type: 'unisat' };
  }

  if (walletId === 'okx') {
    if (!window.okxwallet?.bitcoin)
      throw new Error('OKX Wallet not detected. Please install it.');
    const accounts = await window.okxwallet.bitcoin.requestAccounts();
    const address = accounts[0];
    if (!address) throw new Error('OKX Wallet returned no accounts.');
    return { address, type: 'okx' };
  }

  throw new Error(`Unknown wallet: ${walletId}`);
}

function friendlyError(err: unknown): string {
  if (err instanceof Error) {
    if (err.message.includes('rejected') || err.message.includes('denied'))
      return 'Connection request was rejected. Please approve the connection in your wallet.';
    if (err.message.includes('not detected') || err.message.includes('not found'))
      return err.message;
    return err.message;
  }
  return 'Failed to connect wallet. Please try again.';
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

export function WalletPickerModal({
  open,
  onClose,
}: WalletPickerModalProps): React.JSX.Element | null {
  const { connect } = useWalletStore();
  const [connectState, setConnectState] = useState<ConnectState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeWallet, setActiveWallet] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      onModalOpen();
      setConnectState('idle');
      setErrorMsg('');
      setActiveWallet(null);
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
      if (e.key === 'Escape' && connectState === 'idle') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose, connectState]);

  if (!open) return null;

  const handleConnect = (walletId: string): void => {
    setConnectState('connecting');
    setActiveWallet(walletId);
    setErrorMsg('');

    connectWallet(walletId)
      .then(({ address, type }) => {
        return connect(address, type).then(() => {
          setConnectState('idle');
          onClose();
        });
      })
      .catch((err: unknown) => {
        setConnectState('error');
        setErrorMsg(friendlyError(err));
        setActiveWallet(null);
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
          if (e.target === e.currentTarget && connectState === 'idle') onClose();
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Choose wallet"
      >
        <motion.div
          className="modal wallet-picker-modal"
          variants={MODAL_VARIANTS}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={MODAL_TRANSITION}
        >
          <div className="modal__header">
            <h2 className="modal__title">Connect Wallet</h2>
            <button
              className="modal__close"
              onClick={onClose}
              disabled={connectState === 'connecting'}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
          <div className="modal__body">
            <p className="wallet-picker-modal__subtitle">
              Choose your Bitcoin wallet to access OPRWA
            </p>

            {connectState === 'error' && (
              <motion.div
                className="wallet-picker-modal__error"
                role="alert"
                aria-live="polite"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {errorMsg}
              </motion.div>
            )}

            <ul className="wallet-picker-modal__list" role="list">
              {WALLETS.map((wallet, i) => {
                const detected = wallet.check();
                const isConnecting =
                  connectState === 'connecting' && activeWallet === wallet.id;
                return (
                  <motion.li
                    key={wallet.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.22, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <button
                      className={`wallet-picker-modal__option${!detected ? ' wallet-picker-modal__option--unavailable' : ''}`}
                      onClick={() => {
                        if (detected && connectState === 'idle')
                          handleConnect(wallet.id);
                      }}
                      disabled={!detected || connectState === 'connecting'}
                      aria-label={
                        detected
                          ? `Connect with ${wallet.name}`
                          : `${wallet.name} not installed`
                      }
                      aria-busy={isConnecting}
                    >
                      <div
                        className="wallet-picker-modal__icon"
                        aria-hidden="true"
                      >
                        {wallet.initial}
                      </div>
                      <div className="wallet-picker-modal__info">
                        <span className="wallet-picker-modal__name">
                          {wallet.name}
                        </span>
                        <span className="wallet-picker-modal__desc">
                          {isConnecting
                            ? `Connecting to ${wallet.name}...`
                            : detected
                              ? wallet.description
                              : (
                                <>
                                  Not installed —{' '}
                                  <a
                                    href={wallet.installUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="wallet-picker-modal__install-link"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Install
                                  </a>
                                </>
                              )}
                        </span>
                      </div>
                      <span
                        className="wallet-picker-modal__arrow"
                        aria-hidden="true"
                      >
                        {isConnecting ? (
                          <span className="wallet-picker-modal__connecting-ring" />
                        ) : detected ? (
                          '›'
                        ) : (
                          ''
                        )}
                      </span>
                    </button>
                  </motion.li>
                );
              })}
            </ul>
            <p className="wallet-picker-modal__note">
              Testnet only. No real funds required.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
