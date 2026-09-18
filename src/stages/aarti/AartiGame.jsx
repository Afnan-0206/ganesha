import React, { useState, useRef, useCallback, useEffect } from 'react';
import AartiAltar from './AartiAltar';
import { getRandomSecretMessage, speakSecretWhisper, stopSecretWhisper } from './secretMessages';
import { playTempleBell, playShankhaSound, playFlowRestoredSound, playManjira } from '../../audio/synthInstruments';
import confetti from 'canvas-confetti';
import { Volume2, VolumeX, Sparkles, ArrowRight, RotateCcw, Heart, Headphones } from 'lucide-react';

const REQUIRED_ROTATIONS = 3;

export default function AartiGame({ onStageComplete, festivalFlow }) {
  const [phase, setPhase] = useState('AARTI'); // 'AARTI' | 'BLESSING' | 'WHISPER'
  const [completedRotations, setCompletedRotations] = useState(0);
  const [currentAngleProgress, setCurrentAngleProgress] = useState(0);
  const [secretMessage, setSecretMessage] = useState(() => getRandomSecretMessage());
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasHeardWhisper, setHasHeardWhisper] = useState(false);
  const [whisperRevealed, setWhisperRevealed] = useState(false);

  const accumulatedAngleRef = useRef(0);
  const lastAngleRef = useRef(null);
  const lastBellTimeRef = useRef(0);
  const finishTriggeredRef = useRef(false);

  // Clean up any ongoing speech synthesis on unmount
  useEffect(() => {
    return () => {
      stopSecretWhisper();
    };
  }, []);

  // ─── CLOCKWISE ROTATION CALCULATION ───
  const handlePositionUpdate = useCallback((normX, normY) => {
    if (phase !== 'AARTI' || finishTriggeredRef.current) return;

    // Center of Lord Ganesha murti
    const cx = 0.5;
    const cy = 0.44;

    const dx = normX - cx;
    const dy = normY - cy;
    const dist = Math.hypot(dx, dy);

    // Only count if within reasonable orbit distance
    if (dist < 0.12 || dist > 0.55) {
      lastAngleRef.current = null;
      return;
    }

    const currentAngle = Math.atan2(dy, dx); // -PI to +PI

    if (lastAngleRef.current !== null) {
      let delta = currentAngle - lastAngleRef.current;

      // Normalize delta over boundary wrap (-PI / +PI)
      if (delta < -Math.PI) delta += Math.PI * 2;
      else if (delta > Math.PI) delta -= Math.PI * 2;

      // Check if moving clockwise (positive delta)
      if (delta > 0 && delta < 0.8) {
        accumulatedAngleRef.current += delta;

        // Periodic temple bell chime as thali circles
        const now = performance.now();
        if (now - lastBellTimeRef.current > 380) {
          playTempleBell(0, 0.7);
          lastBellTimeRef.current = now;
        }

        const totalRotations = accumulatedAngleRef.current / (Math.PI * 2);
        const currentRot = Math.floor(totalRotations);
        const fraction = totalRotations - currentRot;

        setCompletedRotations(Math.min(REQUIRED_ROTATIONS, currentRot));
        setCurrentAngleProgress(fraction);

        // Check if 3 full circles completed!
        if (totalRotations >= REQUIRED_ROTATIONS && !finishTriggeredRef.current) {
          finishTriggeredRef.current = true;
          triggerBlessingPhase();
        }
      }
    }

    lastAngleRef.current = currentAngle;
  }, [phase]);

  // ─── BLESSING PHASE TRANSITION ───
  const triggerBlessingPhase = () => {
    setPhase('BLESSING');
    playShankhaSound();
    playFlowRestoredSound();

    // Sacred celebratory flower confetti
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { x: 0.5, y: 0.45 },
      colors: ['#F59E0B', '#D4AF37', '#FEF08A', '#EF4444', '#EC4899'],
    });

    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#FDE68A', '#F97316'],
      });
    }, 450);

    // Transition to Whisper after blessing rays
    setTimeout(() => {
      setPhase('WHISPER');
    }, 2800);
  };

  const [voiceMode, setVoiceMode] = useState('cartoon'); // 'cartoon' | 'divine'

  // ─── WHISPER VOICE PLAYBACK ───
  const handleListenWhisper = (modeToUse = voiceMode) => {
    setIsSpeaking(true);
    setWhisperRevealed(true);
    playManjira(0, 1.4);
    playTempleBell(0, 0.85);

    speakSecretWhisper(secretMessage.text, {
      mode: modeToUse,
      onStart: () => {
        setIsSpeaking(true);
      },
      onEnd: () => {
        setIsSpeaking(false);
        setHasHeardWhisper(true);
        playTempleBell(0, 0.95);
      },
      onError: (err) => {
        console.warn("Speech error, fallback to text display:", err);
        setIsSpeaking(false);
        setHasHeardWhisper(true);
      },
    });
  };

  // ─── ADVANCE TO NEXT STAGE (MODAK) ───
  const handleContinue = () => {
    stopSecretWhisper();
    onStageComplete({
      stageId: 'aarti',
      score: 100,
      accuracy: 100,
      details: {
        rotations: REQUIRED_ROTATIONS,
        whisperTitle: secretMessage.englishTitle,
        sanskrit: secretMessage.sanskritTitle,
      },
    });
  };

  return (
    <div
      className="stage-workspace"
      style={{
        display: 'flex',
        flexDirection: 'column',
        touchAction: 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Bar HUD */}
      <div
        style={{
          padding: '8px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(245, 158, 11, 0.25)',
          background: 'rgba(26, 4, 8, 0.9)',
          zIndex: 10,
        }}
      >
        <div>
          <span style={{ fontFamily: 'var(--font-title)', fontSize: '0.85rem', color: 'var(--gold-400)', letterSpacing: '1px' }}>
            VIGHNA II: MAHA AARTI & SECRET BLESSING
          </span>
          <p style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.75)', margin: 0 }}>
            {phase === 'AARTI'
              ? '🪔 Circle the camphor thali clockwise around Lord Ganesha (3 sacred circles)'
              : phase === 'BLESSING'
              ? '✨ Lord Ganesha radiates celestial blessings...'
              : '🎧 Hold your device near your ear to hear Ganesha’s secret whisper'}
          </p>
        </div>

        {/* Circles Counter Pills */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div
            style={{
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1.5px solid rgba(245, 158, 11, 0.45)',
              borderRadius: '9999px',
              padding: '4px 14px',
              fontSize: '0.78rem',
              color: 'var(--gold-300)',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>CIRCLES:</span>
            <span style={{ color: '#34D399', fontSize: '0.9rem' }}>
              {completedRotations} / {REQUIRED_ROTATIONS}
            </span>
          </div>
        </div>
      </div>

      {/* Main Altar Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        <AartiAltar
          phase={phase}
          completedRotations={completedRotations}
          currentAngleProgress={currentAngleProgress}
          onPositionUpdate={handlePositionUpdate}
          isBlessingActive={phase === 'BLESSING'}
        />

        {/* ─── BLESSING BANNER OVERLAY ─── */}
        {phase === 'BLESSING' && (
          <div
            style={{
              position: 'absolute',
              top: '12%',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 35,
              textAlign: 'center',
              animation: 'modalZoomIn 0.4s ease-out',
            }}
          >
            <div
              style={{
                background: 'rgba(26, 4, 8, 0.92)',
                border: '2px solid var(--gold-400)',
                borderRadius: '9999px',
                padding: '8px 24px',
                boxShadow: '0 0 30px rgba(245, 158, 11, 0.6)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-title)',
                  color: 'var(--marigold-300)',
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  letterSpacing: '2px',
                }}
              >
                ॥ विघ्नहर्ता प्रसन्न • AARTI FULFILLED ॥
              </span>
            </div>
          </div>
        )}

        {/* ─── SECRET WHISPER MODAL OVERLAY (MOBILE RESPONSIVE FIXED VIEWPORT) ─── */}
        {phase === 'WHISPER' && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(6, 1, 3, 0.88)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              padding: 'clamp(10px, 2.5vh, 24px) clamp(10px, 3vw, 20px)',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <div
              className="ornament-border anim-scale-in"
              style={{
                maxWidth: '520px',
                width: '100%',
                maxHeight: 'min(92vh, 740px)',
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                background: 'linear-gradient(145deg, rgba(38, 7, 13, 0.98), rgba(18, 2, 5, 0.99))',
                border: '2px solid var(--gold-400)',
                borderRadius: 'clamp(16px, 3vw, 24px)',
                padding: 'clamp(16px, 2.8vh, 28px) clamp(14px, 3.5vw, 28px)',
                textAlign: 'center',
                boxShadow: '0 16px 60px rgba(0, 0, 0, 0.85), 0 0 40px rgba(245, 158, 11, 0.35)',
                margin: 'auto',
              }}
            >
              {/* Ear Guidance Icon */}
              <div
                style={{
                  width: 'clamp(46px, 10vw, 60px)',
                  height: 'clamp(46px, 10vw, 60px)',
                  borderRadius: '50%',
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '2px solid var(--gold-400)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px auto',
                  boxShadow: '0 0 25px rgba(245, 158, 11, 0.4)',
                  animation: 'pulse 1.8s infinite',
                  flexShrink: 0,
                }}
              >
                <Headphones size={26} color="var(--gold-400)" />
              </div>

              {/* Instructions */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '4px',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    fontSize: 'clamp(0.68rem, 2vw, 0.75rem)',
                    color: 'var(--gold-400)',
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                  }}
                >
                  {secretMessage.sanskritTitle}
                </span>

                {secretMessage.mentionsNiat && (
                  <span
                    style={{
                      background: 'rgba(56, 189, 248, 0.2)',
                      border: '1px solid #38BDF8',
                      color: '#7DD3FC',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '0.66rem',
                      fontWeight: 800,
                      letterSpacing: '0.5px',
                    }}
                  >
                    🎓 NIAT SPECIAL BLESSING
                  </span>
                )}
              </div>

              <h2
                style={{
                  fontFamily: 'var(--font-title)',
                  fontSize: 'clamp(1.2rem, 3.8vw, 1.45rem)',
                  color: 'var(--marigold-300)',
                  fontWeight: 800,
                  margin: '0 0 6px 0',
                  lineHeight: 1.25,
                }}
              >
                Bal Ganesha's Secret Whisper
              </h2>

              {/* Voice Style Selector */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  gap: '6px',
                  margin: '6px 0 10px 0',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setVoiceMode('cartoon');
                    if (isSpeaking) handleListenWhisper('cartoon');
                  }}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '9999px',
                    fontSize: 'clamp(0.68rem, 2vw, 0.74rem)',
                    fontWeight: 700,
                    background: voiceMode === 'cartoon' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                    border: voiceMode === 'cartoon' ? '1.5px solid var(--gold-400)' : '1px solid rgba(255, 255, 255, 0.15)',
                    color: voiceMode === 'cartoon' ? '#FDE68A' : 'rgba(255, 255, 255, 0.6)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    touchAction: 'manipulation',
                  }}
                >
                  🐘 Cartoon Bal Ganesh Voice
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVoiceMode('divine');
                    if (isSpeaking) handleListenWhisper('divine');
                  }}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '9999px',
                    fontSize: 'clamp(0.68rem, 2vw, 0.74rem)',
                    fontWeight: 700,
                    background: voiceMode === 'divine' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                    border: voiceMode === 'divine' ? '1.5px solid var(--gold-400)' : '1px solid rgba(255, 255, 255, 0.15)',
                    color: voiceMode === 'divine' ? '#FDE68A' : 'rgba(255, 255, 255, 0.6)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    touchAction: 'manipulation',
                  }}
                >
                  🪔 Calm Divine Voice
                </button>
              </div>

              <p
                style={{
                  fontSize: 'clamp(0.78rem, 2.2vw, 0.86rem)',
                  color: '#FEF08A',
                  lineHeight: '1.4',
                  margin: '0 0 12px 0',
                  fontWeight: 600,
                }}
              >
                📱 <strong>Hold your device near your ear...</strong>
                <br />
                <span style={{ fontSize: 'clamp(0.72rem, 1.9vw, 0.78rem)', color: 'rgba(255, 255, 255, 0.75)', fontWeight: 400 }}>
                  Little Bal Ganesha will whisper a sweet personalized blessing into your ear!
                </span>
              </p>

              {/* Spoken Whisper Subtitle Box */}
              {whisperRevealed && (
                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.6)',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    borderRadius: '14px',
                    padding: 'clamp(12px, 2vh, 16px) clamp(12px, 2.5vw, 18px)',
                    marginBottom: '14px',
                    textAlign: 'left',
                    animation: 'modalZoomIn 0.3s ease-out',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '4px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--gold-400)', fontWeight: 700 }}>
                      ✨ {secretMessage.englishTitle.toUpperCase()}
                    </span>
                    {isSpeaking && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          color: '#34D399',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Volume2 size={13} />
                        BAL GANESH SPEAKING...
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: 'clamp(0.8rem, 2.2vw, 0.88rem)',
                      fontStyle: 'italic',
                      color: '#FFFDF5',
                      lineHeight: '1.5',
                      margin: 0,
                    }}
                  >
                    "{secretMessage.text}"
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {!whisperRevealed ? (
                  <button
                    className="btn-festival-primary"
                    style={{
                      width: '100%',
                      padding: 'clamp(12px, 2vh, 15px) 18px',
                      fontSize: 'clamp(0.88rem, 2.5vw, 0.98rem)',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 25px rgba(245, 158, 11, 0.5)',
                      minHeight: '46px',
                    }}
                    onClick={() => handleListenWhisper(voiceMode)}
                    autoFocus
                  >
                    <Volume2 size={18} />
                    <span>LISTEN TO BAL GANESHA 👂</span>
                  </button>
                ) : (
                  <>
                    <button
                      className="btn-festival-primary"
                      style={{
                        width: '100%',
                        padding: 'clamp(12px, 2vh, 15px) 18px',
                        fontSize: 'clamp(0.86rem, 2.4vw, 0.96rem)',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 25px rgba(245, 158, 11, 0.5)',
                        minHeight: '46px',
                      }}
                      onClick={handleContinue}
                      autoFocus
                    >
                      <Heart size={18} fill="#0A0203" />
                      <span>RECEIVE BLESSING & PLAY MODAK</span>
                      <ArrowRight size={18} />
                    </button>

                    <button
                      type="button"
                      className="btn-festival-secondary"
                      style={{
                        width: '100%',
                        padding: '9px 14px',
                        fontSize: 'clamp(0.75rem, 2vw, 0.82rem)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        opacity: 0.9,
                        minHeight: '40px',
                      }}
                      onClick={() => handleListenWhisper(voiceMode)}
                    >
                      <RotateCcw size={14} />
                      <span>REPLAY BAL GANESHA'S VOICE 🔊</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
