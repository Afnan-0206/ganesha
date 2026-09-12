import React from 'react';

export default function HowToPlay({ onClose, onStartGame, onPracticeStage }) {
  const chapters = [
    {
      id: 'rangoli',
      num: 'I',
      title: 'RANGOLI',
      skill: 'Visual Memory + Tracing',
      badgeColor: '#EC4899',
      icon: '🌸',
      obstacle: 'Morning gust sweeps the courtyard',
      desc: 'Memorize the sacred kolam geometry during the 2.2-second preview. Trace the sacred path through all glowing nodes in exact sequence.',
    },
    {
      id: 'pandal',
      num: 'II',
      title: 'PANDAL',
      skill: 'Spatial Circuits + Capacity',
      badgeColor: '#F59E0B',
      icon: '🏛️',
      obstacle: 'Generator capped at 75 Watts',
      desc: 'Route power lines to the altar brass diyas and entrance lights. Complete the sacred illumination without tripping the generator breaker.',
    },
    {
      id: 'modak',
      num: 'III',
      title: 'MODAK',
      skill: 'Sequencing + Gauge Timing',
      badgeColor: '#EAB308',
      icon: '🥟',
      obstacle: 'Aarti prasad deadline looms',
      desc: 'Roll dough → Add matching filling → Pleat 21 apex folds → Lift steamer lid precisely in the 60–85% golden zone for perfect prasad.',
    },
    {
      id: 'dhol',
      num: 'IV',
      title: 'DHOL',
      skill: 'Call & Response Rhythm',
      badgeColor: '#F97316',
      icon: '🥁',
      obstacle: 'Procession rhythm synchronization',
      desc: 'Listen to drum calls and watch the radiant pulse rings. Reproduce each rhythmic phrase on the Dhol and Tasha with precise timing.',
    },
    {
      id: 'visarjan',
      num: 'V',
      title: 'VISARJAN',
      skill: 'Route Strategy & Adaptation',
      badgeColor: '#38BDF8',
      icon: '🌊',
      obstacle: 'Crowd surges and monsoon showers',
      desc: 'Guide the grand chariot procession through city lanes. Make quick strategic detour choices when sudden obstacles strike in transit.',
    },
  ];

  return (
    <div className="modal-overlay" style={{ overflowY: 'auto' }}>
      <div className="modal-content" style={{ maxWidth: '660px', padding: '24px 22px', gap: '14px' }}>
        
        {/* Modal Header */}
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--gold-400)', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700 }}>
              FESTIVAL CHAPTERS & GUIDE
            </div>
            <h2 className="modal-title" style={{ fontSize: '1.6rem', textAlign: 'left', marginTop: '2px' }}>
              THE FIVE VIGHNAS
            </h2>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--gold-400)',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.15s ease'
            }}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <div className="modal-divider" />

        {/* Chapter List */}
        <div className="tutorial-steps">
          {chapters.map((ch) => (
            <div 
              key={ch.id} 
              className="tutorial-step-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderLeft: `3px solid ${ch.badgeColor}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                <div 
                  className="tutorial-step-num" 
                  style={{ 
                    background: ch.badgeColor,
                    color: '#000',
                    fontWeight: 800,
                    fontSize: '0.85rem'
                  }}
                >
                  {ch.icon}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-title)', fontSize: '0.88rem', fontWeight: 800, color: 'var(--parchment-bg)', letterSpacing: '1px' }}>
                      VIGHNA {ch.num}: {ch.title}
                    </span>
                    <span 
                      style={{ 
                        fontSize: '0.62rem', 
                        padding: '2px 8px', 
                        borderRadius: 'var(--radius-pill)', 
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: 'var(--gold-300)',
                        border: '1px solid var(--border-subtle)',
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}
                    >
                      {ch.skill}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--parchment-surface)', lineHeight: 1.4, marginTop: '2px' }}>
                    {ch.desc}
                  </div>
                </div>
              </div>

              {onPracticeStage && (
                <button
                  type="button"
                  className="btn-festival-secondary"
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.72rem',
                    borderColor: ch.badgeColor,
                    color: '#FFF',
                    whiteSpace: 'nowrap',
                    marginLeft: '12px',
                    borderRadius: 'var(--radius-sm)'
                  }}
                  onClick={() => onPracticeStage(ch.id)}
                >
                  ▶ Practice
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="modal-divider" />

        {/* Modal Footer Actions */}
        <div style={{ display: 'flex', gap: '12px', width: '100%', justifyContent: 'flex-end', marginTop: '2px' }}>
          <button className="btn-festival-secondary" onClick={onClose}>
            BACK TO TITLE
          </button>
          <button className="btn-festival-primary" style={{ padding: '10px 24px', fontSize: '0.92rem' }} onClick={onStartGame}>
            <span>🪔</span>
            <span>BEGIN FESTIVAL</span>
          </button>
        </div>
      </div>
    </div>
  );
}
