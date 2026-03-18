import { useState, useEffect, useCallback } from 'react';
import { fetchAssets, STATIC_ASSETS } from '@/lib/api';
import type { Asset } from '@/types';

interface UseAssetsResult {
  assets: Asset[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAssets(): UseAssetsResult {
  // Initialize with static data immediately — page never shows empty skeleton
  const [assets, setAssets] = useState<Asset[]>(STATIC_ASSETS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchAssets();
      // Only update if we got real data back
      if (data.length > 0) setAssets(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assets');
      // Keep existing assets (static fallback) on error — never blank the page
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const interval = setInterval(() => {
      void load();
    }, 15_000);
    return () => clearInterval(interval);
  }, [load]);

  return { assets, loading, error, refetch: load };
}
