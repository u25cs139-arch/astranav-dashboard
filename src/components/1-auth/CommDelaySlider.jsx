import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import './CommDelaySlider.css';

export default function CommDelaySlider() {
  const { commDelay, setCommDelay } = useSimulation();

  return (
    <div className="slider-container">
      <label className="slider-label">
        Communication Delay: <span className="delay-value">{commDelay}s</span>
      </label>
      <input
        type="range"
        min="0"
        max="30"
        step="1"
        value={commDelay}
        onChange={(e) => setCommDelay(Number(e.target.value))}
        className="delay-slider"
      />
      <div className="slider-hints">
        <span>0s (LEO)</span>
        <span>12s (Mars Min)</span>
        <span>30s (Mars Max)</span>
      </div>
    </div>
  );
}
