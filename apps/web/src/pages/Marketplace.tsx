import React from 'react';
import { useState } from 'react';
import { AssetCard } from '@/components/AssetCard';
import { useAssets } from '@/hooks/useAssets';
import type { AssetCategory } from '@/types';

type FilterCategory = 'all' | AssetCategory;

const FILTERS: { label: string; value: FilterCategory }[] = [
  { label: 'All', value: 'all' },
  { label: 'Real Estate', value: 'real_estate' },
  { label: 'Fixed Income', value: 'fixed_income' },
  { label: 'Commodity', value: 'commodity' },
];

export function Marketplace(): React.JSX.Element {
  const { assets, loading, error } = useAssets();
  const [filter, setFilter] = useState<FilterCategory>('all');

  const filtered = filter === 'all' ? assets : assets.filter((a) => a.category === filter);

  return (
    <div className="page marketplace-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Asset Marketplace</h1>
          <p className="page-subtitle">
            Fractional ownership of institutional-grade real world assets.
          </p>
        </div>

        <div className="filter-bar" role="group" aria-label="Filter by category">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              className={`filter-btn${filter === f.value ? ' filter-btn--active' : ''}`}
              onClick={() => setFilter(f.value)}
              aria-pressed={filter === f.value}
            >
              {f.label}
            </button>
          ))}
        </div>

        {error ? (
          <div className="error-state" role="alert">
            <p>Failed to load assets: {error}</p>
            <p>Make sure the API is running on port 3001.</p>
          </div>
        ) : loading ? (
          <div className="asset-grid" aria-label="Loading assets" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="asset-card-skeleton glass-card" aria-hidden="true">
                <div className="skeleton-block skeleton-block--header" />
                <div className="skeleton-block skeleton-block--title" />
                <div className="skeleton-block skeleton-block--body" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <p>No assets found for this filter.</p>
          </div>
        ) : (
          <div className="asset-grid">
            {filtered.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
