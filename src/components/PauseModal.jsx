import React from 'react';

export default function PauseModal({ onResume, onRestart, onQuit }) {
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
