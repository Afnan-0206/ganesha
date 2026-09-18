import React, { useState, useEffect } from 'react';
import { getCurrentDifficulty } from '../game/difficulty';

export default function FestivalHUD({ currentStage, festivalFlow, totalScore, currentStageScore, onPause, isPractice, onOpenDifficulty }) {
  const [difficulty, setDifficulty] = useState(getCurrentDifficulty());

  useEffect(() => {
    const handleDiff = (e) => setDifficulty(e.detail);
    window.addEventListener('panch_vighna_difficulty_changed', handleDiff);
    return () => window.removeEventListener('panch_vighna_difficulty_changed', handleDiff);
  }, []);

  const flowColor = festivalFlow >= 80 ? '#10B981' : festivalFlow >= 50 ? '#F59E0B' : '#EF4444';
  const flowGlow = festivalFlow >= 80
    ? '0 0 12px rgba(16, 185, 129, 0.5)'
    : festivalFlow >= 50
    ? '0 0 12px rgba(245, 158, 11, 0.5)'
    : '0 0 12px rgba(239, 68, 68, 0.5)';

  return (
    <header className="festival-hud" role="banner">
      {/* Vighna Title */}
      <div className="hud-vighna-badge">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="hud-vighna-num">
            {isPractice ? '🎯 PRACTICE • ' : ''}{currentStage.title} • {currentStage.skill}
          </span>
          <span
            onClick={onOpenDifficulty}
            style={{
              background: difficulty.badgeBg,
              border: `1px solid ${difficulty.badgeBorder}`,
              borderRadius: '999px',
              padding: '1px 7px',
              fontSize: '0.66rem',
              color: difficulty.badgeColor,
              fontWeight: 700,
              cursor: onOpenDifficulty ? 'pointer' : 'default',
              whiteSpace: 'nowrap',
            }}
            title="Active Festival Cadence"
          >
            {difficulty.icon} {difficulty.name}
          </span>
        </div>
        <span className="hud-vighna-name">
          {currentStage.name}
        </span>
      </div>

      {/* Global Festival Flow — Animated Bar */}
      <div className="hud-flow-gauge">
        <div className="hud-flow-header">
          <span className="diya-flame" style={{ color: flowColor }}>🪔</span>
          <span className="tabular-nums">FLOW {festivalFlow}%</span>
        </div>
        <div className="hud-flow-track">
          <div
            className="hud-flow-fill"
            style={{
              width: `${festivalFlow}%`,
              backgroundColor: flowColor,
              boxShadow: flowGlow
            }}
          />
        </div>
      </div>

      {/* Score Block */}
      <div className="hud-score-block">
        <div className="hud-score-item">
          <span className="hud-score-label">FESTIVAL</span>
          <span className="hud-score-val tabular-nums" style={{ color: 'var(--marigold-300)' }}>
            {totalScore} <span style={{ fontSize: '0.75rem', color: 'var(--gold-400)', fontWeight: 500 }}>/ 500</span>
          </span>
        </div>

        {onPause && (
          <button className="btn-pause" onClick={onPause} aria-label="Pause Festival">
            ⏸
          </button>
        )}
      </div>
    </header>
  );
}
