import { useEffect, useState } from 'react';
import './App.css'
import { cashout, createSession } from './api/casinoApi.ts';
import { Credits } from './components/Credits/Credits.tsx';
import { SlotMachine } from './components/SlotMachine/SlotMachine.tsx';

function App() {
  const [credits, setCredits] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionClosed, setSessionClosed] = useState(false);

  const initSession = async () => {
    try {
      const data = await createSession();
      setCredits(data.credits);
    } catch (err) {
      alert('Failed to create session. Please try again later.');
    }
  };

  useEffect(() => {
    initSession()
  }, []);

  const handleCashOut = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await cashout();
      alert(`You cashed out ${response.finalCredits} credits!`);
      setCredits(0);
      setSessionClosed(true);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Cash out failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: 50 }}>
      <h1>Slot Machine</h1>
      <SlotMachine credits={credits} setCredits={setCredits} sessionClosed={sessionClosed} />
      <Credits
        value={credits}
        isLoading={isLoading}
        error={error}
        onCashOut={handleCashOut}
      />
    </div>
  );
}

export default App
