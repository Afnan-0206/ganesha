import React from 'react';
import { playMushakChime } from '../audio/synthInstruments';

export default function MushakBonus({ visible, onClaim }) {
  if (!visible) return null;

  const handleClick = (e) => {
    e.stopPropagation();
    playMushakChime();
    onClaim();
  };

  return (
    <div 
      className="mushak-widget"
      onClick={handleClick}
      onTouchStart={handleClick}
      role="button"
      title="Mushak brings fresh golden ink! Tap to restore flow."
    >
      <span style={{ fontSize: '20px' }}>🐁</span>
      <span style={{ fontSize: '16px' }}>🏺</span>
      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
        <span className="mushak-name">MUSHAK'S INK</span>
        <span style={{ fontSize: '0.65rem', color: 'var(--marigold-300)' }}>TAP FOR BONUS FLOW!</span>
      </div>
    </div>
  );
}
