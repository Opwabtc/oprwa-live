import { useState, useEffect, useCallback } from 'react';
import { fetchPortfolio } from '@/lib/api';
import type { Position } from '@/types';

interface UsePortfolioResult {
  positions: Position[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePortfolio(wallet: string | null): UsePortfolioResult {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!wallet) {
      setPositions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchPortfolio(wallet);
      setPositions(data);
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

  return { positions, loading, error, refetch: load };
}
