import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

const ASSET_IDS = [
  'sp-commercial-tower',
  'us-tbill-fund',
  'gold-vault-reserve',
  'miami-sunset-bay',
  'manhattan-midtown-commerce',
  'dubai-marina-view',
  'eu-corporate-bond-fund',
  'silver-vault-zurich',
  'london-grade-a-office',
] as const;

// tokenId matches array index (mirrors contract storage layout)
const ASSET_TOKEN_IDS: Record<string, number> = {
  'sp-commercial-tower': 0,
  'us-tbill-fund': 1,
  'gold-vault-reserve': 2,
  'miami-sunset-bay': 3,
  'manhattan-midtown-commerce': 4,
  'dubai-marina-view': 5,
  'eu-corporate-bond-fund': 6,
  'silver-vault-zurich': 7,
  'london-grade-a-office': 8,
};

const PRICE_PER_FRACTION = 1000; // sats — fixed

async function loadOnChainPortfolio(walletAddress: string): Promise<Position[]> {
  const adapter = new OPNetRWAVaultAdapter(CONTRACT_ADDRESS, 'testnet');
  const now = Date.now();

  const results = await Promise.allSettled(
    ASSET_IDS.map(async (assetId) => {
      const tokenId = ASSET_TOKEN_IDS[assetId] ?? 0;
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

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
  address: null,
  connected: false,
  verified: false,
  network: 'testnet' as const,
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
}),
{
  name: 'oprwa-wallet',
  partialize: (state) => ({
    address: state.address,
    walletType: state.walletType,
    network: state.network,
    connected: state.connected,
    verified: state.verified,
  }),
}
));
