import { create } from 'zustand';
import { OPNetRWAVaultAdapter, CONTRACT_ADDRESS } from '@oprwa/contracts';
import type { Position } from '@/types';

interface WalletState {
  address: string | null;
  connected: boolean;
  verified: boolean;
  network: 'testnet' | 'mainnet';
  walletType: string | null;
  // Portfolio loaded from on-chain
  onChainPositions: Position[];
  portfolioLoading: boolean;
  connect: (address: string, walletType: string) => Promise<void>;
  disconnect: () => void;
  refreshPortfolio: () => Promise<void>;
}

const ASSET_IDS = ['sp-commercial-tower', 'us-tbill-fund', 'gold-vault-reserve'] as const;
const PRICE_PER_FRACTION = 1000; // sats — fixed

async function loadOnChainPortfolio(walletAddress: string): Promise<Position[]> {
  const adapter = new OPNetRWAVaultAdapter(CONTRACT_ADDRESS, 'testnet');
  const now = Date.now();

  const results = await Promise.allSettled(
    ASSET_IDS.map(async (assetId, tokenId) => {
      const balance = await adapter.balanceOf(walletAddress, assetId);
      if (balance === 0n) return null;
      const pos: Position = {
        id: `pos_${assetId}_${walletAddress.slice(-8)}`,
        asset_id: assetId,
        token_id: tokenId,
        amount: Number(balance),
        entry_price: PRICE_PER_FRACTION,
        current_price: PRICE_PER_FRACTION,
        pnl: 0,
        pnl_pct: 0,
        status: 'SETTLED',
        created_at: now,
      };
      return pos;
    })
  );

  const positions: Position[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value !== null) {
      positions.push(result.value);
    }
  }
  return positions;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  address: null,
  connected: false,
  verified: false,
  network: 'testnet',
  walletType: null,
  onChainPositions: [],
  portfolioLoading: false,

  connect: async (address: string, walletType: string) => {
    set({
      address,
      connected: true,
      verified: true,
      network: 'testnet',
      walletType,
      portfolioLoading: true,
    });

    try {
      const positions = await loadOnChainPortfolio(address);
      set({ onChainPositions: positions, portfolioLoading: false });
    } catch {
      set({ onChainPositions: [], portfolioLoading: false });
    }
  },

  disconnect: () => {
    set({
      address: null,
      connected: false,
      verified: false,
      network: 'testnet',
      walletType: null,
      onChainPositions: [],
      portfolioLoading: false,
    });
  },

  refreshPortfolio: async () => {
    const { address } = get();
    if (!address) return;
    set({ portfolioLoading: true });
    try {
      const positions = await loadOnChainPortfolio(address);
      set({ onChainPositions: positions, portfolioLoading: false });
    } catch {
      set({ portfolioLoading: false });
    }
  },
}));
