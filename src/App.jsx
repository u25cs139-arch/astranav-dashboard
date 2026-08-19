import React, { useState, useEffect } from 'react';
import { SimulationProvider } from './context/SimulationContext';
import LandingPage from './components/1-auth/LandingPage';
import MoonStimulation from './components/moon/MoonStimulation';
import MarsStimulation from './components/Mars/MarsStimulation';

function App() {
  const [session, setSession] = useState(null);
  const [selectedEnv, setSelectedEnv] = useState(null);

  // Set the environment immediately when session completes authentication
  const handleAuthenticated = (data) => {
    setSession(data);
    if (data.environment) {
      setSelectedEnv(data.environment.toLowerCase());
    }
  };

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
    return <LandingPage onAuthenticated={handleAuthenticated} />;
  }

  if (selectedEnv === 'moon' || session?.environment?.toLowerCase() === 'moon') {
    return (
      <SimulationProvider>
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => {
              setSession(null);
              setSelectedEnv(null);
            }}
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

  if (selectedEnv === 'mars' || session?.environment?.toLowerCase() === 'mars') {
    return (
      <SimulationProvider>
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => {
              setSession(null);
              setSelectedEnv(null);
            }}
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

  return null;
}

export default App;