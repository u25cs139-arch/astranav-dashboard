import React, { useState, useEffect } from 'react';

const VALID_OFFICERS = {
  'OFFICER-7': 'astra2026',
  'ADMIN-01': 'secure123',
};

const VALID_ROVERS = {
  'ROVER-01': 'rover123',
  'ROVER-02': 'rover123',
  'ASTRA-X1': 'astra123',
};

export default function LandingPage({ onAuthenticated }) {
  const [step, setStep] = useState(1);
  const [officerId, setOfficerId] = useState('');
  const [officerPassword, setOfficerPassword] = useState('');
  const [selectedEnvironment, setSelectedEnvironment] = useState('');
  const [roverId, setRoverId] = useState('');
  const [roverPassword, setRoverPassword] = useState('');
  const [error, setError] = useState('');

  const handleSelectEnvironment = (env) => {
    setSelectedEnvironment(env);
    setError('');
    setStep(3);
  };

  // KEYBOARD SHORTCUTS FOR F1 (MOON) AND F10 (MARS)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (step === 2) {
        if (e.key === 'F1') {
          e.preventDefault();
          handleSelectEnvironment('MOON');
        } else if (e.key === 'F10') {
          e.preventDefault();
          handleSelectEnvironment('MARS');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step]);

  const handleOfficerLogin = (e) => {
    e.preventDefault();
    if (VALID_OFFICERS[officerId] && VALID_OFFICERS[officerId] === officerPassword) {
      setError('');
      setStep(2);
    } else {
      setError('INVALID OFFICER ID OR PASSWORD');
    }
  };

  const handleRoverIdSubmit = (e) => {
    e.preventDefault();
    const formattedId = roverId.toUpperCase();
    if (VALID_ROVERS[formattedId]) {
      setError('');
      setStep(4);
    } else {
      setError('INVALID ROVER ID');
    }
  };

  const handleRoverPasswordSubmit = (e) => {
    e.preventDefault();
    const formattedId = roverId.toUpperCase();
    if (VALID_ROVERS[formattedId] === roverPassword) {
      setError('');
      // Send complete auth payload directly to bypass duplicate environment screen
      onAuthenticated({
        officerId,
        environment: selectedEnvironment,
        roverId: formattedId,
        isAuthenticated: true,
      });
    } else {
      setError('INCORRECT ROVER PASSWORD');
    }
  };

  return (
    <div style={styles.container}>
      <video autoPlay loop muted style={styles.videoBg}>
        <source src="/assets/videos/space-hero.mp4" type="video/mp4" />
      </video>
      <div style={styles.overlay} />

      <div 
        style={{ 
          ...styles.terminalBox, 
          width: step === 2 ? '85vw' : '380px',
          height: step === 2 ? '80vh' : 'auto',
        }}
      >
        <div style={styles.logoContainer}>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/b/bd/Indian_Space_Research_Organisation_Logo.svg" 
            alt="ISRO Logo" 
            style={styles.logo} 
          />
        </div>

        <h1 style={styles.title}>ASTRA_NAV // GATEWAY</h1>

        {error && <div style={styles.errorText}>[!] {error}</div>}

        {/* STEP 1: OFFICER LOGIN */}
        {step === 1 && (
          <form onSubmit={handleOfficerLogin} style={styles.form}>
            <label style={styles.label}>OFFICER ID</label>
            <input
              type="text"
              value={officerId}
              onChange={(e) => setOfficerId(e.target.value.toUpperCase())}
              placeholder="e.g. OFFICER-7"
              style={styles.input}
              required
            />
            <label style={styles.label}>PASSWORD</label>
            <input
              type="password"
              value={officerPassword}
              onChange={(e) => setOfficerPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              required
            />
            <button type="submit" style={styles.button}>LOGIN</button>
          </form>
        )}

        {/* STEP 2: FULL-SCREEN DEPLOYMENT SELECTION */}
        {step === 2 && (
          <div style={styles.fullSelectionWrapper}>
            <p style={styles.subtext}>SELECT TARGET DEPLOYMENT ENVIRONMENT (USE F1 / F10)</p>
            <div style={styles.largeCardsContainer}>
              {/* LUNAR CARD */}
              <div 
                style={styles.largeCard} 
                onClick={() => handleSelectEnvironment('MOON')}
              >
                <div style={styles.cardIcon}>🌕</div>
                <h2 style={styles.cardHeader}>LUNAR SURFACE</h2>
                <p style={styles.cardSub}>ROVER ON MOON</p>
                <span style={styles.cardStatus}>SYS STATUS: ACTIVE // READY</span>
                <button style={styles.largeCardButton}>INITIATE LUNAR LINK [F1]</button>
              </div>

              {/* MARTIAN CARD */}
              <div 
                style={styles.largeCard} 
                onClick={() => handleSelectEnvironment('MARS')}
              >
                <div style={styles.cardIcon}>🔴</div>
                <h2 style={styles.cardHeader}>MARTIAN SURFACE</h2>
                <p style={styles.cardSub}>ROVER ON MARS</p>
                <span style={styles.cardStatus}>SYS STATUS: ACTIVE // READY</span>
                <button style={styles.largeCardButton}>INITIATE MARS LINK [F10]</button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: ROVER ID ENTRY */}
        {step === 3 && (
          <form onSubmit={handleRoverIdSubmit} style={styles.form}>
            <p style={styles.subtext}>DEPLOYMENT: {selectedEnvironment}</p>
            <label style={styles.label}>ENTER ROVER ID</label>
            <input
              type="text"
              value={roverId}
              onChange={(e) => setRoverId(e.target.value.toUpperCase())}
              placeholder="e.g. ROVER-01"
              style={styles.input}
              required
              autoFocus
            />
            <button type="submit" style={styles.button}>NEXT</button>
          </form>
        )}

        {/* STEP 4: ROVER PASSWORD ENTRY */}
        {step === 4 && (
          <form onSubmit={handleRoverPasswordSubmit} style={styles.form}>
            <p style={styles.subtext}>ROVER: {roverId}</p>
            <label style={styles.label}>ENTER ROVER PASSWORD</label>
            <input
              type="password"
              value={roverPassword}
              onChange={(e) => setRoverPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              required
              autoFocus
            />
            <button type="submit" style={styles.button}>LAUNCH TELEMETRY</button>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    color: '#00ff66',
    fontFamily: 'monospace',
    overflow: 'hidden',
  },
  videoBg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: 1,
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 2,
  },
  terminalBox: {
    position: 'relative',
    zIndex: 3,
    border: '1px solid #00ff66',
    padding: '2rem',
    borderRadius: '12px',
    backgroundColor: 'rgba(3, 10, 3, 0.9)',
    boxShadow: '0 0 25px rgba(0, 255, 102, 0.25)',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '0.8rem',
  },
  logo: {
    height: '55px',
    width: 'auto',
    filter: 'drop-shadow(0 0 6px rgba(0, 255, 102, 0.6))',
  },
  title: {
    fontSize: '1.2rem',
    marginBottom: '1rem',
    textAlign: 'center',
    letterSpacing: '2px',
  },
  subtext: {
    fontSize: '0.9rem',
    marginBottom: '1.5rem',
    textAlign: 'center',
    color: '#00cc52',
    letterSpacing: '1px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
  },
  fullSelectionWrapper: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'center',
  },
  largeCardsContainer: {
    display: 'flex',
    gap: '2rem',
    flex: 1,
    paddingBottom: '1rem',
  },
  largeCard: {
    flex: 1,
    border: '2px solid #00ff66',
    borderRadius: '10px',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 25, 5, 0.7)',
    cursor: 'pointer',
    boxShadow: 'inset 0 0 15px rgba(0, 255, 102, 0.1)',
    transition: 'transform 0.2s ease, boxShadow 0.2s ease',
  },
  cardIcon: {
    fontSize: '5rem',
    marginBottom: '1rem',
  },
  cardHeader: {
    fontSize: '1.4rem',
    color: '#00ff66',
    margin: '0.4rem 0',
    letterSpacing: '2px',
  },
  cardSub: {
    fontSize: '0.95rem',
    color: '#00cc52',
    marginBottom: '1rem',
  },
  cardStatus: {
    fontSize: '0.75rem',
    color: '#008833',
    marginBottom: '2rem',
  },
  largeCardButton: {
    backgroundColor: '#00ff66',
    color: '#000',
    border: 'none',
    padding: '0.8rem 1.5rem',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    cursor: 'pointer',
    borderRadius: '4px',
    width: '80%',
    letterSpacing: '1px',
  },
  label: {
    fontSize: '0.8rem',
  },
  input: {
    backgroundColor: '#000',
    border: '1px solid #00ff66',
    color: '#00ff66',
    padding: '0.6rem',
    borderRadius: '4px',
    fontFamily: 'monospace',
    outline: 'none',
  },
  button: {
    backgroundColor: '#00ff66',
    color: '#000',
    border: 'none',
    padding: '0.6rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '0.5rem',
    borderRadius: '4px',
  },
  errorText: {
    color: '#ff3333',
    fontSize: '0.75rem',
    marginBottom: '1rem',
    textAlign: 'center',
  },
};