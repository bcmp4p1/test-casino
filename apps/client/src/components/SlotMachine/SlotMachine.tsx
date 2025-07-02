import React, { useState } from 'react';
import { roll } from '../../api/casinoApi.ts';

interface Props {
  credits: number;
  setCredits: (credits: number) => void;
  sessionClosed: boolean;
}

export const SlotMachine: React.FC<Props> = ({ credits, setCredits, sessionClosed }) => {
  const [result, setResult] = useState<string[]>(['-', '-', '-']);
  const [isSpinning, setIsSpinning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoll = async () => {
    setIsSpinning(true);
    setError(null);
    setResult(['X', 'X', 'X']);

    try {
      const data = await roll();
      const rollResult = data.result;

      setTimeout(() => setResult([rollResult[0], 'X', 'X']), 1000);
      setTimeout(() => setResult([rollResult[0], rollResult[1], 'X']), 2000);
      setTimeout(() => {
        setResult(rollResult);
        setCredits(data.credits);
        setIsSpinning(false);
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
      setIsSpinning(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        {result.map((res, index) => (
          <div
            key={index}
            style={{
              fontSize: 40,
              width: '60px',
              height: '60px',
              border: '1px solid black',
              borderRadius: '4px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
          }}
          >
            {res || '-'}
          </div>
        ))}
      </div>
      <button onClick={handleRoll} disabled={isSpinning || credits === 0} style={{ marginTop: '20px' }}>
        {isSpinning ? 'Spinning...' : 'Spin'}
      </button>
      {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}
      {sessionClosed ? (
        <p style={{ color: 'gray', marginTop: 10 }}>
          Funds withdrawn. Please refresh the page to start a new session.
        </p>
      ) : credits === 0 && (
        <p style={{ color: 'orange', marginTop: 10 }}>
          You're out of credits.
        </p>
      )}
    </div>
  );
};
