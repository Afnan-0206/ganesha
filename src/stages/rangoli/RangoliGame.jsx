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
    return () => clearInterval(timer);
  }, [gameState, pattern]);

  // Pointer Interaction Handlers
  const handlePointerDown = (e) => {
    if (gameState !== 'TRACING' && gameState !== 'RETRY') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    isDraggingRef.current = true;
    setUserPath([{ x, y }]);
    checkNodeCollision(x, y, rect.width, rect.height);
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setUserPath(prev => [...prev.slice(-40), { x, y }]);
    checkNodeCollision(x, y, rect.width, rect.height);
  };

  const checkNodeCollision = useCallback((x, y, width, height) => {
    const size = Math.min(width, height) * 0.78;
    const cx = width * 0.5;
    const cy = height * 0.5;
    const hitRadius = 32;

    pattern.points.forEach((pt, idx) => {
      const nodeX = cx + (pt.x - 0.5) * size;
      const nodeY = cy + (pt.y - 0.5) * size;
      const dist = Math.hypot(x - nodeX, y - nodeY);

      if (dist <= hitRadius) {
        setVisitedNodes(prev => {
          if (!prev.includes(idx)) {
            playManjira(0, 1.0 + (idx * 0.1));
            return [...prev, idx];
          }
          return prev;
        });
      }
    });
  }, [pattern]);

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setUserPath([]);

    // Evaluate traced path
    const elapsedSeconds = (Date.now() - startTimeRef.current) / 1000;
    const evaluation = evaluateRangoliRun({
      visitedPoints: visitedNodes,
      targetSequence: pattern.sequence,
      timeElapsedSeconds: elapsedSeconds,
      attempts
    });

    if (evaluation.score >= 65 || visitedNodes.length >= pattern.points.length * 0.7) {
      // SUCCESS!
      playFlowRestoredSound();
      setGameState('SUCCESS');
      setStageResult(evaluation);

      // Auto-progress to stage transition after 1.8s
      setTimeout(() => {
        onStageComplete({
          stageId: 'rangoli',
          score: evaluation.score,
          accuracy: evaluation.accuracy,
          details: evaluation
        });
      }, 1900);
    } else {
      // Incomplete path: gentle recovery retry
      setGameState('RETRY');
      setAttempts(a => a + 1);
    }
  };

  const handleReMemorize = () => {
    setGameState('PREVIEW');
  };

  const handleRetryTrace = () => {
    setVisitedNodes([]);
    setUserPath([]);
    setGameState('TRACING');
    startTimeRef.current = Date.now();
  };

  return (
    <div className="stage-workspace" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Top Stage Instructions */}
      <div style={{
        padding: '10px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--gold-800)',
        background: 'rgba(38, 5, 11, 0.65)'
      }}>
        <div>
          <span style={{ fontFamily: 'var(--font-title)', fontSize: '0.85rem', color: 'var(--marigold-300)' }}>
            VIGHNA I: {pattern.name}
          </span>
          <p style={{ fontSize: '0.75rem', color: 'var(--gold-400)', margin: 0 }}>
            {gameState === 'PREVIEW'
              ? '✦ Memorize the sacred geometry before it fades'
              : gameState === 'TRACING'
              ? '✦ Drag your finger/cursor through the sacred nodes in rhythm'
              : gameState === 'SUCCESS'
              ? '✦ Rangoli blossoms! The courtyard is consecrated.'
              : '✦ Pattern incomplete. Re-memorize or retrace gently.'}
          </p>
        </div>

        {gameState === 'PREVIEW' && (
          <div style={{
            background: 'rgba(212, 175, 55, 0.2)',
            border: '1px solid var(--gold-500)',
            borderRadius: '9999px',
            padding: '4px 12px',
            fontSize: '0.8rem',
            color: 'var(--gold-300)',
            fontWeight: 700
          }}>
            MEMORIZE: {previewTimeRemaining.toFixed(1)}s
          </div>
        )}

        {gameState === 'SUCCESS' && stageResult && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.25)',
            border: '1px solid #10B981',
            borderRadius: '9999px',
            padding: '4px 14px',
            color: '#34D399',
            fontWeight: 800,
            fontSize: '0.85rem'
          }}>
            ✦ +{stageResult.score} PTS ✦
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
