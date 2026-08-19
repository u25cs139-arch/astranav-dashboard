import React, { useState } from 'react';

const ROVER_DATABASE = {
  "ROVER-01": "ASTRA_EXPLORER_ALPHA",
  "ROVER-02": "ASTRA_VOYAGER_BETA",
  "ASTRA-X1": "ASTRA_TITAN_GAMMA"
};

export default function LandingPage({ onAccessGranted }) {
  const [roverId, setRoverId] = useState('');
  const [roverName, setRoverName] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');

  const handleIdChange = (e) => {
    const value = e.target.value.toUpperCase();
    setRoverId(value);
    
    if (ROVER_DATABASE[value]) {
      setRoverName(ROVER_DATABASE[value]);
      setError('');
    } else {
      setRoverName('');
    }
  };

  const handleSelectRover = () => {
    if (roverName) {
      setStep(2);
      setError('');
    } else {
      setError('INVALID ROVER IDENTIFIER');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password) {
      setError('PASSWORD REQUIRED');
      return;
    }
    onAccessGranted({ roverId, roverName, password });
  };

  return (
    <div style={styles.pageContainer}>
      <video autoPlay loop muted playsInline style={styles.bgVideo}>
        <source src="/assets/videos/space-hero.mp4" type="video/mp4" />
      </video>

      <div style={styles.videoOverlay} />

      <div style={styles.terminalCard}>
        <div style={styles.cardHeader}>
          <div style={styles.hudDot} />
          <span style={styles.cardTitle}>ASTRANAV // ORBITAL LINK</span>
        </div>

        {step === 1 && (
          <div style={styles.formSection}>
            <label style={styles.label}>[ SYSTEM_SEARCH ]</label>
            <input
              type="text"
              placeholder="ENTER ROVER ID (e.g. ROVER-01)"
              value={roverId}
              onChange={handleIdChange}
              style={styles.inputField}
            />

            {roverName && (
              <div onClick={handleSelectRover} style={styles.roverResultCard}>
                <div>
                  <div style={styles.statusBadge}>● ONLINE</div>
                  <div style={styles.roverNameText}>{roverName}</div>
                </div>
                <span style={styles.actionArrow}>SELECT →</span>
              </div>
            )}

            {error && <div style={styles.errorBanner}>{error}</div>}
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} style={styles.formSection}>
            <div style={styles.connectionBanner}>
              TARGET: <span style={{ color: '#00ff66' }}>{roverName}</span>
            </div>

            <label style={styles.label}>[ SET_SESSION_KEY ]</label>
            <input
              type="password"
              placeholder="ENTER ACCESS PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.inputField}
              autoFocus
            />

            {error && <div style={styles.errorBanner}>{error}</div>}

            <div style={styles.buttonGroup}>
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                style={styles.backButton}
              >
                BACK
              </button>
              <button type="submit" style={styles.submitButton}>
                INITIALIZE LINK
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    fontFamily: '"Courier New", Consolas, monospace',
  },
  bgVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: 1,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle, rgba(5,15,25,0.6) 0%, rgba(2,6,12,0.88) 100%)',
    zIndex: 2,
  },
  terminalCard: {
    position: 'relative',
    zIndex: 3,
    width: '420px',
    padding: '28px',
    background: 'rgba(6, 18, 22, 0.85)',
    border: '1px solid rgba(0, 255, 102, 0.4)',
    borderRadius: '6px',
    boxShadow: '0 0 30px rgba(0, 255, 102, 0.15)',
    backdropFilter: 'blur(10px)',
    color: '#00ff66',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '24px',
    paddingBottom: '12px',
    borderBottom: '1px solid rgba(0, 255, 102, 0.2)',
  },
  hudDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#00ff66',
    boxShadow: '0 0 8px #00ff66',
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    letterSpacing: '2px',
  },
  formSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  label: {
    fontSize: '11px',
    color: '#a0e0b0',
    letterSpacing: '1px',
  },
  inputField: {
    padding: '12px 14px',
    background: 'rgba(2, 10, 12, 0.9)',
    border: '1px solid #00ff66',
    borderRadius: '3px',
    color: '#00ff66',
    fontFamily: '"Courier New", Consolas, monospace',
    fontSize: '13px',
    outline: 'none',
  },
  roverResultCard: {
    padding: '12px 16px',
    background: 'rgba(0, 255, 102, 0.08)',
    border: '1px dashed #00ff66',
    borderRadius: '3px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    fontSize: '10px',
    color: '#00ff66',
    marginBottom: '2px',
  },
  roverNameText: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#ffffff',
  },
  actionArrow: {
    fontSize: '12px',
    fontWeight: 'bold',
  },
  connectionBanner: {
    fontSize: '12px',
    padding: '10px',
    background: 'rgba(0, 255, 102, 0.05)',
    borderLeft: '3px solid #00ff66',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
  },
  backButton: {
    padding: '12px',
    background: 'transparent',
    border: '1px solid #00ff66',
    color: '#00ff66',
    fontFamily: '"Courier New", Consolas, monospace',
    fontSize: '12px',
    cursor: 'pointer',
  },
  submitButton: {
    flex: 1,
    padding: '12px',
    background: '#00ff66',
    border: 'none',
    color: '#02060c',
    fontWeight: 'bold',
    fontFamily: '"Courier New", Consolas, monospace',
    fontSize: '12px',
    cursor: 'pointer',
  },
  errorBanner: {
    fontSize: '11px',
    color: '#ff4444',
  }
};