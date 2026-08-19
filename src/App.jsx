import React from 'react';
import { SimulationProvider } from './context/SimulationContext';
import RoverSimulation from './components/3d/RoverSimulation';

function App() {
  return (
    <SimulationProvider>
      <RoverSimulation />
    </SimulationProvider>
  );
}

export default App;