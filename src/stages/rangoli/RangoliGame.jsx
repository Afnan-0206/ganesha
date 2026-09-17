import React, { useState, useEffect, useRef, useCallback } from 'react';
import RangoliCanvas from './RangoliCanvas';
import { getRangoliRound } from './rangoliPatterns';
import { evaluateRangoliRound, evaluateRangoliStage } from './rangoliScoring';
import { playManjira, playFlowRestoredSound, playInkBlotSound } from '../../audio/synthInstruments';
import confetti from 'canvas-confetti';

const TOTAL_ROUNDS = 5;

export default function RangoliGame({ onStageComplete, festivalFlow }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState('PREVIEW');  // 'PREVIEW' | 'PLAY' | 'ROUND_RESULT' | 'COMPLETE'
  const [previewProgress, setPreviewProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  const [selectedDot, setSelectedDot] = useState(null);
  const [playerConnections, setPlayerConnections] = useState([]);
  const [correctSet, setCorrectSet] = useState(new Set());
  const [wrongSet, setWrongSet] = useState(new Set());
  const [lastHitType, setLastHitType] = useState(null);
  const [comboCount, setComboCount] = useState(0);
  const [comboMax, setComboMax] = useState(0);
  const [roundResults, setRoundResults] = useState([]);
  const allResultsRef = useRef([]);
  const [roundFeedback, setRoundFeedback] = useState(null);

  const startTimeRef = useRef(Date.now());
  const roundData = getRangoliRound(roundIndex);

  // Normalize a connection for comparison
  const normalizeConn = (id1, id2) => {
    const a = Math.min(id1, id2);
    const b = Math.max(id1, id2);
    return `${a}-${b}`;
  };

  // Build target set for current round
  const targetSetRef = useRef(new Set());
  useEffect(() => {
    const s = new Set();
    roundData.connections.forEach(([a, b]) => s.add(normalizeConn(a, b)));
    targetSetRef.current = s;
  }, [roundData]);

  // ─── PREVIEW PHASE: Animated pattern reveal ───
  useEffect(() => {
    if (phase !== 'PREVIEW') return;
    setPreviewProgress(0);
    setPlayerConnections([]);
    setSelectedDot(null);
    setCorrectSet(new Set());
    setWrongSet(new Set());
    setComboCount(0);
    setLastHitType(null);
    setRoundFeedback(null);

    const duration = roundData.previewDuration * 1000;
    const start = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(1, elapsed / duration);
      setPreviewProgress(progress);

      if (progress >= 1) {
        clearInterval(interval);
        // Brief pause then switch to PLAY
        setTimeout(() => {
          setPhase('PLAY');
          setTimeLeft(roundData.timeLimit);
          startTimeRef.current = Date.now();
        }, 400);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [phase, roundData]);

  // ─── PLAY PHASE: Countdown timer ───
  useEffect(() => {
    if (phase !== 'PLAY') return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 0.1;
        if (next <= 0) {
          clearInterval(interval);
          finishRound();
          return 0;
        }
        return Math.max(0, next);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [phase]);

  // ─── DOT CLICK HANDLER ───
  const handleDotClick = useCallback((dotId) => {
    if (phase !== 'PLAY') return;

    if (selectedDot === null) {
      // First dot selection
      setSelectedDot(dotId);
      playManjira(0, 1.0 + dotId * 0.02);
    } else if (selectedDot === dotId) {
      // Deselect
      setSelectedDot(null);
    } else {
      // Try to make a connection
      const key = normalizeConn(selectedDot, dotId);

      // Check if already placed
      const alreadyPlaced = playerConnections.some(([a, b]) => normalizeConn(a, b) === key);
      if (alreadyPlaced) {
        setSelectedDot(dotId);
        return;
      }

      const newConn = [selectedDot, dotId];
      const isCorrect = targetSetRef.current.has(key);

      setPlayerConnections(prev => [...prev, newConn]);

      if (isCorrect) {
        playManjira(0, 1.2 + comboCount * 0.05);
        setCorrectSet(prev => new Set([...prev, key]));
        setLastHitType('correct');
        const newCombo = comboCount + 1;
        setComboCount(newCombo);
        if (newCombo > comboMax) setComboMax(newCombo);

        // Check if all connections found
        const totalCorrect = correctSet.size + 1;
        if (totalCorrect >= targetSetRef.current.size) {
          // Perfect round — all found!
          setTimeout(() => finishRound(), 300);
        }
      } else {
        playInkBlotSound();
        setWrongSet(prev => new Set([...prev, key]));
        setLastHitType('wrong');
        setComboCount(0);
      }

      // Clear hit type after brief flash
      setTimeout(() => setLastHitType(null), 300);
      setSelectedDot(dotId);
    }
  }, [phase, selectedDot, playerConnections, comboCount, comboMax, correctSet]);

  // ─── FINISH ROUND ───
  const finishRound = useCallback(() => {
    if (phase !== 'PLAY') return;
    setPhase('ROUND_RESULT');

    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const result = evaluateRangoliRound({
      targetConnections: roundData.connections,
      playerConnections,
      timeElapsedSeconds: elapsed,
      timeLimit: roundData.timeLimit,
      comboMax,
    });

    setRoundFeedback(result);
    allResultsRef.current.push(result);
    setRoundResults(prev => [...prev, result]);

    if (result.accuracy >= 80) {
      confetti({
        particleCount: 20 + roundIndex * 8,
        spread: 50,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#F59E0B', '#D4AF37', '#FEF08A', '#EC4899'],
      });
    }

    // Advance or complete
    setTimeout(() => {
      if (roundIndex < TOTAL_ROUNDS - 1) {
        setRoundIndex(r => r + 1);
        setPhase('PREVIEW');
      } else {
        // All rounds complete
        setPhase('COMPLETE');
        playFlowRestoredSound();
        const stageResult = evaluateRangoliStage(allResultsRef.current);
        setTimeout(() => {
          onStageComplete({
            stageId: 'rangoli',
            score: stageResult.score,
            accuracy: stageResult.accuracy,
            details: stageResult,
          });
        }, 1800);
      }
    }, 2000);
  }, [phase, roundData, playerConnections, comboMax, roundResults, roundIndex, onStageComplete]);

  // ─── KEYBOARD: ESC to deselect ───
  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === 'Escape') setSelectedDot(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const getPhaseLabel = () => {
    switch (phase) {
      case 'PREVIEW': return `✦ MEMORIZE THE SACRED PATTERN — Round ${roundIndex + 1}`;
      case 'PLAY': return `✦ RECREATE: Click two dots to draw a connection`;
      case 'ROUND_RESULT': return roundFeedback?.accuracy >= 80 ? '✦ Excellent memory! Pattern blossoms!' : '✦ Round complete. The pattern partly blooms.';
      case 'COMPLETE': return '✦ All five rangoli rounds complete!';
      default: return '';
    }
  };

  return (
    <div className="stage-workspace" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <div className="stage-instruction-bar">
        <div>
          <span className="stage-title">
            VIGHNA I: {roundData.name}
          </span>
          <p className="stage-hint">{getPhaseLabel()}</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Round Counter */}
          <div style={{
            background: 'rgba(212, 175, 55, 0.15)',
            border: '1px solid var(--gold-500)',
            borderRadius: '9999px',
            padding: '4px 14px',
            fontSize: '0.78rem',
            color: 'var(--gold-300)',
            fontWeight: 700,
          }}>
            ROUND {roundIndex + 1} / {TOTAL_ROUNDS}
          </div>

          {/* Timer */}
          {phase === 'PLAY' && (
            <div style={{
              background: timeLeft <= 3 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.15)',
              border: `1px solid ${timeLeft <= 3 ? '#EF4444' : '#10B981'}`,
              borderRadius: '9999px',
              padding: '4px 14px',
              fontSize: '0.78rem',
              color: timeLeft <= 3 ? '#F87171' : '#34D399',
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
              transition: 'all 0.3s ease',
            }}>
              ⏱ {timeLeft.toFixed(1)}s
            </div>
          )}

          {/* Preview countdown */}
          {phase === 'PREVIEW' && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid #F59E0B',
              borderRadius: '9999px',
              padding: '4px 14px',
              fontSize: '0.78rem',
              color: '#FDE68A',
              fontWeight: 700,
            }}>
              MEMORIZE: {((1 - previewProgress) * roundData.previewDuration).toFixed(1)}s
            </div>
          )}
        </div>
      </div>

      {/* Combo indicator */}
      {phase === 'PLAY' && comboCount >= 2 && (
        <div style={{
          position: 'absolute',
          top: '70px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 30,
          background: 'linear-gradient(135deg, rgba(120, 27, 43, 0.95), rgba(61, 10, 19, 0.98))',
          border: '2px solid #FBBF24',
          borderRadius: '9999px',
          padding: '4px 16px',
          fontSize: '0.82rem',
          color: '#FDE68A',
          fontWeight: 800,
          letterSpacing: '1px',
          boxShadow: '0 0 20px rgba(245, 158, 11, 0.5)',
          animation: 'modalZoomIn 0.2s ease-out',
        }}>
          ✦ COMBO ×{comboCount} ✦
        </div>
      )}

      {/* Connection progress */}
      {phase === 'PLAY' && (
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          display: 'flex',
          gap: '6px',
          alignItems: 'center',
          background: 'rgba(26, 4, 8, 0.85)',
          border: '1px solid var(--gold-800)',
          borderRadius: '9999px',
          padding: '6px 16px',
          fontSize: '0.75rem',
          color: 'var(--gold-300)',
          fontWeight: 700,
        }}>
          <span style={{ color: '#10B981' }}>✓ {correctSet.size}</span>
          <span>/</span>
          <span>{roundData.connections.length} connections</span>
          {wrongSet.size > 0 && <span style={{ color: '#EF4444', marginLeft: '8px' }}>✕ {wrongSet.size}</span>}
        </div>
      )}

      {/* Round Result Toast */}
      {phase === 'ROUND_RESULT' && roundFeedback && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 40,
          background: 'linear-gradient(135deg, rgba(38, 5, 11, 0.97), rgba(26, 4, 8, 0.99))',
          border: `2px solid ${roundFeedback.accuracy >= 80 ? '#10B981' : '#F59E0B'}`,
          borderRadius: '20px',
          padding: '24px 36px',
          textAlign: 'center',
          boxShadow: '0 12px 40px rgba(0,0,0,0.9), 0 0 30px rgba(245, 158, 11, 0.3)',
          animation: 'modalZoomIn 0.3s ease-out',
          minWidth: '280px',
        }}>
          <div style={{
            fontFamily: 'var(--font-title)',
            fontSize: '1.4rem',
            color: roundFeedback.accuracy >= 80 ? '#34D399' : 'var(--marigold-300)',
            fontWeight: 800,
            marginBottom: '8px',
          }}>
            {roundFeedback.accuracy >= 90 ? '✦ PERFECT MEMORY ✦' :
             roundFeedback.accuracy >= 70 ? '✦ WELL RECALLED ✦' :
             '✦ PARTIAL BLOOM ✦'}
          </div>
        )}
      </div>

      {/* Main Canvas Workspace */}
      <div style={{ flex: 1, position: 'relative' }}>
        <RangoliCanvas
          pattern={pattern}
          gameState={gameState}
          userPath={userPath}
          visitedNodes={visitedNodes}
          previewTimeRemaining={previewTimeRemaining}
          previewTotalTime={pattern.previewDuration}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />

        {/* Retry Dialog overlay if pattern was incomplete */}
        {gameState === 'RETRY' && (
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(38, 5, 11, 0.92)',
            border: '1.5px solid var(--gold-500)',
            borderRadius: '12px',
            padding: '10px 20px',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.7)'
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--parchment-surface)' }}>
              Pattern incomplete.
            </span>
            <button className="btn-festival-primary" style={{ padding: '6px 16px', fontSize: '0.8rem' }} onClick={handleRetryTrace}>
              RETRY TRACE
            </button>
            <button className="btn-festival-secondary" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={handleReMemorize}>
              RE-MEMORIZE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
