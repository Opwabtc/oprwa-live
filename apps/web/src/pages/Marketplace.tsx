import React from 'react';
import { useState } from 'react';
import { AssetCarousel } from '@/components/AssetCarousel';
import { useAssets } from '@/hooks/useAssets';
import type { AssetCategory } from '@/types';

type FilterCategory = 'all' | AssetCategory;

export function Marketplace(): React.JSX.Element {
  const { assets, loading, error } = useAssets();
  const [filter, setFilter] = useState<FilterCategory>('all');

  return (
    <div className="page marketplace-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Asset Marketplace</h1>
          <p className="page-subtitle">
            Fractional ownership of institutional-grade real world assets.
          </p>
        </div>

        {error ? (
          <div className="error-state" role="alert">
            <p>Failed to load assets: {error}</p>
            <p>Check your network connection and try refreshing the page.</p>
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
        ) : (
          <AssetCarousel assets={assets} filter={filter} onFilterChange={setFilter} />
        )}
      </div>
    </div>
  );
}
