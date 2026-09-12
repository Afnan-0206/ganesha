import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { playManjira } from '../audio/synthInstruments';

export default function MushakCompanion({ onBlessing }) {
  const [blessed, setBlessed] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handlePetMushak = (e) => {
    e.stopPropagation();
    playManjira(0, 1.4);

    confetti({
      particleCount: 35,
      spread: 60,
      origin: { x: 0.9, y: 0.85 },
      colors: ['#F59E0B', '#FBBF24', '#D4AF37', '#FFFBEB']
    });

    setBlessed(true);
    if (onBlessing) {
      onBlessing(5); // +5 Flow bonus
    }

    setTimeout(() => {
      setBlessed(false);
    }, 3200);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '18px',
        right: '18px',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        pointerEvents: 'auto'
      }}
    >
      {/* Auspicious Floating Speech Bubble */}
      {blessed ? (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(87, 18, 30, 0.95), rgba(38, 5, 11, 0.98))',
            border: '1.5px solid var(--border-prominent)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 14px',
            marginBottom: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6), 0 0 16px rgba(245, 158, 11, 0.4)',
            color: 'var(--marigold-300)',
            fontSize: '0.78rem',
            fontWeight: 700,
            animation: 'modalZoomIn 0.25s ease-out',
            textAlign: 'center',
            maxWidth: '220px'
          }}
        >
          ✨ मूषक कृपा! MUSHAK'S BLESSING!
          <div style={{ fontSize: '0.68rem', color: 'var(--gold-300)', marginTop: '2px', fontWeight: 500 }}>
            Obstacles melt away with joy & focus!
          </div>
        </div>
      ) : showTooltip ? (
        <div
          style={{
            background: 'rgba(26, 4, 8, 0.92)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 12px',
            marginBottom: '6px',
            color: 'var(--gold-300)',
            fontSize: '0.72rem',
            whiteSpace: 'nowrap'
          }}
        >
          Tap Mushak for Ganesha's Blessing 🪔
        </div>
      ) : null}

      {/* Interactive Mushak Button */}
      <button
        onClick={handlePetMushak}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label="Pet Mushak for Ganesha's blessing"
        style={{
          background: 'radial-gradient(circle at 35% 35%, rgba(61, 10, 19, 0.95) 0%, rgba(22, 3, 7, 0.98) 100%)',
          border: '1.5px solid var(--border-prominent)',
          borderRadius: 'var(--radius-pill)',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.6), 0 0 15px rgba(245, 158, 11, 0.3)',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          outline: 'none',
          animation: 'mushakBounce 1.8s infinite ease-in-out'
        }}
      >
        <span style={{ fontSize: '1.4rem', lineHeight: 1, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>
          🐭
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
          <span style={{ fontFamily: 'var(--font-title)', fontSize: '0.74rem', color: 'var(--marigold-300)', fontWeight: 800, letterSpacing: '0.5px' }}>
            MUSHAK
          </span>
          <span style={{ fontSize: '0.62rem', color: 'var(--gold-400)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Divine Companion
          </span>
        </div>
        <span style={{ fontSize: '1rem', marginLeft: '2px', animation: 'diyaFlicker 1.5s infinite' }}>
          🥟
        </span>
      </button>
    </div>
  );
}
