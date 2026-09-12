import React, { useState, useEffect, useRef, useCallback } from 'react';
import RangoliCanvas from './RangoliCanvas';
import { getPatternForLevel } from './rangoliPatterns';
import { evaluateRangoliRun } from './rangoliScoring';
import { playManjira, playFlowRestoredSound } from '../../audio/synthInstruments';

export default function RangoliGame({ onStageComplete, festivalFlow }) {
  const [patternIndex, setPatternIndex] = useState(0);
  const [gameState, setGameState] = useState('PREVIEW'); // 'PREVIEW' | 'TRACING' | 'SUCCESS' | 'RETRY'
  const [previewTimeRemaining, setPreviewTimeRemaining] = useState(2.2);
  const [userPath, setUserPath] = useState([]);
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [attempts, setAttempts] = useState(1);
  const [stageResult, setStageResult] = useState(null);

  const isDraggingRef = useRef(false);
  const startTimeRef = useRef(Date.now());
  const pattern = getPatternForLevel(patternIndex);

  // Step 1: Preview Countdown Timer
  useEffect(() => {
    let timer;
    if (gameState === 'PREVIEW') {
      let remaining = pattern.previewDuration;
      setPreviewTimeRemaining(remaining);
      setVisitedNodes([]);
      setUserPath([]);

      timer = setInterval(() => {
        remaining -= 0.1;
        if (remaining <= 0) {
          clearInterval(timer);
          setGameState('TRACING');
          startTimeRef.current = Date.now();
        } else {
          setPreviewTimeRemaining(Math.max(0, remaining));
        }
      }, 100);
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
