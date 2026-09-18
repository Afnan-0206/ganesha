import React, { useState } from 'react';
import { X, Check, Zap, Flame, ShieldAlert, Award } from 'lucide-react';
import { DIFFICULTY_TIERS, getCurrentDifficulty, setCurrentDifficulty } from '../game/difficulty';
import { playClickSound, unlockAudio } from '../audio/audioContext';
import { playManjira } from '../audio/synthInstruments';

export default function DifficultyModal({ onClose, onDifficultyChanged }) {
  const [selectedId, setSelectedId] = useState(() => getCurrentDifficulty().id);

  const handleSelect = async (id) => {
    await unlockAudio();
    setSelectedId(id);
    playManjira(0, id === 'master' ? 1.4 : id === 'devotee' ? 0.9 : 1.15);
  };

  const handleConfirm = () => {
    playClickSound();
    const tier = setCurrentDifficulty(selectedId);
    if (onDifficultyChanged) onDifficultyChanged(tier);
    onClose();
  };

  const tiers = Object.values(DIFFICULTY_TIERS);

  return (
    <div
      className="modal-overlay anim-fade-in"
      onClick={onClose}
      style={{
        zIndex: 2500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(12px, 3vh, 24px) 14px',
        overflowY: 'auto',
      }}
    >
      <div
        className="modal-card anim-scale-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 'clamp(18px, 3vh, 26px) clamp(16px, 3vw, 24px)',
          background: 'linear-gradient(170deg, #2D0810 0%, #170307 100%)',
          border: '2px solid var(--gold-600)',
          borderRadius: '18px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(212, 175, 55, 0.2)',
          color: '#FFF',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '0.72rem', letterSpacing: '2px', color: 'var(--marigold-400)', textTransform: 'uppercase', fontWeight: 600 }}>
              ॥ गति और कठिनाई ॥
            </div>
            <h2 style={{ fontFamily: 'var(--font-title)', fontSize: 'clamp(1.2rem, 3.2vw, 1.5rem)', color: 'var(--gold-200)', margin: '2px 0 0 0' }}>
              FESTIVAL CADENCE & SPEED
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              color: 'var(--gold-300)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'rgba(253, 230, 138, 0.8)', margin: '0 0 16px 0', lineHeight: 1.4 }}>
          Calibrate the tempo of the celebration. Adjusts ingredient fall velocity in <strong style={{ color: '#FDE68A' }}>Modak</strong>, rhythm highway tempo & timing windows in <strong style={{ color: '#FDE68A' }}>Dhol</strong>, and overall score bonuses.
        </p>

        {/* Tiers List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
          {tiers.map((tier) => {
            const isSelected = selectedId === tier.id;
            return (
              <div
                key={tier.id}
                onClick={() => handleSelect(tier.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  padding: '14px 16px',
                  borderRadius: '14px',
                  background: isSelected ? tier.badgeBg : 'rgba(20, 3, 6, 0.65)',
                  border: isSelected ? `2px solid ${tier.badgeColor}` : '1.5px solid rgba(212, 175, 55, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isSelected ? `0 0 20px ${tier.badgeBg}` : 'none',
                  position: 'relative',
                }}
              >
                {/* Title row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.4rem' }}>{tier.icon}</span>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'var(--font-title)', fontSize: '1.05rem', fontWeight: 700, color: tier.badgeColor }}>
                          {tier.name}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--gold-400)', opacity: 0.85, fontWeight: 500 }}>
                          ({tier.sanskritName})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '999px',
                        background: isSelected ? tier.badgeColor : 'rgba(255, 255, 255, 0.08)',
                        color: isSelected ? '#0A0203' : 'var(--gold-300)',
                      }}
                    >
                      {tier.scoreMult > 1.0 ? `+${Math.round((tier.scoreMult - 1) * 100)}% PTS` : '1.0× PTS'}
                    </span>
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: isSelected ? `2px solid ${tier.badgeColor}` : '1.5px solid rgba(212, 175, 55, 0.3)',
                        background: isSelected ? tier.badgeColor : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0A0203',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.76rem', color: 'rgba(255, 255, 255, 0.78)', margin: 0, lineHeight: 1.35 }}>
                  {tier.desc}
                </p>

                {/* Specs pill badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
                  <span style={{ fontSize: '0.66rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(0, 0, 0, 0.35)', color: 'var(--gold-300)', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
                    ⚡ Speed: {tier.speedMult}×
                  </span>
                  <span style={{ fontSize: '0.66rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(0, 0, 0, 0.35)', color: 'var(--gold-300)', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
                    🎯 Windows: {tier.timingMult > 1 ? '+35% Forgiving' : tier.timingMult < 1 ? 'Precision (±55ms)' : 'Balanced (±80ms)'}
                  </span>
                  <span style={{ fontSize: '0.66rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(0, 0, 0, 0.35)', color: 'var(--gold-300)', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
                    🥟 Steam Zone: {tier.steamZone.max - tier.steamZone.min}% Width
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleConfirm}
            className="btn-festival-primary"
            style={{ flex: 1, padding: '13px 20px', fontSize: '0.9rem' }}
          >
            CONFIRM CADENCE
          </button>
        </div>
      </div>
    </div>
  );
}
