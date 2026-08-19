import React, { useState } from 'react';
import { SimulationProvider } from './context/SimulationContext';
import RoverSimulation from './components/3d/RoverSimulation';
import LandingPage from './components/1-auth/LandingPage';

function App() {
  const [session, setSession] = useState(null);

  // If user is not authenticated/connected, show the LandingPage
  if (!session) {
    return <LandingPage onAccessGranted={(data) => setSession(data)} />;
  }

  // Once access is granted, load the 3D Rover Simulation
  return (
    <SimulationProvider>
      <RoverSimulation session={session} />
    </SimulationProvider>
  );
}

export default App;