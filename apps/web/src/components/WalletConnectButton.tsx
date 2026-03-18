import React from 'react';
import { useState } from 'react';
import { useWalletStore } from '@/store/walletStore';
import { WalletPickerModal } from './WalletPickerModal';

function truncateAddress(addr: string): string {
  if (addr.length <= 16) return addr;
  return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
}

export function WalletConnectButton(): React.JSX.Element {
  const { address, connected, network } = useWalletStore();
  const [modalOpen, setModalOpen] = useState(false);

  if (connected && address) {
    return (
      <div className="wallet-btn wallet-btn--connected" aria-label="Wallet connected">
        <span className="wallet-btn__dot" aria-hidden="true" />
        <span className="wallet-btn__address">{truncateAddress(address)}</span>
        <span className="wallet-btn__network">{network}</span>
      </div>
    );
  }

  return (
    <>
      <button
        className="wallet-btn wallet-btn--connect"
        onClick={() => setModalOpen(true)}
        aria-label="Connect Bitcoin wallet"
      >
        Connect Wallet
      </button>
      <WalletPickerModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
