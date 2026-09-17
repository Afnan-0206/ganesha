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
          <p style={{ fontSize: '0.72rem', color: 'var(--gold-400)', margin: 0 }}>
            {feedback}
          </p>
        </div>

        {/* Action Button */}
        {!isMoving ? (
          <button className="btn-festival-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }} onClick={handleStartProcession}>
            BEGIN PROCESSION 🛕
          </button>
        ) : (
          <div style={{ color: 'var(--gold-300)', fontSize: '0.8rem', fontWeight: 700 }}>
            JOURNEY PROGRESS: {Math.round(progress * 100)}%
          </div>
        )}
      </div>

      {/* Main Map View */}
      <div style={{ flex: 1, position: 'relative' }}>
        <CityMap
          routes={routes}
          selectedRoute={selectedRoute}
          onSelectRoute={setSelectedRoute}
          processionProgress={progress}
          isMoving={isMoving}
          activeVighna={activeVighna}
          onAdaptRoute={handleAdaptRoute}
        />
      </div>

      {/* Bottom Route Selector Bar */}
      {!isMoving && (
        <div style={{
          padding: '10px 16px',
          background: 'rgba(26, 4, 8, 0.85)',
          borderTop: '1px solid var(--gold-800)',
          display: 'flex',
          gap: '10px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {routes.map(r => (
            <button
              key={r.id}
              onClick={() => setSelectedRoute(r)}
              className={selectedRoute.id === r.id ? 'btn-festival-primary' : 'btn-festival-secondary'}
              style={{ padding: '6px 14px', fontSize: '0.75rem' }}
            >
              <span>{r.name}</span>
              <span style={{ opacity: 0.8 }}>({r.distance} • {r.crowd})</span>
            </button>
          ))}
        </div>
      )}

      {/* Eco-Friendly Clay Murti Immersion Ceremony Overlay */}
      {showImmersionCeremony && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(14, 116, 144, 0.95), rgba(15, 23, 42, 0.98))',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          zIndex: 60,
          animation: 'modalZoomIn 0.3s ease-out',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(245, 158, 11, 0.18)',
            border: '1px solid var(--border-prominent)',
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.76rem',
            color: 'var(--marigold-300)',
            letterSpacing: '1.2px',
            textTransform: 'uppercase',
            marginBottom: '12px'
          }}>
            <span>🌱</span>
            <span>शाडूची मातीची मूर्ती • 100% ECO-FRIENDLY CLAY VISARJAN</span>
          </div>

          <div style={{
            fontSize: '3.5rem',
            marginBottom: '8px',
            filter: 'drop-shadow(0 0 20px rgba(56, 189, 248, 0.8))',
            animation: 'diyaFlicker 1.8s infinite'
          }}>
            🛕🌊
          </div>

          <h2 style={{
            fontFamily: 'var(--font-title)',
            fontSize: '1.8rem',
            color: 'var(--gold-200)',
            margin: '0 0 8px 0',
            letterSpacing: '1px',
            textShadow: '0 2px 12px rgba(0,0,0,0.8)'
          }}>
            गणपती बाप्पा मोरया!
          </h2>

          <p style={{
            fontFamily: 'var(--font-title)',
            fontSize: '1.2rem',
            color: 'var(--marigold-300)',
            margin: '0 0 16px 0'
          }}>
            पुढच्या वर्षी लवकर या!
          </p>

          <p style={{
            maxWidth: '520px',
            fontSize: '0.86rem',
            lineHeight: '1.5',
            color: 'var(--parchment-surface)',
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 18px',
            margin: '0 0 16px 0'
          }}>
            The pure Shadu clay murti gently dissolves into the sacred waters, returning harmoniously to Mother Earth with zero ecological footprint. Diyas and marigolds float serenely into the twilight.
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontSize: '1.3rem'
          }}>
            <span style={{ animation: 'gentlePulse 1.2s infinite' }}>🪔</span>
            <span style={{ animation: 'gentlePulse 1.4s infinite' }}>🌼</span>
            <span style={{ animation: 'gentlePulse 1.2s infinite' }}>🌊</span>
            <span style={{ animation: 'gentlePulse 1.4s infinite' }}>🌼</span>
            <span style={{ animation: 'gentlePulse 1.2s infinite' }}>🪔</span>
          </div>
        </div>
      )}
    </div>
  );
}
