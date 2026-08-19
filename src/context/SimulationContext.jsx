import React, { createContext, useState, useContext } from 'react';

const SimulationContext = createContext();

export function SimulationProvider({ children }) {
  const [commDelay, setCommDelay] = useState(12);

  return (
    <SimulationContext.Provider value={{ commDelay, setCommDelay }}>
      {children}
    </SimulationContext.Provider>
  );
}

export const useSimulation = () => useContext(SimulationContext);
