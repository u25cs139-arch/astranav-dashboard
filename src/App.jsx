import React, { useState, useEffect } from 'react';
import { SimulationProvider } from './context/SimulationContext';
import LandingPage from './components/1-auth/LandingPage';
import ModuleSelection from './components/navigation/ModuleSelection';
import MoonStimulation from './components/moon/MoonStimulation';
import MarsStimulation from './components/Mars/MarsStimulation';

function App() {
  const [session, setSession] = useState(null);
  const [selectedEnv, setSelectedEnv] = useState(null);
  const [activeModule, setActiveModule] = useState(null);

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

  if (!activeModule) {
    return (
      <ModuleSelection 
        selectedTarget={selectedEnv || session?.environment || 'moon'}
        roverId={session?.roverId || 'CHANDRAYAAN-2'}
        onSelectModule={(module) => setActiveModule(module)}
        onBack={() => {
          setSession(null);
          setSelectedEnv(null);
        }}
      />
    );
  }

  const currentEnv = selectedEnv || session?.environment?.toLowerCase();
  const isSimulationActive = activeModule === 'LIVE_NAVIGATION';

  if (isSimulationActive && currentEnv === 'moon') {
    return (
      <SimulationProvider>
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setActiveModule(null)}
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
            ← BACK TO CONTROL PANEL
          </button>
          <MoonStimulation session={session} />
        </div>
      </SimulationProvider>
    );
  }

  if (isSimulationActive && currentEnv === 'mars') {
    return (
      <SimulationProvider>
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setActiveModule(null)}
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
            ← BACK TO CONTROL PANEL
          </button>
          <MarsStimulation session={session} />
        </div>
      </SimulationProvider>
    );
  }

  return null;
}

export default App;