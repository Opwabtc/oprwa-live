import React from 'react';
import type { Position } from '@/types';

interface PositionCardProps {
  position: Position;
  assetName?: string;
}

export function PositionCard({ position, assetName }: PositionCardProps): React.JSX.Element {
  const isPnlPositive = position.pnl >= 0;

  return (
    <div className="position-card glass-card">
      <div className="position-card__header">
        <h3 className="position-card__name">{assetName ?? position.asset_id}</h3>
        {position.status === 'PENDING' ? (
          <span className="badge badge--pending" aria-label="Transaction pending">
            Confirming
          </span>
        ) : (
          <span className="badge badge--settled" aria-label="Transaction settled">
            Settled
          </span>
        )}
      </div>

      <div className="position-card__stats">
        <div className="position-card__stat">
          <span className="position-card__stat-label">Amount</span>
          <span className="position-card__stat-value tabular-nums">
            {position.amount.toLocaleString('en-US')} fractions
          </span>
        </div>
        <div className="position-card__stat">
          <span className="position-card__stat-label">Entry Price</span>
          <span className="position-card__stat-value tabular-nums">
            {position.entry_price.toLocaleString('en-US')} sats
          </span>
        </div>
        <div className="position-card__stat">
          <span className="position-card__stat-label">Current Price</span>
          <span className="position-card__stat-value tabular-nums">
            {position.current_price.toLocaleString('en-US')} sats
          </span>
        </div>
        <div className="position-card__stat">
          <span className="position-card__stat-label">P&amp;L</span>
          <span
            className="position-card__stat-value position-card__pnl tabular-nums"
            style={{ color: isPnlPositive ? 'var(--success)' : 'var(--danger)' }}
          >
            {isPnlPositive ? '+' : ''}
            {position.pnl.toLocaleString('en-US', { maximumFractionDigits: 0 })} sats
            {' '}({isPnlPositive ? '+' : ''}
            {position.pnl_pct.toFixed(2)}%)
          </span>
        </div>
      </div>
    </div>
  );
}
