import React, { useState, useEffect } from 'react';
import { getCurrentDifficulty } from '../game/difficulty';
import { Sliders } from 'lucide-react';

export default function PauseModal({ onResume, onRestart, onQuit, onOpenDifficulty }) {
  const [difficulty, setDifficulty] = useState(getCurrentDifficulty());

  useEffect(() => {
    const handleDiff = (e) => setDifficulty(e.detail);
    window.addEventListener('panch_vighna_difficulty_changed', handleDiff);
    return () => window.removeEventListener('panch_vighna_difficulty_changed', handleDiff);
  }, []);

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '420px', gap: '14px' }}>
        {/* Animated Diya */}
        <div className="pause-diya anim-scale-in">🪔</div>

        <div className="pause-title-label anim-fade-up anim-delay-1">
          TEMPLE STILLNESS
        </div>
        <h2 className="modal-title anim-fade-up anim-delay-2" style={{ fontSize: '1.6rem', marginTop: '-4px' }}>
          FESTIVAL PAUSED
        </h2>
        <p className="pause-subtitle anim-fade-up anim-delay-2">
          The celebration awaits your return.
        </p>

        <div className="modal-divider" />

        <div className="pause-actions anim-fade-up anim-delay-3">
          <button className="btn-festival-primary" style={{ width: '100%' }} onClick={onResume}>
            <span>▶</span>
            <span>RESUME FESTIVAL</span>
          </button>

          {onOpenDifficulty && (
            <button
              className="btn-festival-secondary"
              style={{ width: '100%', justifyContent: 'center', gap: '8px' }}
              onClick={onOpenDifficulty}
            >
              <span>{difficulty.icon}</span>
              <span>CADENCE: {difficulty.name.toUpperCase()}</span>
              <Sliders size={14} color="var(--gold-300)" />
            </button>
          )}

          <button className="btn-festival-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={onRestart}>
            <span>↺</span>
            <span>RESTART CHAPTER</span>
          </button>
          <button
            className="btn-festival-ghost"
            style={{ width: '100%', justifyContent: 'center', color: 'var(--gold-400)' }}
            onClick={onQuit}
          >
            QUIT TO TITLE
          </button>
        </div>
      </div>
    </div>
  );
}
