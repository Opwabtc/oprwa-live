import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Position, Transaction, TxStatus } from '@/types';

interface PortfolioState {
  positions: Position[];
  transactions: Transaction[];
  addPendingTx: (tx: Transaction) => void;
  settleTx: (txId: string) => void;
  failTx: (txId: string) => void;
  setStatus: (txId: string, status: TxStatus) => void;
  reset: () => void;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist((set) => ({
  positions: [],
  transactions: [],

  addPendingTx: (tx) => {
    set((state) => ({
      transactions: [...state.transactions, tx],
    }));
  },

  settleTx: (txId) => {
    set((state) => {
      const tx = state.transactions.find((t) => t.id === txId);
      if (!tx) return state;

      const now = Date.now();
      const updatedTx: Transaction = { ...tx, status: 'SETTLED', settled_at: now };

      const newPosition: Position = {
        id: `pos_${txId}`,
        asset_id: tx.asset_id,
        token_id: tx.token_id,
        amount: tx.amount,
        entry_price: tx.price_per_fraction,
        current_price: tx.price_per_fraction,
        pnl: 0,
        pnl_pct: 0,
        status: 'SETTLED',
        created_at: tx.created_at,
        settled_at: now,
      };

      return {
        transactions: state.transactions.map((t) => (t.id === txId ? updatedTx : t)),
        positions: [...state.positions, newPosition],
      };
    });
  },

  failTx: (txId) => {
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === txId ? { ...t, status: 'FAILED' as TxStatus } : t
      ),
    }));
  },

  setStatus: (txId, status) => {
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === txId ? { ...t, status } : t
      ),
    }));
  },

  reset: () => {
    set({ positions: [], transactions: [] });
  },
  }),
  { name: 'oprwa-portfolio' }
));
