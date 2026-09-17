import React from 'react';

export default function HowToPlay({ onClose, onStartGame, onPracticeStage }) {
  const chapters = [
    {
      id: 'rangoli',
      num: 'I',
      title: 'RANGOLI',
      skill: 'Memory + Pattern Recreation',
      badgeColor: '#EC4899',
      icon: '🌸',
      obstacle: 'Sacred geometry fades from memory',
      desc: 'Watch the sacred kolam pattern flash on a dot grid — memorize every connection. Then click dot pairs to recreate the pattern from memory. 5 rounds with increasing complexity.',
    },
    {
      id: 'pandal',
      num: 'II',
      title: 'PANDAL',
      skill: 'Spatial Placement + Precision',
      badgeColor: '#F59E0B',
      icon: '🏛️',
      obstacle: 'The pandal awaits its sacred decorations',
      desc: 'Drag and drop festival decorations (diyas, toran, canopy, bell) onto the pandal blueprint. Accuracy matters — place each item as close to the sacred zone as possible across 3 rounds.',
    },
    {
      id: 'modak',
      num: 'III',
      title: 'MODAK',
      skill: 'Reflex Catching + Timing',
      badgeColor: '#EAB308',
      icon: '🥟',
      obstacle: 'Ingredients cascade from the sacred kitchen',
      desc: 'Move your bowl left/right to catch the correct falling ingredients for each recipe. Avoid chilies and wrong items! After catching enough, time the steamer lid lift perfectly. 5 modaks to prepare.',
    },
    {
      id: 'dhol',
      num: 'IV',
      title: 'DHOL',
      skill: 'Rhythm + Precision Timing',
      badgeColor: '#F97316',
      icon: '🥁',
      obstacle: 'The procession demands perfect rhythm',
      desc: 'Beats scroll down 3 lanes — DHA, TAK, CHIME. Hit D/F/J (or tap) when notes reach the strike zone. Chase PERFECT timing, build combos, and survive 5 rounds of escalating BPM.',
    },
    {
      id: 'visarjan',
      num: 'V',
      title: 'VISARJAN',
      skill: 'Navigation + Quick Reflexes',
      badgeColor: '#38BDF8',
      icon: '🌊',
      obstacle: 'River obstacles threaten the sacred voyage',
      desc: 'Steer the murti boat up/down through the river to the immersion ghat. Dodge rocks, logs, and whirlpools while collecting diyas and marigold offerings for bonus points.',
    },
  ];

  return (
    <div className="modal-overlay" style={{ overflowY: 'auto' }}>
      <div className="modal-content" style={{ maxWidth: '680px' }}>

        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-header-text">
            <div className="modal-header-label">
              FESTIVAL CHAPTERS & SACRED GUIDE
            </div>
            <h2 className="modal-title" style={{ fontSize: '1.65rem', textAlign: 'left', marginTop: '2px' }}>
              THE FIVE VIGHNAS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="btn-modal-close"
            aria-label="Close Guide"
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
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.88rem', fontWeight: 800, color: 'var(--parchment-bg)', letterSpacing: '1px' }}>
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
