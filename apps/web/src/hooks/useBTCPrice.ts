import { useEffect, useState } from 'react';

let cachedPrice: number | null = null;
let cacheTime = 0;
const CACHE_TTL = 60_000; // 1 minute

export function useBTCPrice(): { price: number | null; loading: boolean } {
  const [price, setPrice] = useState<number | null>(cachedPrice);
  const [loading, setLoading] = useState(cachedPrice === null);

  useEffect(() => {
    const now = Date.now();
    if (cachedPrice !== null && now - cacheTime < CACHE_TTL) {
      setPrice(cachedPrice);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch('https://mempool.space/api/v1/prices')
      .then((r) => r.json() as Promise<{ USD: number }>)
      .then((data) => {
        cachedPrice = data.USD;
        cacheTime = Date.now();
        setPrice(data.USD);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return { price, loading };
}
