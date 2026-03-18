import React from 'react';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useWalletStore } from '@/store/walletStore';
import { onModalOpen, onModalClose } from '@/lib/lenis';

interface WalletOption {
  id: string;
  name: string;
  description: string;
  check: () => boolean;
}

const WALLETS: WalletOption[] = [
  {
    id: 'opwallet',
    name: 'OPWallet',
    description: 'Native OPNet Bitcoin wallet',
    check: () => typeof window !== 'undefined' && Boolean(window.opnet),
  },
  {
    id: 'unisat',
    name: 'UniSat',
    description: 'Bitcoin and BRC-20 wallet',
    check: () => typeof window !== 'undefined' && Boolean(window.unisat),
  },
  {
    id: 'okx',
    name: 'OKX Wallet',
    description: 'Multi-chain crypto wallet',
    check: () =>
      typeof window !== 'undefined' && Boolean(window.okxwallet?.bitcoin),
  },
];

type ConnectState = 'idle' | 'connecting' | 'error';

interface WalletPickerModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Attempt to connect to a specific wallet type.
 * Returns { address, type } on success, throws on failure.
 */
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
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && connectState === 'idle') onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Choose wallet"
    >
      <div className="modal wallet-picker-modal">
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
            <div
              className="wallet-picker-modal__error"
              role="alert"
              aria-live="polite"
            >
              {errorMsg}
            </div>
          )}

          <ul className="wallet-picker-modal__list" role="list">
            {WALLETS.map((wallet) => {
              const detected = wallet.check();
              const isConnecting =
                connectState === 'connecting' && activeWallet === wallet.id;
              return (
                <li key={wallet.id}>
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
                      {wallet.name[0]}
                    </div>
                    <div className="wallet-picker-modal__info">
                      <span className="wallet-picker-modal__name">
                        {wallet.name}
                      </span>
                      <span className="wallet-picker-modal__desc">
                        {isConnecting
                          ? 'Connecting...'
                          : detected
                            ? wallet.description
                            : 'Not installed'}
                      </span>
                    </div>
                    <span
                      className="wallet-picker-modal__arrow"
                      aria-hidden="true"
                    >
                      {isConnecting ? '...' : detected ? '>' : ''}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="wallet-picker-modal__note">
            Testnet only. No real funds required.
          </p>
        </div>
      </div>
    </div>
  );
}
