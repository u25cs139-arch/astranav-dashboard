import React, { useState } from 'react';

const Navbar = () => {
  const [activeTab, setActiveTab] = useState('Trajectory Tracking');

  const navTabs = [
    'Trajectory Tracking',
    'Spatial Orientation',
    'Real-Time Imaging',
    'Hardware Architecture',
    'Rover'
  ];

  return (
    <nav style={{
      position: 'fixed',
      top: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      width: '90%',
      maxWidth: '1000px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        padding: '8px 20px',
        backgroundColor: 'rgba(10, 20, 35, 0.7)',
        backdropFilter: 'blur(10px)',
        borderRadius: '50px',
        border: '1px solid rgba(0, 242, 255, 0.3)',
        boxShadow: '0 0 15px rgba(0, 242, 255, 0.2)'
      }}>
        
        {/* ISRO Logo + AstraNav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Indian_Space_Research_Organisation_Logo.svg/1200px-Indian_Space_Research_Organisation_Logo.svg.png" 
            alt="ISRO Logo" 
            style={{ height: '26px', width: 'auto' }}
          />
          <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '15px' }}>
            AstraNav
          </span>
        </div>

        {/* Tabs Bar */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {navTabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  border: isActive ? '1px solid #00f2ff' : 'none',
                  backgroundColor: isActive ? 'rgba(0, 242, 255, 0.15)' : 'transparent',
                  color: isActive ? '#00f2ff' : '#aaa',
                  fontWeight: isActive ? 'bold' : 'normal',
                  transition: '0.2s'
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;