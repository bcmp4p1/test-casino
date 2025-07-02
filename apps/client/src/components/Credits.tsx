import React from 'react';

interface Props {
  value: number;
  isLoading?: boolean;
  error?: string | null;
  onCashOut: () => void;
}

export const Credits: React.FC<Props> = ({ value, isLoading, error, onCashOut }) => {
  return (
    <div>
      <p style={{ fontSize: '20px', marginBottom: '20px' }}>
        Credits: <strong>{value}</strong>
      </p>
      {value > 0 && (
        <button
          onClick={onCashOut}
          disabled={isLoading || value === 0}
          style={{
            backgroundColor: '#007bff',
            color: '#fff',
            padding: '8px 16px',
            border: 'none',
            borderRadius: 4,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? 'Processing...' : 'Cash Out'}
        </button>
      )}

      {error && (
        <p style={{ color: 'red', marginTop: 10 }}>
          {error}
        </p>
      )}
    </div>
  );
};
