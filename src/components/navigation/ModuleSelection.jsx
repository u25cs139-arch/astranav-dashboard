// src/components/navigation/ModuleSelection.jsx

import React, { useState, useEffect } from 'react';

// --- CHANDRAYAAN-2 DATASET ---
const CHANDRAYAAN_2_GALLERY = [
  {
    id: 'CH2-IMG-01',
    title: 'Earth Capture by LI4 Camera',
    instrument: 'LI4 Camera',
    date: 'August 3, 2019',
    url: '/ch2_earth.jpg',
    description: 'First set of Earth photographs captured by the LI4 camera on board Chandrayaan-2 during orbit raising maneuvers.'
  },
  {
    id: 'CH2-IMG-02',
    title: 'Lunar Surface & Polar Craters',
    instrument: 'Terrain Mapping Camera 2 (TMC-2)',
    date: 'August 23, 2019',
    url: '/ch2_surface.png',
    description: 'High-resolution 3D topography captured at 100km lunar orbit to generate Digital Elevation Models (DEM).'
  },
  {
    id: 'CH2-IMG-03',
    title: 'Lunar South Pole Landing Reconnaissance',
    instrument: 'Orbiter High Resolution Camera (OHRC)',
    date: 'September 5, 2019',
    url: '/ch2_crater.png',
    description: 'Sub-meter spatial resolution (0.32m) optical imagery used for hazard avoidance and boulder assessment near the lunar south pole.'
  }
];

// --- MARS ORBITER MISSION (MANGALYAAN) DATASET ---
const MARS_GALLERY = [
  {
    id: 'MOM-IMG-01',
    title: 'Full Martian Hemisphere View',
    instrument: 'Mars Color Camera (MCC)',
    date: 'September 28, 2014',
    url: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?q=80&w=1000&auto=format&fit=crop',
    description: 'Tri-color image of Mars showing atmospheric limb haze and surface features captured from high apoapsis altitude.'
  },
  {
    id: 'MOM-IMG-02',
    title: 'Valles Marineris & Regional Craters',
    instrument: 'Mars Color Camera (MCC)',
    date: 'February 12, 2015',
    url: 'https://images.unsplash.com/photo-1545156521-77bd85671d30?q=80&w=1000&auto=format&fit=crop',
    description: 'Detailed view of the massive Valles Marineris canyon system across the Martian equatorial belt.'
  },
  {
    id: 'MOM-IMG-03',
    title: 'Phobos Silhouette Transit',
    instrument: 'Mars Color Camera (MCC)',
    date: 'October 14, 2014',
    url: 'https://images.unsplash.com/photo-1610296669228-602fa827fc1f?q=80&w=1000&auto=format&fit=crop',
    description: 'Capture of Martian moon Phobos orbiting against the background of the red planet surface.'
  }
];

export default function ModuleSelection({ selectedTarget = 'mars', roverId = 'MISSION-CONTROL', onSelectModule, onBack }) {
  const isMars = selectedTarget?.toLowerCase().includes('mars') || selectedTarget?.toLowerCase().includes('martian');
  const missionName = isMars ? 'MOM / MANGALYAAN' : 'CHANDRAYAAN-2';
  const activeGallery = isMars ? MARS_GALLERY : CHANDRAYAAN_2_GALLERY;

  // Dynamic Theme Styling
  const themeColor = isMars ? '#ff4d4d' : '#00e5ff';
  const themeBgActive = isMars ? 'rgba(255, 77, 77, 0.18)' : 'rgba(0, 229, 255, 0.12)';
  const themeGlow = isMars ? '0 0 25px rgba(255, 77, 77, 0.35)' : '0 0 25px rgba(0, 229, 255, 0.35)';

  const [activeTab, setActiveTab] = useState('Trajectory Tracking');
  const [modalContent, setModalContent] = useState(null);
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);

  // Dynamic Telemetry Data
  const [telemetry, setTelemetry] = useState({
    roll: 1.12,
    pitch: -0.45,
    yaw: 182.10,
    velocity: isMars ? 2.241 : 1.628,
    altitude: isMars ? 42170 : 100.24,
    rw1: 3420,
    rw2: 3180,
    cpuLoad: 32.1,
    busVoltage: 28.18,
    solarPower: isMars ? 840.0 : 324.5,
    tempPayload: isMars ? -14.2 : 21.4,
    signalDelay: isMars ? '14m 22s' : '1.28s'
  });

  useEffect(() => {
    if (!modalContent) return;
    const interval = setInterval(() => {
      setTelemetry((prev) => ({
        ...prev,
        roll: +(prev.roll + (Math.random() * 0.04 - 0.02)).toFixed(2),
        pitch: +(prev.pitch + (Math.random() * 0.04 - 0.02)).toFixed(2),
        yaw: +(prev.yaw + (Math.random() * 0.08 - 0.04)).toFixed(2),
        velocity: +( (isMars ? 2.241 : 1.628) + (Math.random() * 0.002 - 0.001) ).toFixed(3),
        altitude: +( (isMars ? 42170 : 100.24) + (Math.random() * 0.2 - 0.1) ).toFixed(2),
        cpuLoad: +(32.1 + (Math.random() * 1.5 - 0.75)).toFixed(1),
        busVoltage: +(28.18 + (Math.random() * 0.04 - 0.02)).toFixed(2)
      }));
    }, 400);
    return () => clearInterval(interval);
  }, [modalContent, isMars]);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    switch (tabName) {
      case 'Trajectory Tracking':
        onSelectModule('LIVE_NAVIGATION');
        break;
      case 'Spatial Orientation':
        setModalContent('spatial');
        break;
      case 'Real-Time Imaging':
        setModalContent('imaging');
        break;
      case 'Hardware Architecture':
        setModalContent('hardware');
        break;
      case 'Rover':
        setModalContent('rover');
        break;
      default:
        break;
    }
  };

  const activePhoto = activeGallery[selectedImgIndex] || activeGallery[0];

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* Background Video Player */}
      <video
        key={isMars ? 'mars-video' : 'moon-video'}
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
        <source src={isMars ? '/mars.mp4' : '/0819.mp4'} type="video/mp4" />
      </video>

      {/* Primary Control Card */}
      <div className="gateway-card" style={{ 
        position: 'relative', 
        zIndex: 1, 
        maxWidth: '520px', 
        width: '90%', 
        margin: '0 auto', 
        textAlign: 'center', 
        background: 'rgba(10, 12, 16, 0.88)', 
        padding: '28px', 
        borderRadius: '16px', 
        border: `1.5px solid ${themeColor}`,
        boxShadow: themeGlow,
        backdropFilter: 'blur(8px)',
        transition: 'all 0.3s ease'
      }}>
        <div className="gateway-header">
          <h2 style={{ color: themeColor, fontFamily: 'monospace', margin: '0 0 8px 0', letterSpacing: '1px' }}>
            ASTRA_NAV // CONTROL PANEL
          </h2>
          <p style={{ color: '#888', fontSize: '12px', fontFamily: 'monospace' }}>
            DEPLOYMENT: {selectedTarget?.toUpperCase()} | MISSION ID: {missionName}
          </p>
        </div>

        {/* Dynamic Navigation Tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '24px' }}>
          {[
            'Trajectory Tracking',
            'Spatial Orientation',
            'Real-Time Imaging',
            'Hardware Architecture',
            'Rover'
          ].map((tabName) => {
            const isActive = activeTab === tabName;
            
            return (
              <button
                key={tabName}
                onClick={() => handleTabClick(tabName)}
                style={{
                  padding: '12px 20px',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  borderRadius: '24px',
                  border: isActive ? `1.5px solid ${themeColor}` : '1px solid rgba(255, 255, 255, 0.12)',
                  backgroundColor: isActive ? themeBgActive : 'rgba(255, 255, 255, 0.03)',
                  color: isActive ? themeColor : '#aaa',
                  fontWeight: isActive ? 'bold' : 'normal',
                  textAlign: 'center',
                  transition: 'all 0.25s ease',
                  boxShadow: isActive ? `0 0 12px ${themeColor}66` : 'none'
                }}
              >
                {tabName === 'Rover' ? (isMars ? 'Mangalyaan Info' : 'Chandrayaan Info') : tabName}
              </button>
            );
          })}
        </div>

        <button 
          onClick={onBack} 
          style={{ marginTop: '24px', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontFamily: 'monospace' }}
        >
          ← BACK TO MISSION ID
        </button>
      </div>

      {/* System Modals */}
      {modalContent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            width: '90%',
            maxWidth: '750px',
            maxHeight: '85vh',
            overflowY: 'auto',
            background: '#0d1117',
            padding: '24px',
            borderRadius: '12px',
            border: `1px solid ${themeColor}`,
            color: '#fff',
            fontFamily: 'monospace',
            boxShadow: `0 0 25px ${themeColor}33`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
              <span style={{ color: themeColor, fontWeight: 'bold' }}>
                // {modalContent.toUpperCase()} SYSTEM PANEL [{missionName}]
              </span>
              <button 
                onClick={() => setModalContent(null)}
                style={{ background: '#ff4d4d', color: '#fff', border: 'none', padding: '4px 12px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}
              >
                CLOSE [X]
              </button>
            </div>

            {/* Spatial Orientation System */}
            {modalContent === 'spatial' && (
              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '6px' }}>
                  <div>
                    <span style={{ color: '#888', fontSize: '11px' }}>AOCS MODE: </span>
                    <strong style={{ color: '#00ff66', fontSize: '12px' }}>SUN/EARTH ACQUISITION POINTING</strong>
                  </div>
                  <span style={{ color: themeColor, fontSize: '11px', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>
                    COMM DELAY: {telemetry.signalDelay}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div style={{ background: '#161b22', padding: '14px', borderRadius: '8px', border: '1px solid #30363d', textAlign: 'center' }}>
                    <div style={{ color: '#888', fontSize: '11px', marginBottom: '4px' }}>ROLL (Φ)</div>
                    <div style={{ color: themeColor, fontSize: '22px', fontWeight: 'bold' }}>{telemetry.roll}°</div>
                  </div>
                  <div style={{ background: '#161b22', padding: '14px', borderRadius: '8px', border: '1px solid #30363d', textAlign: 'center' }}>
                    <div style={{ color: '#888', fontSize: '11px', marginBottom: '4px' }}>PITCH (θ)</div>
                    <div style={{ color: themeColor, fontSize: '22px', fontWeight: 'bold' }}>{telemetry.pitch}°</div>
                  </div>
                  <div style={{ background: '#161b22', padding: '14px', borderRadius: '8px', border: '1px solid #30363d', textAlign: 'center' }}>
                    <div style={{ color: '#888', fontSize: '11px', marginBottom: '4px' }}>YAW (Ψ)</div>
                    <div style={{ color: themeColor, fontSize: '22px', fontWeight: 'bold' }}>{telemetry.yaw}°</div>
                  </div>
                </div>

                <div>
                  <div style={{ color: themeColor, fontSize: '11px', marginBottom: '8px', fontWeight: 'bold' }}>ORBITAL TELEMETRY VECTORS:</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                    <div style={{ background: '#161b22', padding: '10px 12px', borderRadius: '6px', border: '1px solid #30363d', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#888' }}>ORBITAL ALTITUDE:</span>
                      <span style={{ color: '#fff', fontWeight: 'bold' }}>{telemetry.altitude} km</span>
                    </div>
                    <div style={{ background: '#161b22', padding: '10px 12px', borderRadius: '6px', border: '1px solid #30363d', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#888' }}>ORBITAL TYPE:</span>
                      <span style={{ color: '#fff', fontWeight: 'bold' }}>{isMars ? '365 km × 42,170 km (ELLIPTICAL)' : '100 km × 100 km (CIRCULAR)'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Real-Time Imaging Modal */}
            {modalContent === 'imaging' && (
              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ color: '#888', fontSize: '12px', margin: 0 }}>ISRO {missionName} IMAGERY DATASET</p>
                  <span style={{ color: '#00ff66', fontSize: '11px', background: 'rgba(0,255,102,0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid #00ff66' }}>
                    VERIFIED ISRO DATA
                  </span>
                </div>

                <div style={{ position: 'relative', width: '100%', height: '280px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #30363d', background: '#000' }}>
                  <img 
                    src={activePhoto.url} 
                    alt={activePhoto.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
                    padding: '12px',
                    color: '#fff'
                  }}>
                    <div style={{ color: themeColor, fontWeight: 'bold', fontSize: '14px' }}>{activePhoto.title}</div>
                    <div style={{ color: '#aaa', fontSize: '11px', marginTop: '2px' }}>
                      PAYLOAD: {activePhoto.instrument} | DATE: {activePhoto.date}
                    </div>
                  </div>
                </div>

                <div style={{ background: '#161b22', padding: '10px 14px', borderRadius: '6px', fontSize: '12px', color: '#ccc', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {activePhoto.description}
                </div>

                <div>
                  <div style={{ color: '#888', fontSize: '11px', marginBottom: '6px' }}>SELECT CAPTURED FRAME:</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    {activeGallery.map((img, idx) => {
                      const isSelected = selectedImgIndex === idx;
                      return (
                        <button
                          key={img.id}
                          onClick={() => setSelectedImgIndex(idx)}
                          style={{
                            background: '#161b22',
                            border: isSelected ? `1.5px solid ${themeColor}` : '1px solid #30363d',
                            borderRadius: '6px',
                            padding: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            textAlign: 'left'
                          }}
                        >
                          <img 
                            src={img.url} 
                            alt={img.title} 
                            style={{ width: '100%', height: '50px', objectFit: 'cover', borderRadius: '4px' }} 
                          />
                          <span style={{ color: isSelected ? themeColor : '#888', fontSize: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {img.instrument}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Hardware Architecture Modal */}
            {modalContent === 'hardware' && (
              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ color: themeColor, fontSize: '11px', fontWeight: 'bold' }}>ON-BOARD HARDWARE & SUBSYSTEMS [{missionName}]:</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                  <div style={{ background: '#161b22', padding: '10px 12px', borderRadius: '6px', border: '1px solid #30363d', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>PRIMARY SENSORS:</span>
                    <span style={{ color: '#fff', fontWeight: 'bold' }}>{isMars ? 'MCC, TIS, MSM, LAP, MENCA' : 'OHRC, TMC-2, CLASS, IIRS'}</span>
                  </div>
                  <div style={{ background: '#161b22', padding: '10px 12px', borderRadius: '6px', border: '1px solid #30363d', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>SOLAR GENERATION:</span>
                    <span style={{ color: '#00ff66', fontWeight: 'bold' }}>{telemetry.solarPower} W</span>
                  </div>
                  <div style={{ background: '#161b22', padding: '10px 12px', borderRadius: '6px', border: '1px solid #30363d', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>BUS VOLTAGE:</span>
                    <span style={{ color: themeColor, fontWeight: 'bold' }}>{telemetry.busVoltage} V DC</span>
                  </div>
                  <div style={{ background: '#161b22', padding: '10px 12px', borderRadius: '6px', border: '1px solid #30363d', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>DECK THERMAL:</span>
                    <span style={{ color: '#fff', fontWeight: 'bold' }}>{telemetry.tempPayload}°C</span>
                  </div>
                </div>
              </div>
            )}

            {/* Mission Info Modal */}
            {modalContent === 'rover' && (
              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <h3 style={{ color: themeColor, margin: '0 0 4px 0' }}>
                    ISRO {missionName} ARCHITECTURE
                  </h3>
                  <p style={{ color: '#888', fontSize: '12px', margin: 0 }}>
                    {isMars ? 'India’s Maiden Interplanetary Mission to Explore Martian Surface & Atmosphere' : 'Lunar Exploration Mission with Orbiter, Lander (Vikram) & Rover (Pragyan)'}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                  <div style={{ background: '#161b22', padding: '10px', borderRadius: '6px' }}>
                    <span style={{ color: '#888' }}>LAUNCH VEHICLE:</span>
                    <div style={{ color: '#fff', fontWeight: 'bold' }}>{isMars ? 'PSLV-C25' : 'GSLV Mk III-M1'}</div>
                  </div>
                  <div style={{ background: '#161b22', padding: '10px', borderRadius: '6px' }}>
                    <span style={{ color: '#888' }}>LAUNCH DATE:</span>
                    <div style={{ color: '#fff', fontWeight: 'bold' }}>{isMars ? 'November 5, 2013' : 'July 22, 2019'}</div>
                  </div>
                  <div style={{ background: '#161b22', padding: '10px', borderRadius: '6px' }}>
                    <span style={{ color: '#888' }}>ORBIT INSERTION:</span>
                    <div style={{ color: '#00ff66', fontWeight: 'bold' }}>{isMars ? 'September 24, 2014' : 'August 20, 2019'}</div>
                  </div>
                  <div style={{ background: '#161b22', padding: '10px', borderRadius: '6px' }}>
                    <span style={{ color: '#888' }}>PAYLOAD COUNT:</span>
                    <div style={{ color: '#00ff66', fontWeight: 'bold' }}>{isMars ? '5 Scientific Instruments' : '8 Orbiter Payloads'}</div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}