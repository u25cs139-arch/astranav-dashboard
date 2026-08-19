import React, { useState, useEffect } from 'react';
import { SimulationProvider } from './context/SimulationContext';
import LandingPage from './components/1-auth/LandingPage';
import MoonStimulation from './components/moon/MoonStimulation';
import MarsStimulation from './components/Mars/MarsStimulation';
import AstraNavDashboard from './components/AstraNavDashboard';

function App() {
  const [session, setSession] = useState(null);
  const [selectedEnv, setSelectedEnv] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!session) return;
      
      if (e.key === 'F1') {
        e.preventDefault();
        setSelectedEnv('moon');
      } else if (e.key === 'F10') {
        e.preventDefault();
        setSelectedEnv('mars');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [session]);

  if (!session) {
    return <LandingPage onAuthenticated={(data) => setSession(data)} />;
  }

  if (selectedEnv === 'moon') {
    return (
      <SimulationProvider>
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setSelectedEnv(null)}
            style={{ 
              position: 'absolute', 
              top: 15, 
              right: 15, 
              zIndex: 1000, 
              padding: '8px 16px', 
              background: '#00ff66', 
              color: '#000', 
              border: 'none', 
              fontWeight: 'bold', 
              cursor: 'pointer' 
            }}
          >
            ← EXIT TO GATEWAY
          </button>
          <MoonStimulation session={session} />
        </div>
      </SimulationProvider>
    );
  }

  if (selectedEnv === 'mars') {
    return (
      <SimulationProvider>
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setSelectedEnv(null)}
            style={{ 
              position: 'absolute', 
              top: 15, 
              right: 15, 
              zIndex: 1000, 
              padding: '8px 16px', 
              background: '#00ff66', 
              color: '#000', 
              border: 'none', 
              fontWeight: 'bold', 
              cursor: 'pointer' 
            }}
          >
            ← EXIT TO GATEWAY
          </button>
          <MarsStimulation session={session} />
        </div>
      </SimulationProvider>
    );
  }

  return (
    <AstraNavDashboard 
      onSelectMoon={() => setSelectedEnv('moon')} 
      onSelectMars={() => setSelectedEnv('mars')} 
    />
  );
}

export default App;