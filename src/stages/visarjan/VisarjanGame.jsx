import React, { useState, useEffect, useRef, useCallback } from 'react';
import CityMap from './CityMap';
import { generateRiverObjects, GAME_DURATION, BOAT_Y_SPEED } from './routes';
import { evaluateVisarjanRun } from './visarjanScoring';
import { playManjira, playFlowRestoredSound, playInkBlotSound } from '../../audio/synthInstruments';
import confetti from 'canvas-confetti';
import { Trophy, ArrowRight, Award } from 'lucide-react';

const BOAT_X = 0.18; // Fixed X position
const BOAT_HITBOX_W = 0.06;
const BOAT_HITBOX_H = 0.045;

export default function VisarjanGame({ onStageComplete, festivalFlow }) {
  const [phase, setPhase] = useState('PLAYING'); // 'PLAYING' | 'ARRIVED' | 'COMPLETE'
  const [health, setHealth] = useState(100);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [hitFlash, setHitFlash] = useState(false);
  const [collectiblesGathered, setCollectiblesGathered] = useState(0);
  const [obstaclesHit, setObstaclesHit] = useState(0);
  const [evaluation, setEvaluation] = useState(null);

  // References for zero-latency, lag-free 60 FPS animation without React re-render penalties
  const riverObjectsRef = useRef(generateRiverObjects(GAME_DURATION));
  const boatYRef = useRef(0.5);
  const collectEffectsRef = useRef([]);
  const keysRef = useRef({ up: false, down: false });
  const gameLoopRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const lastHudUpdateRef = useRef(0);
  const containerRef = useRef(null);
  const statsRef = useRef({ health: 100, score: 0, obstaclesHit: 0, collectiblesGathered: 0 });
  const finishGameRef = useRef(null);

  const totalCollectibles = useRef(
    riverObjectsRef.current.filter(o => o.kind === 'collectible').length
  );
  const totalObstacles = useRef(
    riverObjectsRef.current.filter(o => o.kind === 'obstacle').length
  );

  // ─── KEYBOARD HANDLERS ───
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        keysRef.current.up = true;
      }
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        keysRef.current.down = true;
      }
    };
    const handleKeyUp = (e) => {
      if (e.code === 'ArrowUp' || e.code === 'KeyW') keysRef.current.up = false;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') keysRef.current.down = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // ─── TOUCH / POINTER CONTROLS ───
  const handlePointerMove = useCallback((e) => {
    if (phase !== 'PLAYING') return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const normalized = (clientY - rect.top) / rect.height;
    boatYRef.current = Math.max(0.15, Math.min(0.85, normalized));
  }, [phase]);

  // ─── STAGE COMPLETION HANDLER ───
  const proceedToResults = useCallback((resultData) => {
    const res = resultData || evaluation;
    if (!res) return;
    onStageComplete({
      stageId: 'visarjan',
      score: res.score,
      accuracy: res.routeEfficiency,
      details: res,
    });
  }, [evaluation, onStageComplete]);

  // ─── FINISH TRIGGER ───
  const finishGame = useCallback((elapsed) => {
    if (phase !== 'PLAYING') return;
    setPhase('ARRIVED');
    playFlowRestoredSound();

    confetti({
      particleCount: 60,
      spread: 85,
      origin: { x: 0.5, y: 0.5 },
      colors: ['#38BDF8', '#F59E0B', '#EC4899', '#10B981', '#FEF08A'],
    });

    const stats = statsRef.current;
    const result = evaluateVisarjanRun({
      collectiblesGathered: stats.collectiblesGathered,
      totalCollectibles: totalCollectibles.current,
      obstaclesHit: stats.obstaclesHit,
      totalObstacles: totalObstacles.current,
      healthRemaining: stats.health,
      distanceTraveled: Math.min(1, elapsed / GAME_DURATION),
      maxDistance: 1,
      timeElapsedSeconds: elapsed,
    });
    setEvaluation(result);

    setTimeout(() => {
      setPhase('COMPLETE');
      // Auto-advance after brief delay if user doesn't click
      setTimeout(() => {
        proceedToResults(result);
      }, 2400);
    }, 1500);
  }, [phase, proceedToResults]);

  finishGameRef.current = finishGame;

  // ─── ZERO-LAG 60FPS GAME LOOP ───
  useEffect(() => {
    if (phase !== 'PLAYING') return;

    startTimeRef.current = Date.now();
    lastHudUpdateRef.current = 0;

    const loop = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;

      // Throttle HUD timer updates to 4 times a second (zero lag)
      if (elapsed - lastHudUpdateRef.current >= 0.25) {
        lastHudUpdateRef.current = elapsed;
        setTimeElapsed(elapsed);
      }

      // Snappy Boat Steering
      if (keysRef.current.up) {
        boatYRef.current = Math.max(0.15, boatYRef.current - BOAT_Y_SPEED);
      }
      if (keysRef.current.down) {
        boatYRef.current = Math.min(0.85, boatYRef.current + BOAT_Y_SPEED);
      }

      const currentBoatY = boatYRef.current;
      const objects = riverObjectsRef.current;

      // Update river items directly in-place without copying arrays
      for (let i = 0; i < objects.length; i++) {
        const obj = objects[i];
        if (!obj.active || obj.hit || obj.collected) continue;

        obj.x -= obj.speed;

        if (obj.x < -0.15) {
          obj.active = false;
          continue;
        }

        // Hitbox collision check with Boat
        const dx = Math.abs(obj.x - BOAT_X);
        const dy = Math.abs(obj.y - currentBoatY);

        if (dx < BOAT_HITBOX_W + (obj.width || 0.04) / 2 &&
            dy < BOAT_HITBOX_H + (obj.height || 0.04) / 2) {

          if (obj.kind === 'obstacle') {
            obj.hit = true;
            statsRef.current.health = Math.max(0, statsRef.current.health - (obj.damage || 14));
            statsRef.current.obstaclesHit++;
            setHealth(statsRef.current.health);
            setObstaclesHit(statsRef.current.obstaclesHit);
            setHitFlash(true);
            playInkBlotSound();
            setTimeout(() => setHitFlash(false), 180);
          } else if (obj.kind === 'collectible') {
            obj.collected = true;
            statsRef.current.collectiblesGathered++;
            statsRef.current.score += (obj.points || 15);
            setCollectiblesGathered(statsRef.current.collectiblesGathered);
            setScore(statsRef.current.score);
            playManjira(0, 1.2);

            collectEffectsRef.current.push({
              x: obj.x,
              y: obj.y,
              points: obj.points || 15,
              time: performance.now() / 1000,
            });
          }
        }
      }

      // Check End Conditions (Zero health or full time duration)
      if (statsRef.current.health <= 0 || elapsed >= GAME_DURATION) {
        if (finishGameRef.current) finishGameRef.current(elapsed);
        return;
      }

      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [phase]);

  const progress = Math.min(1, timeElapsed / GAME_DURATION);

  return (
    <div
      ref={containerRef}
      className="stage-workspace"
      style={{ display: 'flex', flexDirection: 'column', touchAction: 'none' }}
      onMouseMove={handlePointerMove}
      onTouchMove={handlePointerMove}
    >
      {/* Top Bar HUD */}
      <div style={{
        padding: '8px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
        background: 'rgba(8, 28, 38, 0.85)',
      }}>
        <div>
          <span style={{ fontFamily: 'var(--font-title)', fontSize: '0.85rem', color: '#7DD3FC' }}>
            VIGHNA V: VISARJAN YATRA
          </span>
          <p style={{ fontSize: '0.72rem', color: 'rgba(56, 189, 248, 0.7)', margin: 0 }}>
            {phase === 'PLAYING' ? '🌊 Steer the sacred chariot — [W/S] or [↑/↓] or Mouse/Touch' :
             phase === 'ARRIVED' ? '🪷 The sacred murti reaches the holy immersion waters...' :
             '✦ Ganpati Bappa Morya! ✦'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {phase === 'PLAYING' && (
            <>
              <div style={{
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: '9999px',
                padding: '4px 12px',
                fontSize: '0.75rem',
                color: '#7DD3FC',
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
              }}>
                ⏱ {Math.max(0, GAME_DURATION - timeElapsed).toFixed(0)}s
              </div>
              <div style={{
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                borderRadius: '9999px',
                padding: '4px 12px',
                fontSize: '0.75rem',
                color: '#FDE68A',
                fontWeight: 700,
              }}>
                🪔 {collectiblesGathered}
              </div>
              <div style={{
                background: health > 30 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: `1px solid ${health > 30 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                borderRadius: '9999px',
                padding: '4px 12px',
                fontSize: '0.75rem',
                color: health > 30 ? '#86EFAC' : '#FCA5A5',
                fontWeight: 700,
              }}>
                ❤️ {Math.round(health)}%
              </div>
            </>
          )}
        </div>
      </div>

      {/* Lag-Free 60FPS Game Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        <CityMap
          boatYRef={boatYRef}
          riverObjectsRef={riverObjectsRef}
          collectEffectsRef={collectEffectsRef}
          health={health}
          score={score}
          progress={progress}
          hitFlash={hitFlash}
        />

        {/* Arrival & Completion Overlay */}
        {(phase === 'ARRIVED' || phase === 'COMPLETE') && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 30,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
          }}>
            <div style={{
              background: 'rgba(8, 28, 38, 0.96)',
              border: '2px solid #38BDF8',
              borderRadius: '24px',
              padding: '30px 40px',
              textAlign: 'center',
              animation: 'modalZoomIn 0.35s ease-out',
              maxWidth: '440px',
              width: '90%',
              boxShadow: '0 0 35px rgba(56, 189, 248, 0.35)',
            }}>
              <div style={{ fontSize: '3.2rem', marginBottom: '8px' }}>🪷</div>
              <div style={{
                fontFamily: 'var(--font-title)',
                fontSize: '1.45rem',
                color: '#7DD3FC',
                fontWeight: 800,
                marginBottom: '10px',
              }}>
                {health > 0 ? 'Sacred Immersion Fulfilled!' : 'The Journey Concludes'}
              </div>

              <p style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.75)', margin: '0 0 16px 0' }}>
                With devotion and joyous song, Lord Ganesha departs for Mount Kailash, taking all obstacles with Him.
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '14px',
                padding: '12px',
                marginBottom: '20px',
              }}>
                <div>
                  <div style={{ color: '#FDE68A', fontSize: '1.35rem', fontWeight: 800 }}>{collectiblesGathered}</div>
                  <div style={{ color: 'rgba(56, 189, 248, 0.7)', fontSize: '0.68rem', fontWeight: 700 }}>OFFERINGS</div>
                </div>
                <div>
                  <div style={{ color: '#86EFAC', fontSize: '1.35rem', fontWeight: 800 }}>{Math.round(health)}%</div>
                  <div style={{ color: 'rgba(56, 189, 248, 0.7)', fontSize: '0.68rem', fontWeight: 700 }}>HEALTH</div>
                </div>
                <div>
                  <div style={{ color: '#F87171', fontSize: '1.35rem', fontWeight: 800 }}>{obstaclesHit}</div>
                  <div style={{ color: 'rgba(56, 189, 248, 0.7)', fontSize: '0.68rem', fontWeight: 700 }}>HITS</div>
                </div>
              </div>

              <div style={{
                color: '#FDE68A',
                fontFamily: 'var(--font-script)',
                fontSize: '1.25rem',
                fontStyle: 'italic',
                marginBottom: '18px',
              }}>
                गणपति बाप्पा मोऱ्या! पुढच्या वर्षी लवकर या!
              </div>

              {/* Big Action Button to View Final Results & Leaderboard */}
              <button
                className="btn-festival-primary"
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  fontSize: '0.96rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)',
                }}
                onClick={() => proceedToResults()}
              >
                <Trophy size={18} />
                <span>VIEW RESULTS & LEADERBOARD</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
