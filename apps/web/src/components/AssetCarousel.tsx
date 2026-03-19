import React, { useRef, useCallback } from 'react';
import type { Asset, AssetCategory } from '@/types';
import { AssetCard } from './AssetCard';

const FILTERS: { key: 'all' | AssetCategory; label: string }[] = [
  { key: 'all',          label: 'All assets'   },
  { key: 'real_estate',  label: 'Real Estate'  },
  { key: 'fixed_income', label: 'Fixed Income' },
  { key: 'commodity',    label: 'Commodity'    },
];

interface Props {
  assets: Asset[];
  filter: 'all' | AssetCategory;
  onFilterChange: (f: 'all' | AssetCategory) => void;
}

export function AssetCarousel({ assets, filter, onFilterChange }: Props): React.JSX.Element {
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0 });

  const filtered = filter === 'all' ? assets : assets.filter((a) => a.category === filter);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!trackRef.current) return;
    drag.current = {
      active: true,
      startX: e.pageX - trackRef.current.offsetLeft,
      scrollLeft: trackRef.current.scrollLeft,
    };
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!drag.current.active || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - drag.current.startX) * 1.6;
    trackRef.current.scrollLeft = drag.current.scrollLeft - walk;
  }, []);

  const onMouseUp = useCallback(() => {
    drag.current.active = false;
  }, []);

  return (
    <section className="carousel-wrapper">
      <div className="carousel-filters">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`filter-pill${filter === f.key ? ' active' : ''}`}
            onClick={() => onFilterChange(f.key)}
            aria-pressed={filter === f.key}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="carousel-empty">No assets match this filter.</div>
      ) : (
        <div
          ref={trackRef}
          className="carousel-track"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          role="list"
          aria-label="Asset carousel"
        >
          {filtered.map((asset, i) => (
            <AssetCard key={asset.id} asset={asset} index={i} />
          ))}
        </div>
      )}

      <div className="carousel-fade-left" aria-hidden="true" />
      <div className="carousel-fade-right" aria-hidden="true" />
    </section>
  );
}
