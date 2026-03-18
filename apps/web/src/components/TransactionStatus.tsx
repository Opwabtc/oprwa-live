import React from 'react';
import { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import type { Transaction } from '@/types';

interface TransactionStatusProps {
  transaction: Transaction;
  onDismiss?: () => void;
}

export function TransactionStatus({ transaction, onDismiss }: TransactionStatusProps): React.JSX.Element {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (transaction.status === 'SETTLED' || transaction.status === 'FAILED') {
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [transaction.status, onDismiss]);

  if (!visible) return <></>;

  return (
    <div
      className={`tx-status tx-status--${transaction.status.toLowerCase()}`}
      role="status"
      aria-live="polite"
      aria-label={`Transaction ${transaction.status.toLowerCase()}`}
    >
      <div className="tx-status__icon" aria-hidden="true">
        {transaction.status === 'PENDING' ? (
          <span className="tx-status__spinner" />
        ) : transaction.status === 'SETTLED' ? (
          <CheckCircle size={16} color="var(--success)" />
        ) : (
          <AlertTriangle size={16} color="var(--danger)" />
        )}
      </div>
      <div className="tx-status__content">
        <span className="tx-status__label">
          {transaction.status === 'PENDING'
            ? 'Confirming...'
            : transaction.status === 'SETTLED'
              ? 'Position added'
              : 'Transaction failed'}
        </span>
        <span className="tx-status__id">{transaction.id.slice(0, 16)}...</span>
      </div>
      {onDismiss && (
        <button className="tx-status__dismiss" onClick={onDismiss} aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
  );
}
