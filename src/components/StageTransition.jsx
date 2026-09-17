import React, { useEffect } from 'react';
import { playFlowRestoredSound } from '../audio/synthInstruments';

export default function StageTransition({ completedStageName, nextStage, earnedScore, totalScore, onTransitionEnd }) {
  useEffect(() => {
    playFlowRestoredSound();
  }, []);

  return (
    <div className="stage-transition-overlay">
      <div className="transition-card ornament-border">
        <div className="anim-fade-up anim-delay-1" style={{ fontSize: '0.82rem', color: 'var(--gold-400)', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700 }}>
          ॥ विघ्न निवारण ॥
        </div>

        <div className="anim-scale-in anim-delay-2" style={{ fontSize: '40px', animation: 'diyaFlicker 1.5s infinite', margin: '6px 0' }}>
          🌸
        </div>

        <div className="transition-title text-gold-gradient anim-fade-up anim-delay-3" style={{ fontSize: '1.8rem', fontWeight: 800 }}>
          {completedStageName} OVERCOME
        </div>

        <div className="stats-grid anim-fade-up anim-delay-4" style={{ width: '100%', gap: '10px' }}>
          <div className="stat-box">
            <span className="stat-box-label">Stage Points</span>
            <span className="stat-box-value" style={{ color: 'var(--marigold-300)' }}>+{earnedScore}</span>
          </div>
          <div className="stat-box">
            <span className="stat-box-label">Total Score</span>
            <span className="stat-box-value" style={{ color: '#FFF' }}>{totalScore}</span>
          </div>
        </div>

        <div className="golden-divider" />

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
