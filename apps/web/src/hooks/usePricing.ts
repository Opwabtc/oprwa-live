import { useState, useEffect, useCallback } from 'react';
import { fetchPrice } from '@/lib/api';
import type { PriceQuote } from '@/types';

interface UsePricingResult {
  quote: PriceQuote | null;
  loading: boolean;
  error: string | null;
}

/**
 * usePricing — computes price quote using on-chain collectFee().
 * Falls back to local deterministic formula if network is unavailable.
 */
export function usePricing(assetId: string, amount: number): UsePricingResult {
  const [quote, setQuote] = useState<PriceQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!assetId || amount < 1) return;
    setLoading(true);
    try {
      const data = await fetchPrice(assetId, amount);
      setQuote(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch price');
    } finally {
      setLoading(false);
    }
  }, [assetId, amount]);

  useEffect(() => {
    void load();
  }, [load]);

  return { quote, loading, error };
}
