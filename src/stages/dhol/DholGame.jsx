import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DHOL_ROUNDS, evaluateDholRound } from './rhythmEngine';
import { playDhol, playTasha, playManjira, playFlowRestoredSound } from '../../audio/synthInstruments';
import confetti from 'canvas-confetti';

export default function DholGame({ onStageComplete, festivalFlow }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState('CALL'); // 'CALL' | 'RESPONSE' | 'EVAL' | 'COMPLETE'
  const [activeBeat, setActiveBeat] = useState(null); // visual pulse marker
  const [playerTaps, setPlayerTaps] = useState([]);
  const [feedback, setFeedback] = useState('Listen & Watch the Call...');
  const [scores, setScores] = useState([]);
  const [celebrationPopup, setCelebrationPopup] = useState(null);

  const currentRound = DHOL_ROUNDS[roundIndex] || DHOL_ROUNDS[0];
  const responseStartRef = useRef(0);

  // Play Call Sequence
  const playCall = useCallback(() => {
    setPhase('CALL');
    setPlayerTaps([]);
    setCelebrationPopup(null);
    setFeedback('Listen & Watch the Rhythm Call...');

    currentRound.pattern.forEach((beat, idx) => {
      setTimeout(() => {
        setActiveBeat(beat);
        if (beat.sound === 'dhol') playDhol(0, 1.0);
        else if (beat.sound === 'tasha') playTasha(0, 0.9);
        else if (beat.sound === 'manjira') playManjira(0, 1.2);

        setTimeout(() => setActiveBeat(null), 250);
      }, beat.delay);
    });

    const totalDuration = currentRound.pattern[currentRound.pattern.length - 1].delay + 700;
    setTimeout(() => {
      setPhase('RESPONSE');
      setFeedback('NOW YOUR RESPONSE! Tap the Dhol in rhythm');
      responseStartRef.current = Date.now();
    }, totalDuration);
  }, [currentRound]);

  useEffect(() => {
    playCall();
  }, [roundIndex, playCall]);

  // Player Tap Action
  const handlePlayerTap = (soundType = 'dhol') => {
    if (phase !== 'RESPONSE') return;

    const now = Date.now();
    const tapTime = now - responseStartRef.current;
    const newTaps = [...playerTaps, { time: tapTime, sound: soundType }];
    setPlayerTaps(newTaps);

    // Play feedback sound and pulse
    if (soundType === 'tasha') playTasha(0, 0.9);
    else playDhol(0, 1.0);

    setActiveBeat({ sound: soundType, label: 'TAP' });
    setTimeout(() => setActiveBeat(null), 180);

    // Check if player has tapped enough beats for this call
    if (newTaps.length >= currentRound.pattern.length) {
      setPhase('EVAL');
      const evalResult = evaluateDholRound({
        expectedPattern: currentRound.pattern,
        playerTaps: newTaps
      });

      setScores(prev => [...prev, evalResult.accuracy]);

      if (evalResult.streakMatch) {
        setFeedback('✦ PERFECT RESPONSE! The procession surges ✦');
        setCelebrationPopup({
          title: 'शाब्बास! SHABASH!',
          sub: 'गणपती बाप्पा मोरया! Flawless Cadence',
          bonus: '+20 Flow'
        });

        confetti({
          particleCount: 25,
          spread: 50,
          origin: { x: 0.5, y: 0.6 },
          colors: ['#F59E0B', '#D4AF37', '#FEF08A', '#E11D48']
        });
      } else {
        setFeedback('Rhythm lost. Moving to the next call...');
      }

      setTimeout(() => {
        if (roundIndex < DHOL_ROUNDS.length - 1) {
          setRoundIndex(r => r + 1);
        } else {
          // Completed all 5 rounds!
          setPhase('COMPLETE');
          playFlowRestoredSound();
          const allScores = [...scores, evalResult.accuracy];
          const avgScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);

          setTimeout(() => {
            onStageComplete({
              stageId: 'dhol',
              score: Math.max(50, Math.min(100, avgScore + 5)),
              accuracy: avgScore,
              details: { rounds: allScores }
            });
          }, 1800);
        }
      }, 1400);
    }
  };

  // Keyboard shortcut (Spacebar)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handlePlayerTap('dhol');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div className="stage-workspace" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Top Round Bar */}
      <div style={{
        padding: '10px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--gold-800)',
        background: 'rgba(38, 5, 11, 0.75)'
      }}>
        <div>
          <span style={{ fontFamily: 'var(--font-title)', fontSize: '0.85rem', color: 'var(--marigold-300)' }}>
            VIGHNA IV: {currentRound.title}
          </span>
          <p style={{ fontSize: '0.72rem', color: 'var(--gold-400)', margin: 0 }}>
            {feedback}
          </p>
        </div>

        <div style={{
          background: 'rgba(212, 175, 55, 0.2)',
          border: '1px solid var(--gold-500)',
          borderRadius: '9999px',
          padding: '4px 14px',
          fontSize: '0.8rem',
          color: 'var(--gold-300)',
          fontWeight: 700
        }}>
          ROUND {roundIndex + 1} / 5
        </div>
      </div>

      {/* Main Drum Stage */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: '16px',
        gap: '24px'
      }}>
        {/* Animated Dhol Drum Instrument */}
        <div style={{ position: 'relative', width: '220px', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Visual Beat Pulse Ring (Sound-off accessible) */}
          {activeBeat && (
            <div style={{
              position: 'absolute',
              inset: '-20px',
              borderRadius: '50%',
              border: '3px solid #F59E0B',
              boxShadow: '0 0 30px rgba(245, 158, 11, 0.9)',
              animation: 'diyaFlicker 0.3s ease-out'
            }} />
          )}

          {/* Dhol SVG */}
          <svg viewBox="0 0 200 120" style={{ width: '100%', height: '100%' }}>
            <ellipse cx="100" cy="60" rx="90" ry="50" fill="#B45309" stroke="#D4AF37" strokeWidth="3" />
            <ellipse cx="25" cy="60" rx="15" ry="40" fill="#78350F" stroke="#FDE68A" strokeWidth="2" />
            <ellipse cx="175" cy="60" rx="15" ry="40" fill="#78350F" stroke="#FDE68A" strokeWidth="2" />
            {/* Lacing cords */}
            <path d="M25 25 L100 60 L25 95 M175 25 L100 60 L175 95" stroke="#FDE68A" strokeWidth="2" fill="none" />
          </svg>

          {/* Active Beat Label */}
          {activeBeat && (
            <div style={{
              position: 'absolute',
              top: '-32px',
              fontFamily: 'var(--font-title)',
              fontSize: '1.2rem',
              fontWeight: 800,
              color: 'var(--marigold-300)',
              textShadow: '0 0 12px rgba(245, 158, 11, 0.9)'
            }}>
              {activeBeat.label}
            </div>
          )}
        </div>

        {/* Player Tap Interaction Buttons */}
        <div style={{ display: 'flex', gap: '16px', width: '100%', maxWidth: '420px', justifyContent: 'center' }}>
          <button
            className="btn-festival-primary"
            style={{ flex: 1, padding: '14px 18px', fontSize: '1rem' }}
            onClick={() => handlePlayerTap('dhol')}
            disabled={phase !== 'RESPONSE'}
          >
            <span>🥁</span>
            <span>DHA (BASS)</span>
          </button>
          <button
            className="btn-festival-secondary"
            style={{ flex: 1, padding: '14px 18px', fontSize: '1rem', justifyContent: 'center' }}
            onClick={() => handlePlayerTap('tasha')}
            disabled={phase !== 'RESPONSE'}
          >
            <span>💥</span>
            <span>TAK (RIM)</span>
          </button>
        </div>

        {/* Celebratory Hit Toast / Popup */}
        {celebrationPopup && (
          <div style={{
            position: 'absolute',
            top: '20px',
            background: 'linear-gradient(135deg, rgba(120, 27, 43, 0.95), rgba(61, 10, 19, 0.98))',
            border: '2px solid var(--border-prominent)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 20px',
            textAlign: 'center',
            boxShadow: '0 8px 30px rgba(0,0,0,0.8), 0 0 20px rgba(245, 158, 11, 0.5)',
            animation: 'modalZoomIn 0.25s ease-out',
            zIndex: 30
          }}>
            <div style={{
              fontFamily: 'var(--font-title)',
              fontSize: '1.2rem',
              color: 'var(--marigold-300)',
              fontWeight: 800,
              letterSpacing: '0.5px'
            }}>
              {celebrationPopup.title}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--gold-300)', marginTop: '2px' }}>
              {celebrationPopup.sub}
            </div>
            <div style={{
              display: 'inline-block',
              marginTop: '4px',
              background: 'rgba(245, 158, 11, 0.2)',
              border: '1px solid var(--gold-400)',
              borderRadius: '9999px',
              padding: '2px 8px',
              fontSize: '0.7rem',
              color: '#FEF08A',
              fontWeight: 700
            }}>
              {celebrationPopup.bonus}
            </div>
          </div>
        )}

        <span style={{ fontSize: '0.72rem', color: 'var(--gold-400)', opacity: 0.8 }}>
          TAP BUTTONS OR PRESS SPACEBAR IN RHYTHM
        </span>
      </div>
    </div>
  );
}
