import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getAudioContext, unlockAudio, getAuthoritativeTime } from '../audio/audioContext';
import { startTanpuraDrone, stopTanpuraDrone, playInkStroke, playInkBlotSound, playFlowRestoredSound } from '../audio/synthInstruments';
import { CANTOS } from '../data/cantos';
import { BeatScheduler } from '../game/beatScheduler';
import { evaluateInput, checkMissedGlyphs } from '../game/hitDetection';
import { ScoreKeeper } from '../game/scoring';
import { FlowSystem } from '../game/flowSystem';
import { DifficultyEngine } from '../game/difficulty';
import ManuscriptView from './ManuscriptView';
import FlowMeter from './FlowMeter';
import MushakBonus from './MushakBonus';
import PauseModal from './PauseModal';
import DebugOverlay from './DebugOverlay';

export default function GameScreen({ onGameOver, onQuitToTitle }) {
  // Game state
  const [cantoIndex, setCantoIndex] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [cantoTransition, setCantoTransition] = useState(false);

  // HUD stats
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [flow, setFlow] = useState(75);
  const [mushakVisible, setMushakVisible] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [fps, setFps] = useState(60);
  const [lastDelta, setLastDelta] = useState(null);

  // Visual collections for the Living Manuscript
  const [activeGlyphs, setActiveGlyphs] = useState([]);
  const [disorders, setDisorders] = useState([]);
  const [inscribedStrokes, setInscribedStrokes] = useState([]);
  const [activeStrokeAnimation, setActiveStrokeAnimation] = useState(null);
  const [hitFeedbacks, setHitFeedbacks] = useState([]);
  const [cantoHitCount, setCantoHitCount] = useState(0);

  // Refs for high-frequency game loop
  const schedulerRef = useRef(null);
  const scoreKeeperRef = useRef(new ScoreKeeper());
  const flowSystemRef = useRef(null);
  const difficultyRef = useRef(new DifficultyEngine());
  const activeGlyphsRef = useRef([]);
  const animFrameRef = useRef(null);
  const lastFrameTimeRef = useRef(performance.now());
  const audioTimeRef = useRef(0);
  const inputCooldownRef = useRef(0);

  const currentCanto = CANTOS[cantoIndex];
  // Target strokes in this canto for 100% completion
  const totalCantoTargetHits = Math.floor((currentCanto.durationSeconds / (60.0 / currentCanto.bpm)) * 0.7);
  const completionPercent = Math.min(100, Math.round((cantoHitCount / Math.max(1, totalCantoTargetHits)) * 100));

  // Initialize FlowSystem with callbacks
  useEffect(() => {
    flowSystemRef.current = new FlowSystem(
      (newFlow, state, streak) => {
        setFlow(newFlow);
        if (newFlow <= 0) {
          // Flow completely broken -> End session respectfully
          handleEndGame(false);
        }
      },
      ({ type }) => {
        playFlowRestoredSound();
        addHitFeedback(type);
      }
    );
  }, []);

  // Countdown timer on start or canto switch
  useEffect(() => {
    let count = 3;
    setCountdown(count);
    setIsPlaying(false);

    const timer = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        clearInterval(timer);
        setCountdown(0);
        startGameplay();
      } else {
        setCountdown(count);
      }
    }, 900);

    return () => clearInterval(timer);
  }, [cantoIndex]);

  // Start Canto Gameplay
  const startGameplay = async () => {
    const ctx = await unlockAudio();
    startTanpuraDrone();

    activeGlyphsRef.current = [];
    setActiveGlyphs([]);
    setCantoHitCount(0);

    schedulerRef.current = new BeatScheduler({
      audioCtx: ctx,
      canto: currentCanto,
      difficultyEngine: difficultyRef.current,
      onGlyphSpawn: (glyph) => {
        activeGlyphsRef.current.push(glyph);
        setActiveGlyphs([...activeGlyphsRef.current]);
      },
      onCantoComplete: () => {
        handleCantoComplete();
      }
    });

    schedulerRef.current.start(0.35);
    setIsPlaying(true);
  };

  const handleEndGame = (isWin) => {
    if (schedulerRef.current) schedulerRef.current.stop();
    stopTanpuraDrone();
    setIsPlaying(false);
    const summary = scoreKeeperRef.current.getFinalSummary();
    onGameOver(isWin, summary);
  };

  const handleCantoComplete = () => {
    scoreKeeperRef.current.recordCantoComplete(cantoIndex + 1);
    setScore(scoreKeeperRef.current.totalScore);

    if (cantoIndex < CANTOS.length - 1) {
      setCantoTransition(true);
      setTimeout(() => {
        setCantoTransition(false);
        setCantoIndex(idx => idx + 1);
        setInscribedStrokes([]); // Fresh folio for next canto
      }, 2200);
    } else {
      // Completed all 5 Cantos -> VICTORY!
      handleEndGame(true);
    }
  };

  const addHitFeedback = useCallback((type) => {
    const fb = { id: Date.now() + Math.random(), type, time: Date.now() };
    setHitFeedbacks(prev => [...prev.slice(-4), fb]);
  }, []);

  // Primary Rhythm Input Handler (Spacebar, Click, Screen Tap)
  const handleRhythmInput = useCallback(() => {
    if (!isPlaying || isPaused || countdown > 0) return;

    // Cooldown check (prevent accidental double hits within 60ms)
    const nowMs = performance.now();
    if (nowMs - inputCooldownRef.current < 60) return;
    inputCooldownRef.current = nowMs;

    const currentAudioTime = getAuthoritativeTime();
    const result = evaluateInput(currentAudioTime, activeGlyphsRef.current);

    if (!result) {
      // Offbeat press
      return;
    }

    setLastDelta(result.rawDiff);

    if (result.type === 'PERFECT' || result.type === 'GOOD') {
      const isPerf = result.type === 'PERFECT';
      playInkStroke(isPerf);
      scoreKeeperRef.current.recordHit(result.type, flowSystemRef.current.getFlow());
      flowSystemRef.current.onHit(result.type);
      difficultyRef.current.recordHit(scoreKeeperRef.current.currentCombo);

      // Inscribe the stroke onto the manuscript page!
      const newStroke = {
        id: Date.now() + Math.random(),
        glyphData: result.glyph.glyphData,
        isPerfect: isPerf,
        time: Date.now()
      };
      setInscribedStrokes(prev => [...prev, newStroke]);
      setCantoHitCount(c => c + 1);
      setActiveStrokeAnimation({ time: Date.now(), isPerfect: isPerf });
      addHitFeedback(result.type);
    } else if (result.type === 'MISS') {
      playInkBlotSound();
      scoreKeeperRef.current.recordMiss(flowSystemRef.current.getFlow());
      flowSystemRef.current.onMiss({ x: 0.28, y: 0.35 });
      difficultyRef.current.recordMiss();
      addHitFeedback('MISS');
    }

    // Update HUD state
    setScore(scoreKeeperRef.current.totalScore);
    const newCombo = scoreKeeperRef.current.currentCombo;
    setCombo(newCombo);
    setDisorders([...flowSystemRef.current.getDisorders()]);

    // Check Mushak Bonus condition (Every 10-hit streak)
    if (newCombo > 0 && newCombo % 10 === 0) {
      setMushakVisible(true);
      setTimeout(() => setMushakVisible(false), 4500);
    }

    setActiveGlyphs([...activeGlyphsRef.current]);
  }, [isPlaying, isPaused, countdown, addHitFeedback]);

  // Claim Mushak Bonus
  const handleClaimMushak = () => {
    setMushakVisible(false);
    flowSystemRef.current.onMushakBonus();
    setDisorders([...flowSystemRef.current.getDisorders()]);
    addHitFeedback('FLOW RESTORED');
  };

  // Main High-Performance Game Loop
  useEffect(() => {
    const loop = (timestamp) => {
      // FPS calculation
      const dt = (timestamp - lastFrameTimeRef.current) / 1000;
      lastFrameTimeRef.current = timestamp;
      if (dt > 0) setFps(Math.round(1 / dt));

      if (isPlaying && !isPaused) {
        const audioTime = getAuthoritativeTime();
        audioTimeRef.current = audioTime;

        // Check for missed glyphs that floated past the writing point
        const missed = checkMissedGlyphs(audioTime, activeGlyphsRef.current);
        if (missed.length > 0) {
          playInkBlotSound();
          missed.forEach(() => {
            scoreKeeperRef.current.recordMiss(flowSystemRef.current.getFlow());
            flowSystemRef.current.onMiss({ x: 0.25 + (Math.random() * 0.1 - 0.05), y: 0.35 + (Math.random() * 0.1 - 0.05) });
            difficultyRef.current.recordMiss();
          });

          setCombo(0);
          setScore(scoreKeeperRef.current.totalScore);
          setDisorders([...flowSystemRef.current.getDisorders()]);
          addHitFeedback('MISS');
        }

        // Clean up ancient glyphs
        if (activeGlyphsRef.current.length > 30) {
          activeGlyphsRef.current = activeGlyphsRef.current.filter(
            g => !g.hit && (!g.missed || audioTime - g.targetTime < 0.6)
          );
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, isPaused, addHitFeedback]);

  // Keyboard controls (Spacebar, Enter, 'D' for debug)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleRhythmInput();
      } else if (e.code === 'KeyD') {
        setShowDebug(v => !v);
      } else if (e.code === 'Escape') {
        setIsPaused(p => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRhythmInput]);

  // Pause & Resume
  const handlePause = () => {
    setIsPaused(true);
    if (schedulerRef.current) schedulerRef.current.stop();
  };

  const handleResume = () => {
    setIsPaused(false);
    if (schedulerRef.current) schedulerRef.current.start(0.2);
  };

  const handleRestart = () => {
    setIsPaused(false);
    if (schedulerRef.current) schedulerRef.current.stop();
    scoreKeeperRef.current.reset();
    flowSystemRef.current.reset();
    setScore(0);
    setCombo(0);
    setInscribedStrokes([]);
    setCantoHitCount(0);
    setDisorders([]);
    startGameplay();
  };

  return (
    <div className="game-screen">
      <DebugOverlay
        visible={showDebug}
        audioTime={audioTimeRef.current}
        fps={fps}
        flow={flow}
        cantoIndex={cantoIndex}
        combo={combo}
        difficultyPressure={difficultyRef.current.mistakePressure}
        lastHitDelta={lastDelta}
      />

      {/* Top HUD Bar */}
      <header className="hud-bar" role="banner">
        <div className="hud-item">
          <span className="hud-label">CANTO</span>
          <span className="hud-value">{cantoIndex + 1}/5</span>
        </div>

        <div className="canto-indicator">
          <span className="canto-title">{currentCanto.name}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--gold-400)' }}>{currentCanto.bpm} BPM</span>
        </div>

        <div className="hud-item">
          <span className="hud-label">COMBO</span>
          <span className="hud-value" style={{ color: combo > 10 ? 'var(--marigold-300)' : '#FFF' }}>
            {combo}x
          </span>
        </div>

        <div className="hud-item">
          <span className="hud-label">SCORE</span>
          <span className="hud-value" style={{ color: 'var(--gold-300)' }}>
            {score.toLocaleString()}
          </span>
        </div>

        <button className="btn-pause" onClick={handlePause} aria-label="Pause Game">
          ⏸ PAUSE
        </button>
      </header>

      {/* Flow Meter */}
      <FlowMeter flow={flow} />

      {/* Manuscript View Canvas */}
      <div style={{ position: 'relative', flex: 1, display: 'flex' }}>
        <ManuscriptView
          activeGlyphs={activeGlyphs}
          flow={flow}
          disorders={disorders}
          inscribedStrokes={inscribedStrokes}
          activeStrokeAnimation={activeStrokeAnimation}
          hitFeedbacks={hitFeedbacks}
          currentAudioTime={audioTimeRef.current}
          isPaused={isPaused}
          cantoIndex={cantoIndex}
          combo={combo}
          completionPercent={completionPercent}
        />

        {/* Countdown Overlay */}
        {countdown > 0 && (
          <div className="modal-overlay" style={{ background: 'rgba(18, 2, 5, 0.7)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-title)',
                fontSize: '5rem',
                color: 'var(--marigold-300)',
                textShadow: '0 0 30px rgba(245, 158, 11, 0.8)'
              }}>
                {countdown}
              </div>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--gold-300)' }}>
                {currentCanto.instruction}
              </p>
            </div>
          </div>
        )}

        {/* Canto Transition Interlude */}
        {cantoTransition && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '420px' }}>
              <h2 className="modal-title" style={{ color: 'var(--marigold-300)' }}>
                CANTO {cantoIndex + 1} COMPLETE
              </h2>
              <p style={{ fontStyle: 'italic', color: 'var(--parchment-surface)' }}>
                "{currentCanto.verseLine}"
              </p>
              <div style={{ color: 'var(--gold-300)', fontSize: '0.9rem', marginTop: '6px' }}>
                ✦ 250 PTS CANTO BONUS ✦
              </div>
            </div>
          </div>
        )}

        {/* Mushak Mouse Bonus */}
        <MushakBonus visible={mushakVisible} onClaim={handleClaimMushak} />
      </div>

      {/* Input Interaction Zone */}
      <div className="input-zone">
        <button
          className="tap-interaction-btn"
          onClick={handleRhythmInput}
          onTouchStart={(e) => {
            e.preventDefault();
            handleRhythmInput();
          }}
          aria-label="Write with the Rhythm"
        >
          <span>✒️</span>
          <span>WRITE WITH THE RHYTHM</span>
        </button>
        <span className="input-hint">
          KEEP THE INK FLOWING • PRESS SPACEBAR • CLICK CANVAS
        </span>
      </div>

      {/* Pause Modal */}
      {isPaused && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRestart}
          onQuit={onQuitToTitle}
        />
      )}
    </div>
  );
}
