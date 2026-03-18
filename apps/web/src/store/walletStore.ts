import { create } from 'zustand';

interface WalletState {
  address: string | null;
  connected: boolean;
  verified: boolean;
  network: 'testnet' | 'mainnet';
  connect: (address?: string) => void;
  disconnect: () => void;
}

function generateMockAddress(): string {
  const chars = '0123456789abcdef';
  let addr = 'opt1sq';
  for (let i = 0; i < 38; i++) {
    addr += chars[Math.floor(Math.random() * chars.length)];
  }
  return addr;
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  connected: false,
  verified: false,
  network: 'testnet',

  connect: (address?: string) => {
    const mockAddress = address ?? generateMockAddress();
    set({
      address: mockAddress,
      connected: true,
      verified: true, // Auto-verify on testnet (TestnetKYC)
      network: 'testnet',
    });
  },

  disconnect: () => {
    set({
      address: null,
      connected: false,
      verified: false,
      network: 'testnet',
    });
  },
}));
