import React, { useState, useEffect, useRef, useCallback } from 'react';
import CityMap from './CityMap';
import { generateRiverObjects, GAME_DURATION, BOAT_Y_SPEED } from './routes';
import { evaluateVisarjanRun } from './visarjanScoring';
import { playManjira, playFlowRestoredSound, playInkBlotSound } from '../../audio/synthInstruments';
import confetti from 'canvas-confetti';

const BOAT_X = 0.18; // Fixed X position
const BOAT_HITBOX_W = 0.06;
const BOAT_HITBOX_H = 0.04;

export default function VisarjanGame({ onStageComplete, festivalFlow }) {
  const [phase, setPhase] = useState('PLAYING'); // 'PLAYING' | 'ARRIVED' | 'COMPLETE'
  const [boatY, setBoatY] = useState(0.5);
  const [health, setHealth] = useState(100);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [hitFlash, setHitFlash] = useState(false);
  const [collectEffects, setCollectEffects] = useState([]);
  const [collectiblesGathered, setCollectiblesGathered] = useState(0);
  const [obstaclesHit, setObstaclesHit] = useState(0);

  const [riverObjects, setRiverObjects] = useState(() => generateRiverObjects(GAME_DURATION));

  const keysRef = useRef({ up: false, down: false });
  const gameLoopRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const containerRef = useRef(null);
  const boatYRef = useRef(0.5);
  const statsRef = useRef({ health: 100, obstaclesHit: 0, collectiblesGathered: 0 });
  const finishGameRef = useRef(null);

  const totalCollectibles = useRef(
    riverObjects.filter(o => o.kind === 'collectible').length
  );
  const totalObstacles = useRef(
    riverObjects.filter(o => o.kind === 'obstacle').length
  );

  // ─── KEYBOARD ───
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'ArrowUp' || e.code === 'KeyW') keysRef.current.up = true;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') keysRef.current.down = true;
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

  // Touch controls
  const handlePointerMove = useCallback((e) => {
    if (phase !== 'PLAYING') return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const normalized = (clientY - rect.top) / rect.height;
    const nextY = Math.max(0.15, Math.min(0.85, normalized));
    boatYRef.current = nextY;
    setBoatY(nextY);
  }, [phase]);

  // ─── FINISH ───
  const finishGame = useCallback((elapsed) => {
    if (phase !== 'PLAYING') return;
    setPhase('ARRIVED');
    playFlowRestoredSound();

    confetti({
      particleCount: 50,
      spread: 80,
      origin: { x: 0.5, y: 0.5 },
      colors: ['#38BDF8', '#F59E0B', '#EC4899', '#10B981', '#FEF08A'],
    });

    setTimeout(() => {
      setPhase('COMPLETE');
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

      setTimeout(() => {
        onStageComplete({
          stageId: 'visarjan',
          score: result.score,
          accuracy: result.routeEfficiency,
          details: result,
        });
      }, 1200);
    }, 1800);
  }, [phase, onStageComplete]);

  finishGameRef.current = finishGame;

  // ─── GAME LOOP ───
  useEffect(() => {
    if (phase !== 'PLAYING') return;

    const loop = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setTimeElapsed(elapsed);

      // Move boat with keyboard
      if (keysRef.current.up || keysRef.current.down) {
        setBoatY(prev => {
          let next = prev;
          if (keysRef.current.up) next -= BOAT_Y_SPEED;
          if (keysRef.current.down) next += BOAT_Y_SPEED;
          const clamped = Math.max(0.15, Math.min(0.85, next));
          boatYRef.current = clamped;
          return clamped;
        });
      }

      // Move river objects left & check collision directly
      const currentBoatY = boatYRef.current;

      setRiverObjects(prev => {
        let changed = false;
        const updated = prev.map(obj => {
          if (!obj.active || obj.hit || obj.collected) return obj;
          const newX = obj.x - obj.speed;

          // Off screen left
          if (newX < -0.15) {
            return { ...obj, x: newX, active: false };
          }

          // Check collision with boat
          const dx = Math.abs(newX - BOAT_X);
          const dy = Math.abs(obj.y - currentBoatY);

          if (dx < BOAT_HITBOX_W + (obj.width || 0.04) / 2 &&
              dy < BOAT_HITBOX_H + (obj.height || 0.04) / 2) {

            if (obj.kind === 'obstacle') {
              changed = true;
              statsRef.current.health = Math.max(0, statsRef.current.health - (obj.damage || 10));
              statsRef.current.obstaclesHit++;
              setHealth(statsRef.current.health);
              setObstaclesHit(statsRef.current.obstaclesHit);
              setHitFlash(true);
              playInkBlotSound();
              setTimeout(() => setHitFlash(false), 200);
              return { ...obj, x: newX, hit: true };
            } else if (obj.kind === 'collectible') {
              changed = true;
              statsRef.current.collectiblesGathered++;
              setCollectiblesGathered(statsRef.current.collectiblesGathered);
              setScore(s => s + (obj.points || 10));
              playManjira(0, 1.2);
              setCollectEffects(effects => [...effects.slice(-6), {
                x: newX, y: obj.y,
                points: obj.points || 10,
                time: elapsed,
              }]);
              return { ...obj, x: newX, collected: true };
            }
          }

          return { ...obj, x: newX };
        });

        return changed ? [...updated] : updated;
      });

      // Check end conditions
      if (statsRef.current.health <= 0 || elapsed >= GAME_DURATION) {
        if (finishGameRef.current) finishGameRef.current(elapsed);
        return;
      }

      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);
    return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
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
      {/* Top Bar */}
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
            {phase === 'PLAYING' ? '🌊 Navigate to the immersion ghat — ↑↓ or touch to steer' :
             phase === 'ARRIVED' ? '🪷 The sacred murti reaches the waters...' :
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
            </>
          )}
        </div>
      </div>

      {/* Game Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        <CityMap
          boatY={boatY}
          riverObjects={riverObjects}
          health={health}
          score={score}
          progress={progress}
          hitFlash={hitFlash}
          collectEffects={collectEffects}
        />

        {/* Arrival overlay */}
        {(phase === 'ARRIVED' || phase === 'COMPLETE') && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 30,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.7)',
          }}>
            <div style={{
              background: 'rgba(8, 28, 38, 0.95)',
              border: '2px solid #38BDF8',
              borderRadius: '20px',
              padding: '28px 40px',
              textAlign: 'center',
              animation: 'modalZoomIn 0.4s ease-out',
              minWidth: '300px',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🪷</div>
              <div style={{
                fontFamily: 'var(--font-title)',
                fontSize: '1.4rem',
                color: '#7DD3FC',
                fontWeight: 800,
                marginBottom: '12px',
              }}>
                {health > 0 ? 'The Murti Reaches the Waters' : 'The Journey Concludes'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
                <div>
                  <div style={{ color: '#FDE68A', fontSize: '1.3rem', fontWeight: 800 }}>{collectiblesGathered}</div>
                  <div style={{ color: 'rgba(56, 189, 248, 0.6)', fontSize: '0.68rem' }}>OFFERINGS</div>
                </div>
                <div>
                  <div style={{ color: '#86EFAC', fontSize: '1.3rem', fontWeight: 800 }}>{Math.round(health)}%</div>
                  <div style={{ color: 'rgba(56, 189, 248, 0.6)', fontSize: '0.68rem' }}>HEALTH</div>
                </div>
                <div>
                  <div style={{ color: '#F87171', fontSize: '1.3rem', fontWeight: 800 }}>{obstaclesHit}</div>
                  <div style={{ color: 'rgba(56, 189, 248, 0.6)', fontSize: '0.68rem' }}>HITS</div>
                </div>
              </div>
              <div style={{
                marginTop: '12px',
                color: '#7DD3FC',
                fontFamily: 'var(--font-script)',
                fontSize: '1.1rem',
                fontStyle: 'italic',
              }}>
                गणपति बाप्पा मोऱ्या!
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
