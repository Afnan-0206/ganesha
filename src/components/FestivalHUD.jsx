import React from 'react';

export default function FestivalHUD({ currentStage, festivalFlow, totalScore, currentStageScore, onPause, isPractice }) {
  const flowColor = festivalFlow >= 80 ? '#10B981' : festivalFlow >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <header className="festival-hud" role="banner">
      {/* Vighna Title */}
      <div className="hud-vighna-badge">
        <span className="hud-vighna-num">
          {isPractice ? '🎯 PRACTICE • ' : ''}{currentStage.title} • {currentStage.skill}
        </span>
        <span className="hud-vighna-name">
          {currentStage.name}
        </span>
      </div>

      {/* Global Festival Flow */}
      <div className="hud-flow-gauge">
        <div className="hud-flow-header">
          <span className="diya-flame" style={{ color: flowColor }}>🪔</span>
          <span className="tabular-nums">FLOW {festivalFlow}%</span>
        </div>
        <div className="hud-flow-track">
          <div
            className="hud-flow-fill"
            style={{ width: `${festivalFlow}%`, backgroundColor: flowColor }}
          />
        </div>
      </div>

      {/* Score Block */}
      <div className="hud-score-block">
        <div className="hud-score-item">
          <span className="hud-score-label">FESTIVAL</span>
          <span className="hud-score-val tabular-nums" style={{ color: 'var(--marigold-300)' }}>
            {totalScore} <span style={{ fontSize: '0.8rem', color: 'var(--gold-400)' }}>/ 500</span>
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
