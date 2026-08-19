import React from 'react';

function AstraNavDashboard({ onSelectMoon, onSelectMars }) {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#030806',
      backgroundImage: 'radial-gradient(circle at center, rgba(0,255,102,0.05) 0%, transparent 70%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'monospace',
      color: '#00ff66',
      boxSizing: 'border-box'
    }}>
      {/* Outer Card Container */}
      <div style={{
        border: '1px solid #00ff66',
        borderRadius: '12px',
        padding: '30px 40px',
        backgroundColor: 'rgba(5, 15, 10, 0.85)',
        boxShadow: '0 0 25px rgba(0, 255, 102, 0.2)',
        textAlign: 'center',
        maxWidth: '900px',
        width: '90%'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', letterSpacing: '2px' }}>
            ASTRA_NAV // GATEWAY
          </div>
          <div style={{ fontSize: '0.85rem', color: '#00cc52', marginTop: '6px', opacity: 0.8 }}>
            SELECT TARGET DEPLOYMENT ENVIRONMENT (USE F1 / F10)
          </div>
        </div>

        {/* Inner Grid / Cards */}
        <div style={{ display: 'flex', gap: '25px', justifyContent: 'center', marginTop: '25px', flexWrap: 'wrap' }}>
          
          {/* Lunar Card */}
          <div style={{
            border: '1px solid #00ff66',
            borderRadius: '8px',
            padding: '25px 20px',
            flex: '1',
            minWidth: '260px',
            backgroundColor: 'rgba(0, 20, 10, 0.6)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#ffe27d',
              boxShadow: '0 0 15px rgba(255, 226, 125, 0.5)',
              marginBottom: '15px'
            }} />
            <h2 style={{ fontSize: '1.2rem', margin: '5px 0' }}>LUNAR SURFACE</h2>
            <p style={{ fontSize: '0.75rem', opacity: 0.7, margin: '0 0 10px 0' }}>ROVER ON MOON</p>
            <div style={{ fontSize: '0.7rem', color: '#00ff66', marginBottom: '20px' }}>
              SYS STATUS: ACTIVE // READY
            </div>
            <button 
              onClick={onSelectMoon}
              style={{
                backgroundColor: '#00ff66',
                color: '#000',
                border: 'none',
                padding: '10px 18px',
                fontWeight: 'bold',
                fontSize: '0.8rem',
                cursor: 'pointer',
                borderRadius: '4px',
                width: '100%',
                letterSpacing: '1px'
              }}
            >
              INITIATE LUNAR LINK [F1]
            </button>
          </div>

          {/* Martian Card */}
          <div style={{
            border: '1px solid #00ff66',
            borderRadius: '8px',
            padding: '25px 20px',
            flex: '1',
            minWidth: '260px',
            backgroundColor: 'rgba(0, 20, 10, 0.6)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#ff4d4d',
              boxShadow: '0 0 15px rgba(255, 77, 77, 0.5)',
              marginBottom: '15px'
            }} />
            <h2 style={{ fontSize: '1.2rem', margin: '5px 0' }}>MARTIAN SURFACE</h2>
            <p style={{ fontSize: '0.75rem', opacity: 0.7, margin: '0 0 10px 0' }}>ROVER ON MARS</p>
            <div style={{ fontSize: '0.7rem', color: '#00ff66', marginBottom: '20px' }}>
              SYS STATUS: ACTIVE // READY
            </div>
            <button 
              onClick={onSelectMars}
              style={{
                backgroundColor: '#00ff66',
                color: '#000',
                border: 'none',
                padding: '10px 18px',
                fontWeight: 'bold',
                fontSize: '0.8rem',
                cursor: 'pointer',
                borderRadius: '4px',
                width: '100%',
                letterSpacing: '1px'
              }}
            >
              INITIATE MARS LINK [F10]
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AstraNavDashboard;