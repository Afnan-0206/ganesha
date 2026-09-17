import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { playManjira } from '../audio/synthInstruments';
import { Sparkles, MessageCircle } from 'lucide-react';

const MUSHAK_LORE = [
  "Obstacles melt away with joy & focus! ✨",
  "The Modak represents the sweetness of inner wisdom. 🥟",
  "I am Ganesha's agile companion. Speed and focus! 🐭",
  "Tracing Rangoli connects you to cosmic sacred geometry. 🌸",
  "Keep your Flow meter high by maintaining your rhythm! 🎵",
  "The Pandal lights up when positive energy flows. 💡",
  "Listen closely to the Dhol beats before playing. 🥁",
  "Even a small mouse can overcome mountains! ⛰️"
];

export default function MushakCompanion({ onBlessing, onScoreBonus }) {
  const [blessed, setBlessed] = useState(false);
  const [currentLore, setCurrentLore] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasModak, setHasModak] = useState(false);

  // Random Modak Digging Mechanic
  useEffect(() => {
    const digInterval = setInterval(() => {
      // 30% chance to dig up a Modak every 20 seconds
      if (Math.random() < 0.3 && !hasModak && !blessed) {
        setHasModak(true);
        // Modak disappears after 6 seconds if not claimed
        setTimeout(() => setHasModak(false), 6000);
      }
    }, 20000);
    return () => clearInterval(digInterval);
  }, [hasModak, blessed]);

  const handlePetMushak = (e) => {
    e.stopPropagation();
    playManjira(0, 1.4);

    if (hasModak) {
      // Claim Modak Bonus
      setHasModak(false);
      setCurrentLore("YUM! You found a hidden Modak! +25 Points! 🥟");
      if (onScoreBonus) onScoreBonus(25);

      confetti({
        particleCount: 50,
        spread: 80,
        origin: { x: 0.9, y: 0.85 },
        colors: ['#F59E0B', '#FBBF24', '#FFFFFF']
      });
    } else {
      // Regular Blessing & Lore
      const randomLore = MUSHAK_LORE[Math.floor(Math.random() * MUSHAK_LORE.length)];
      setCurrentLore(randomLore);
      if (onBlessing) onBlessing(5); // +5 Flow bonus

      confetti({
        particleCount: 25,
        spread: 50,
        origin: { x: 0.9, y: 0.85 },
        colors: ['#34D399', '#10B981', '#FCD34D']
      });
    }

    setBlessed(true);
    setTimeout(() => {
      setBlessed(false);
    }, 4000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        pointerEvents: 'auto'
      }}
    >
      {/* Speech Bubble */}
      {blessed ? (
        <div
          style={{
            background: 'linear-gradient(135deg, var(--maroon-900), var(--maroon-950))',
            border: '1.5px solid var(--border-prominent)',
            borderRadius: 'var(--radius-md) var(--radius-md) 2px var(--radius-md)',
            padding: '12px 16px',
            marginBottom: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6), 0 0 16px rgba(245, 158, 11, 0.4)',
            color: 'var(--marigold-300)',
            fontSize: '0.85rem',
            fontWeight: 700,
            animation: 'modalZoomIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            textAlign: 'center',
            maxWidth: '240px',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
            <Sparkles size={16} color="var(--gold-400)" />
            <span style={{ fontSize: '0.7rem', color: 'var(--gold-300)', letterSpacing: '1px' }}>MUSHAK SAYS</span>
          </div>
          {currentLore}
          
          {/* Bubble Tail */}
          <div style={{
            position: 'absolute',
            bottom: '-8px',
            right: '24px',
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid var(--border-prominent)'
          }} />
        </div>
      ) : showTooltip && !hasModak ? (
        <div
          style={{
            background: 'var(--surface-overlay)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 14px',
            marginBottom: '12px',
            color: 'var(--gold-300)',
            fontSize: '0.75rem',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <MessageCircle size={14} />
          Tap for Lore & Blessings
        </div>
      ) : null}

      {/* Interactive Mushak Button */}
      <button
        onClick={handlePetMushak}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label="Pet Mushak"
        style={{
          background: hasModak 
            ? 'linear-gradient(135deg, #B45309, #78350F)'
            : 'radial-gradient(circle at 35% 35%, var(--maroon-700) 0%, var(--maroon-900) 100%)',
          border: hasModak ? '2px solid #FBBF24' : '1.5px solid var(--border-prominent)',
          borderRadius: 'var(--radius-pill)',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          boxShadow: hasModak 
            ? '0 0 25px rgba(251, 191, 36, 0.6), 0 8px 24px rgba(0,0,0,0.8)'
            : '0 6px 20px rgba(0, 0, 0, 0.6), 0 0 15px rgba(245, 158, 11, 0.2)',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          outline: 'none',
          animation: hasModak ? 'mushakBounce 0.5s infinite alternate' : 'mushakBounce 2s infinite ease-in-out',
          transform: hasModak ? 'scale(1.1)' : 'scale(1)'
        }}
      >
        <span style={{ fontSize: hasModak ? '1.8rem' : '1.5rem', lineHeight: 1, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>
          {hasModak ? '🐭' : '🐭'}
        </span>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
          <span style={{ 
            fontFamily: 'var(--font-title)', 
            fontSize: '0.8rem', 
            color: hasModak ? '#FFF' : 'var(--marigold-300)', 
            fontWeight: 800, 
            letterSpacing: '0.5px' 
          }}>
            {hasModak ? 'QUICK! MODAK!' : 'MUSHAK'}
          </span>
          <span style={{ 
            fontSize: '0.62rem', 
            color: hasModak ? '#FDE68A' : 'var(--gold-400)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.4px' 
          }}>
            {hasModak ? 'Tap to Claim' : 'Divine Companion'}
          </span>
        </div>
        
        <span style={{ 
          fontSize: '1.2rem', 
          marginLeft: '4px', 
          animation: hasModak ? 'diyaFlicker 0.5s infinite' : 'diyaFlicker 2s infinite' 
        }}>
          {hasModak ? '🥟' : '🪔'}
        </span>
      </button>
    </div>
  );
}
