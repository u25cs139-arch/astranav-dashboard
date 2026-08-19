import React, { useState } from 'react';

export default function ModuleSelection({ selectedTarget, roverId, onSelectModule, onBack }) {
  const [activeTab, setActiveTab] = useState('Trajectory Tracking');

  const tabs = [
    { name: 'Trajectory Tracking', action: 'LIVE_NAVIGATION' },
    { name: 'Spatial Orientation', action: 'SPATIAL' },
    { name: 'Real-Time Imaging', action: 'LIVE_VISUALS' },
    { name: 'Hardware Architecture', action: 'HARDWARE' },
    { name: 'Rover', action: 'ROVER' }
  ];

  const handleTabClick = (tab) => {
    setActiveTab(tab.name);
    if (tab.action === 'LIVE_NAVIGATION' || tab.action === 'LIVE_VISUALS') {
      onSelectModule(tab.action);
    } else {
      alert(`${tab.name} module initialized.`);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
          filter: 'brightness(0.35)'
        }}
      >
        <source src="/0819.mp4" type="video/mp4" />
      </video>

      {/* Control Panel Card */}
      <div className="gateway-card" style={{ 
        position: 'relative', 
        zIndex: 1, 
        maxWidth: '520px', 
        width: '90%', 
        margin: '0 auto', 
        textAlign: 'center', 
        background: 'rgba(10, 15, 20, 0.85)', 
        padding: '28px', 
        borderRadius: '16px', 
        border: '1px solid #00e5ff',
        boxShadow: '0 0 20px rgba(0, 229, 255, 0.15)',
        backdropFilter: 'blur(8px)' 
      }}>
        <div className="gateway-header">
          <h2 style={{ color: '#00e5ff', fontFamily: 'monospace', margin: '0 0 8px 0', letterSpacing: '1px' }}>
            ASTRA_NAV // CONTROL PANEL
          </h2>
          <p style={{ color: '#888', fontSize: '12px', fontFamily: 'monospace' }}>
            DEPLOYMENT: {selectedTarget?.toUpperCase()} | ROVER ID: {roverId}
          </p>
        </div>

        {/* 5 Cyberpunk-style Navigation Tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '24px' }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.name;
            return (
              <button
                key={tab.name}
                onClick={() => handleTabClick(tab)}
                style={{
                  padding: '12px 20px',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  borderRadius: '24px',
                  border: isActive ? '1.5px solid #00e5ff' : '1px solid rgba(255, 255, 255, 0.12)',
                  backgroundColor: isActive ? 'rgba(0, 229, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                  color: isActive ? '#00e5ff' : '#aaa',
                  fontWeight: isActive ? 'bold' : 'normal',
                  textAlign: 'center',
                  transition: 'all 0.25s ease',
                  boxShadow: isActive ? '0 0 12px rgba(0, 229, 255, 0.35)' : 'none'
                }}
              >
                {tab.name}
              </button>
            );
          })}
        </div>

        <button 
          onClick={onBack} 
          style={{ marginTop: '24px', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontFamily: 'monospace' }}
        >
          ← BACK TO ROVER ID
        </button>
      </div>
    </div>
  );
}