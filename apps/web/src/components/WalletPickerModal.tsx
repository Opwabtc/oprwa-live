import React from 'react';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useWalletStore } from '@/store/walletStore';
import { onModalOpen, onModalClose } from '@/lib/lenis';

interface WalletOption {
  id: string;
  name: string;
  description: string;
}

const WALLETS: WalletOption[] = [
  { id: 'unisat', name: 'Unisat', description: 'Bitcoin & BRC-20 wallet' },
  { id: 'xverse', name: 'Xverse', description: 'Bitcoin web3 wallet' },
  { id: 'okx', name: 'OKX Wallet', description: 'Multi-chain crypto wallet' },
];

interface WalletPickerModalProps {
  open: boolean;
  onClose: () => void;
}

export function WalletPickerModal({ open, onClose }: WalletPickerModalProps): React.JSX.Element | null {
  const { connect } = useWalletStore();

  useEffect(() => {
    if (open) {
      onModalOpen();
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
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleConnect = (walletId: string): void => {
    // Mock connect — in prod, this would trigger walletconnect handshake
    console.log(`Connecting via ${walletId}`);
    connect();
    onClose();
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Choose wallet"
    >
      <div className="modal wallet-picker-modal">
        <div className="modal__header">
          <h2 className="modal__title">Connect Wallet</h2>
          <button className="modal__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="modal__body">
          <p className="wallet-picker-modal__subtitle">
            Choose your Bitcoin wallet to access OPRWA
          </p>
          <ul className="wallet-picker-modal__list" role="list">
            {WALLETS.map((wallet) => (
              <li key={wallet.id}>
                <button
                  className="wallet-picker-modal__option"
                  onClick={() => handleConnect(wallet.id)}
                  aria-label={`Connect with ${wallet.name}`}
                >
                  <div className="wallet-picker-modal__icon" aria-hidden="true">
                    {wallet.name[0]}
                  </div>
                  <div className="wallet-picker-modal__info">
                    <span className="wallet-picker-modal__name">{wallet.name}</span>
                    <span className="wallet-picker-modal__desc">{wallet.description}</span>
                  </div>
                  <span className="wallet-picker-modal__arrow" aria-hidden="true">›</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="wallet-picker-modal__note">
            Testnet: wallet auto-verified. No real funds required.
          </p>
        </div>
      </div>
    </div>
  );
}
