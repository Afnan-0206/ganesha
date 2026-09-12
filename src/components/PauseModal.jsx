import React from 'react';

export default function PauseModal({ onResume, onRestart, onQuit }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '420px', padding: '28px 24px', gap: '14px' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--gold-400)', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700 }}>
          TEMPLE STILLNESS
        </div>
        <h2 className="modal-title" style={{ fontSize: '1.6rem', marginTop: '-4px' }}>
          FESTIVAL PAUSED
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--parchment-surface)', margin: 0, fontStyle: 'italic' }}>
          The celebration awaits your return.
        </p>

        <div className="modal-divider" style={{ margin: '6px 0' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
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
