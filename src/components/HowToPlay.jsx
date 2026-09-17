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
      id: 'aarti',
      num: 'II',
      title: 'MAHA AARTI',
      skill: 'Devotion + Secret Whisper',
      badgeColor: '#F59E0B',
      icon: '🪔',
      obstacle: 'Offer the sacred flame to awaken the deity',
      desc: 'Move the golden Aarti thali with camphor flame in 3 sacred clockwise circles around Lord Ganesha. Receive His celestial blessing and hold your device near your ear to hear His divine secret voice whisper meant only for you.',
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
          {chapters.map((ch, i) => (
            <div
              key={ch.id}
              className="tutorial-step-item anim-fade-up"
              style={{
                borderLeft: `3px solid ${ch.badgeColor}`,
                animationDelay: `${i * 0.06}s`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                <div
                  className="tutorial-step-num"
                  style={{
                    background: ch.badgeColor,
                  }}
                >
                  {ch.icon}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span className="tutorial-step-title">
                      VIGHNA {ch.num}: {ch.title}
                    </span>
                    <span className="tutorial-step-skill">
                      {ch.skill}
                    </span>
                  </div>
                  <div className="tutorial-step-desc">
                    {ch.desc}
                  </div>
                </div>
              </div>

              {onPracticeStage && (
                <button
                  type="button"
                  className="btn-festival-secondary btn-practice-stage"
                  style={{ borderColor: ch.badgeColor, color: '#FFF' }}
                  onClick={() => onPracticeStage(ch.id)}
                >
                  ▶ Play Chapter
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
