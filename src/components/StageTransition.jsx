import React, { useEffect } from 'react';
import { playFlowRestoredSound } from '../audio/synthInstruments';

export default function StageTransition({ completedStageName, nextStage, earnedScore, totalScore, onTransitionEnd }) {
  useEffect(() => {
    playFlowRestoredSound();
  }, []);

  return (
    <div className="stage-transition-overlay">
      <div className="transition-card ornament-border" style={{ 
        background: 'rgba(26, 4, 9, 0.95)', 
        padding: '30px', 
        borderRadius: 'var(--radius-xl)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        maxWidth: '480px',
        border: '1px solid var(--gold-500)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(212, 175, 55, 0.15)'
      }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--gold-400)', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700 }}>
          ॥ विघ्न निवारण ॥
        </div>

        <div style={{ fontSize: '36px', animation: 'diyaFlicker 1.5s infinite', margin: '4px 0' }}>
          🌸
        </div>

        <div className="transition-title text-gold-gradient" style={{ fontSize: '1.8rem', fontWeight: 800 }}>
          {completedStageName} OVERCOME
        </div>

        <div className="stats-grid" style={{ width: '100%', gap: '10px' }}>
          <div className="stat-box" style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
            <span className="stat-box-label">Stage Points</span>
            <span className="stat-box-value" style={{ color: 'var(--marigold-300)' }}>+{earnedScore}</span>
          </div>
          <div className="stat-box" style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
            <span className="stat-box-label">Total Score</span>
            <span className="stat-box-value" style={{ color: '#FFF' }}>{totalScore}</span>
          </div>
        </div>

        <div className="modal-divider" style={{ margin: '8px 0', width: '100%' }} />

        <div className="transition-subtitle" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--parchment-surface)', textTransform: 'uppercase' }}>Next Chapter</span>
          <div style={{ fontSize: '1.2rem', color: 'var(--marigold-300)', fontWeight: 800, margin: '4px 0' }}>
            {nextStage.title} — {nextStage.name}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--gold-400)', fontStyle: 'normal' }}>
            {nextStage.subtitle} • {nextStage.skill}
          </div>
        </div>

        <button 
          className="btn-festival-primary"
          style={{ width: '100%', marginTop: '12px', padding: '14px' }}
          onClick={onTransitionEnd}
          autoFocus
        >
          BEGIN NEXT VIGHNA
        </button>
      </div>
    </div>
  );
}
