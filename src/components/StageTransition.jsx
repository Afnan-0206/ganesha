import React, { useEffect } from 'react';
import { playFlowRestoredSound } from '../audio/synthInstruments';

export default function StageTransition({ completedStageName, nextStage, earnedScore, onTransitionEnd }) {
  useEffect(() => {
    playFlowRestoredSound();
    const timer = setTimeout(() => {
      onTransitionEnd();
    }, 1700);

    return () => clearTimeout(timer);
  }, [onTransitionEnd]);

  return (
    <div className="stage-transition-overlay">
      <div className="transition-card ornament-border">
        <div style={{ fontSize: '0.85rem', color: 'var(--gold-400)', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700 }}>
          ॥ विघ्न निवारण ॥
        </div>

        <div style={{ fontSize: '36px', animation: 'diyaFlicker 1.5s infinite', margin: '4px 0' }}>
          🌸
        </div>

        <div className="transition-title text-gold-gradient">
          {completedStageName} OVERCOME!
        </div>

        <div className="transition-score-badge">
          <span>✦</span>
          <span className="tabular-nums">+{earnedScore} FESTIVAL POINTS</span>
          <span>✦</span>
        </div>

        <div className="modal-divider" style={{ margin: '8px 0' }} />

        <div className="transition-subtitle">
          Next Chapter: <strong style={{ color: 'var(--marigold-300)' }}>{nextStage.title} — {nextStage.name}</strong>
          <div style={{ fontSize: '0.78rem', color: 'var(--gold-400)', marginTop: '2px', fontStyle: 'normal' }}>
            {nextStage.subtitle} • {nextStage.skill}
          </div>
        </div>
      </div>
    </div>
  );
}
