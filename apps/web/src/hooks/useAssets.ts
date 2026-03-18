import { useState, useEffect, useCallback } from 'react';
import { fetchAssets } from '@/lib/api';
import type { Asset } from '@/types';

interface UseAssetsResult {
  assets: Asset[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAssets(): UseAssetsResult {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchAssets();
      setAssets(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const interval = setInterval(() => {
      void load();
    }, 10_000);
    return () => clearInterval(interval);
  }, [load]);

  return { assets, loading, error, refetch: load };
}
