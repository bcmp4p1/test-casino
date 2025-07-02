import React from 'react';

interface Props {
  value: number;
}

export const Credits: React.FC<Props> = ({ value }) => {
  return (
    <div>
      <p style={{ fontSize: '20px', marginBottom: '20px' }}>
        Credits: <strong>{value}</strong>
      </p>
    </div>
  );
};
