import React from 'react';
import './WelcomeHero.css';

export default function WelcomeHero({ children }) {
  return (
    <div className="hero-container">
      {/* Background Video */}
      <video className="hero-video" autoPlay loop muted playsInline>
        <source src="/assets/videos/space-hero.mp4" type="video/mp4" />
        Your browser does not support video background.
      </video>

      {/* Dark Overlay for readability */}
      <div className="hero-overlay" />

      {/* Foreground Content (Auth & Delay Slider) */}
      <div className="hero-content">
        {children}
      </div>
    </div>
  );
}