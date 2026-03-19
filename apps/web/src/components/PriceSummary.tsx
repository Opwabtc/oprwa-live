import React from 'react';

interface PriceSummaryProps {
  pricePerUnit: number;
  quantity: number;
  fee: number | null; // null = loading
  symbol?: string;
}

export function PriceSummary({ pricePerUnit, quantity, fee, symbol = 'sats' }: PriceSummaryProps): React.JSX.Element {
  const subtotal = pricePerUnit * quantity;
  const total = fee !== null ? subtotal + fee : subtotal;

  return (
    <div className="price-summary">
      <div className="price-summary__row">
        <span className="price-summary__label">Subtotal</span>
        <span className="price-summary__value">{subtotal.toLocaleString()} {symbol}</span>
      </div>
      <div className="price-summary__row" style={{ opacity: fee === null ? 0.4 : 1, transition: 'opacity 0.2s' }}>
        <span className="price-summary__label">Platform fee</span>
        <span className="price-summary__value">{fee !== null ? fee.toLocaleString() : '—'} {symbol}</span>
      </div>
      <div className="price-summary__row price-summary__row--total">
        <span className="price-summary__label">Total</span>
        <span className="price-summary__value">{total.toLocaleString()} {symbol}</span>
      </div>
    </div>
  );
}
