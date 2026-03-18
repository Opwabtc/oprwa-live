import { useState, useEffect, useCallback } from 'react';
import { fetchPortfolio } from '@/lib/api';
import { useWalletStore } from '@/store/walletStore';
import { usePortfolioStore } from '@/store/portfolioStore';
import type { Position } from '@/types';

interface UsePortfolioResult {
  positions: Position[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * usePortfolio — merges on-chain positions (from walletStore) with
 * locally tracked pending/settled transactions (from portfolioStore).
 * On-chain data is authoritative; local transactions are shown while pending.
 */
export function usePortfolio(wallet: string | null): UsePortfolioResult {
  const { onChainPositions, portfolioLoading } = useWalletStore();
  const { positions: localPositions } = usePortfolioStore();
  const [fetchedPositions, setFetchedPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!wallet) {
      setFetchedPositions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchPortfolio(wallet);
      setFetchedPositions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  }, [wallet]);

  useEffect(() => {
    void load();
  }, [load]);

  // Merge on-chain positions with locally tracked transactions.
  // On-chain positions come from walletStore (loaded at connect time and refreshed post-tx).
  // Local positions fill in during pending settlement.
  const onChain = onChainPositions.length > 0 ? onChainPositions : fetchedPositions;

  // Add local positions that don't already exist on-chain
  const onChainIds = new Set(onChain.map((p) => p.asset_id));
  const localOnlyPositions = localPositions.filter(
    (p) => !onChainIds.has(p.asset_id) && p.status !== 'FAILED'
  );

  const merged = [...onChain, ...localOnlyPositions];

  return {
    positions: merged,
    loading: loading || portfolioLoading,
    error,
    refetch: load,
  };
}
