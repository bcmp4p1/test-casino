import { useEffect, useState } from 'react';
import './App.css'
import { createSession } from './api/casinoApi.ts';
import { Credits } from './components/Credits.tsx';
import { SlotMachine } from './components/SlotMachine.tsx';

function App() {
  const [credits, setCredits] = useState<number>(0);


  const initSession = async () => {
    try {
      const data = await createSession();
      setCredits(data.credits);
    } catch (err) {
      console.error('Failed to create session', err);
      alert('Failed to create session. Please try again later.');
    }
  };

  useEffect(() => {
    initSession()
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: 50 }}>
      <h1>🎰 Slot Machine</h1>
      <SlotMachine credits={credits} setCredits={setCredits} />
      <Credits value={credits} />
    </div>
  );
}

export default App
