import React, { useState, useEffect, useRef, useCallback } from 'react';
import Kitchen from './Kitchen';
import { getRecipe, generateFallingItems } from './orders';
import { evaluateModakSession } from './modakScoring';
import { playManjira, playFlowRestoredSound, playInkBlotSound, playInkStroke } from '../../audio/synthInstruments';
import confetti from 'canvas-confetti';

const TOTAL_MODAKS = 5;
const BOWL_SPEED = 0.035;
const CATCH_ZONE_Y = 0.80;
const CATCH_RADIUS_X = 0.08;

export default function ModakGame({ onStageComplete, festivalFlow }) {
  const [modakIndex, setModakIndex] = useState(0);
  const [phase, setPhase] = useState('CATCHING'); // 'CATCHING' | 'STEAMING' | 'NEXT' | 'COMPLETE'
  const [bowlX, setBowlX] = useState(0.5);
  const [fallingItems, setFallingItems] = useState([]);
  const [catchEffects, setCatchEffects] = useState([]);

  const [caughtCorrect, setCaughtCorrect] = useState(0);
  const [totalCorrectCatches, setTotalCorrectCatches] = useState(0);
  const [totalWrongCatches, setTotalWrongCatches] = useState(0);
  const [totalBadCatches, setTotalBadCatches] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [comboMax, setComboMax] = useState(0);
  const [modaksCompleted, setModaksCompleted] = useState(0);
  const [perfectSteams, setPerfectSteams] = useState(0);

  const [steamProgress, setSteamProgress] = useState(0);

  const keysRef = useRef({ left: false, right: false });
  const startTimeRef = useRef(Date.now());
  const gameLoopRef = useRef(null);
  const spawnTimeRef = useRef(Date.now());
  const recipe = getRecipe(modakIndex);

  // Generate items for current recipe
  useEffect(() => {
    if (phase !== 'CATCHING') return;
    const items = generateFallingItems(recipe, 25);
    setFallingItems(items.map((item, idx) => ({
      ...item,
      uid: `${modakIndex}-${idx}`,
      y: -0.05 - (idx * 0.12),  // Stacked above screen
      caught: false,
      missed: false,
    })));
    setCaughtCorrect(0);
    spawnTimeRef.current = Date.now();
  }, [modakIndex, phase]);

  // ─── KEYBOARD CONTROLS ───
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keysRef.current.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keysRef.current.right = true;
      if (e.code === 'Space' && phase === 'STEAMING') {
        e.preventDefault();
        handleLiftLid();
      }
    };
    const handleKeyUp = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keysRef.current.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keysRef.current.right = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [phase]);

  // Touch / pointer control
  const containerRef = useRef(null);
  const handlePointerMove = useCallback((e) => {
    if (phase !== 'CATCHING') return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const normalized = (clientX - rect.left) / rect.width;
    setBowlX(Math.max(0.1, Math.min(0.9, normalized)));
  }, [phase]);

  // ─── MAIN GAME LOOP ───
  useEffect(() => {
    if (phase !== 'CATCHING') return;

    const loop = () => {
      // Move bowl with keyboard
      setBowlX(prev => {
        let next = prev;
        if (keysRef.current.left) next -= BOWL_SPEED;
        if (keysRef.current.right) next += BOWL_SPEED;
        return Math.max(0.1, Math.min(0.9, next));
      });

      // Move falling items down
      setFallingItems(prev => {
        const updated = prev.map(item => {
          if (item.caught || item.missed) return item;
          const newY = item.y + item.speed;

          // Check if past catch zone without catching
          if (newY > 1.05) {
            return { ...item, y: newY, missed: true };
          }

          return { ...item, y: newY };
        });

        return updated;
      });

      // Check catches
      setFallingItems(prev => {
        let changed = false;
        const updated = prev.map(item => {
          if (item.caught || item.missed) return item;

          // Near catch zone?
          if (item.y >= CATCH_ZONE_Y - 0.03 && item.y <= CATCH_ZONE_Y + 0.05) {
            // Within bowl X range?
            setBowlX(currentBowlX => {
              const dx = Math.abs(item.x - currentBowlX);
              if (dx <= CATCH_RADIUS_X && !item.caught) {
                changed = true;
                item.caught = true;

                // Add catch effect
                const effectType = item.isBad ? 'bad' : item.isCorrect ? 'correct' : 'wrong';
                setCatchEffects(prev => [...prev.slice(-10), {
                  x: item.x, y: CATCH_ZONE_Y, type: effectType, time: Date.now() / 1000,
                }]);

                if (item.isCorrect) {
                  playManjira(0, 1.0 + Math.random() * 0.3);
                  setTotalCorrectCatches(c => c + 1);
                  setCaughtCorrect(c => {
                    const newCount = c + 1;
                    if (newCount >= recipe.catchTarget) {
                      // Enough caught — move to steaming
                      setTimeout(() => setPhase('STEAMING'), 300);
                    }
                    return newCount;
                  });
                  setComboCount(c => {
                    const newC = c + 1;
                    setComboMax(m => Math.max(m, newC));
                    return newC;
                  });
                } else if (item.isBad) {
                  playInkBlotSound();
                  setTotalBadCatches(c => c + 1);
                  setComboCount(0);
                } else {
                  setTotalWrongCatches(c => c + 1);
                  setComboCount(0);
                }
              }
              return currentBowlX;
            });
          }

          return item;
        });

        return updated;
      });

      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);
    return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, [phase, recipe]);

  // ─── STEAMING PHASE ───
  useEffect(() => {
    if (phase !== 'STEAMING') return;
    setSteamProgress(10);
    let dir = 1;

    const interval = setInterval(() => {
      setSteamProgress(prev => {
        let next = prev + dir * 2.5;
        if (next >= 100) {
          dir = -1;
          next = 100;
        } else if (next <= 0) {
          dir = 1;
          next = 0;
        }
        return next;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [phase]);

  // ─── LIFT LID (Steam Timing) ───
  const handleLiftLid = useCallback(() => {
    if (phase !== 'STEAMING') return;

    const isPerfect = steamProgress >= 40 && steamProgress <= 65;
    if (isPerfect) {
      playInkStroke(true);
      setPerfectSteams(p => p + 1);
      confetti({
        particleCount: 15,
        spread: 40,
        origin: { x: 0.5, y: 0.4 },
        colors: ['#10B981', '#34D399', '#FDE68A'],
      });
    } else {
      playManjira(0, 0.8);
    }

    setModaksCompleted(m => m + 1);
    setPhase('NEXT');

    setTimeout(() => {
      if (modakIndex < TOTAL_MODAKS - 1) {
        setModakIndex(i => i + 1);
        setPhase('CATCHING');
      } else {
        // All modaks complete
        setPhase('COMPLETE');
        playFlowRestoredSound();

        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const result = evaluateModakSession({
          totalCorrectCatches: totalCorrectCatches + (isPerfect ? 0 : 0),
          totalWrongCatches,
          totalBadCatches,
          modaksCompleted: modaksCompleted + 1,
          perfectSteams: isPerfect ? perfectSteams + 1 : perfectSteams,
          totalModaks: TOTAL_MODAKS,
          comboMax,
          timeElapsedSeconds: elapsed,
        });

        setTimeout(() => {
          onStageComplete({
            stageId: 'modak',
            score: result.score,
            accuracy: result.catchAccuracy,
            details: result,
          });
        }, 1800);
      }
    }, 1200);
  }, [phase, steamProgress, modakIndex, totalCorrectCatches, totalWrongCatches, totalBadCatches, modaksCompleted, perfectSteams, comboMax, onStageComplete]);

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
        padding: '10px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--gold-800)',
        background: 'rgba(38, 5, 11, 0.75)',
      }}>
        <div>
          <span style={{ fontFamily: 'var(--font-title)', fontSize: '0.85rem', color: 'var(--marigold-300)' }}>
            VIGHNA III: {recipe.icon} {recipe.name}
          </span>
          <p style={{ fontSize: '0.72rem', color: 'var(--gold-400)', margin: 0 }}>
            {phase === 'CATCHING' ? 'Catch the right ingredients! ← → or slide to move bowl' :
             phase === 'STEAMING' ? 'Press SPACE or tap to lift lid in the golden zone!' :
             phase === 'NEXT' ? 'Plating onto sacred leaf...' :
             'All modaks prepared! ✦'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{
            background: 'rgba(46, 125, 50, 0.25)',
            border: '1.5px solid #2E7D32',
            borderRadius: '10px',
            padding: '4px 14px',
            fontSize: '0.78rem',
            color: '#86EFAC',
            fontWeight: 700,
          }}>
            🍃 {modaksCompleted} / {TOTAL_MODAKS}
          </div>
        </div>
      </div>

      {/* Game Canvas */}
      <div style={{ flex: 1, position: 'relative' }} onClick={phase === 'STEAMING' ? handleLiftLid : undefined}>
        <Kitchen
          bowlX={bowlX}
          fallingItems={fallingItems}
          catchEffects={catchEffects}
          recipe={recipe}
          caughtCorrect={caughtCorrect}
          catchTarget={recipe.catchTarget}
          steamPhase={phase === 'STEAMING' ? 'steaming' : null}
          steamProgress={steamProgress}
          comboCount={comboCount}
        />

        {/* Steam Lift Button (mobile) */}
        {phase === 'STEAMING' && (
          <button
            onClick={handleLiftLid}
            className="btn-festival-primary"
            style={{
              position: 'absolute',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 30,
              padding: '12px 28px',
              fontSize: '0.9rem',
            }}
          >
            ♨️ LIFT STEAMER LID
          </button>
        )}

        {/* Ingredient legend */}
        {phase === 'CATCHING' && (
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
            display: 'flex',
            gap: '6px',
            background: 'rgba(26, 4, 8, 0.85)',
            borderRadius: '9999px',
            padding: '4px 14px',
            fontSize: '0.68rem',
            color: 'var(--gold-400)',
          }}>
            <span>🌶️ = Penalty</span>
            <span>|</span>
            <span>← → / Touch to move</span>
          </div>
        )}

        <Kitchen
          currentOrder={currentOrder}
          onModakComplete={handleModakComplete}
          streak={streak}
        />
      </div>
    </div>
  );
}
