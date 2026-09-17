import React, { useState, useRef, useCallback } from 'react';
import PandalBoard from './PandalBoard';
import { getItemsForRound, ROUND_TIME_LIMITS, TOTAL_ROUNDS } from './components';
import { evaluatePlacement, evaluatePandalStage } from './pandalScoring';
import { playManjira, playFlowRestoredSound, playInkStroke, playInkBlotSound } from '../../audio/synthInstruments';
import confetti from 'canvas-confetti';

export default function PandalGame({ onStageComplete, festivalFlow }) {
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME_LIMITS[0]);
  const [phase, setPhase] = useState('PLAYING'); // 'PLAYING' | 'ROUND_RESULT' | 'COMPLETE'

  // Items for current round
  const [currentItems, setCurrentItems] = useState(() => getItemsForRound(1));
  const [trayItems, setTrayItems] = useState(() => getItemsForRound(1));
  const [placedThisRound, setPlacedThisRound] = useState([]);
  const [allPlacedItems, setAllPlacedItems] = useState([]);
  const [allPlacements, setAllPlacements] = useState([]);
  const allPlacementsRef = useRef([]);

  const [draggingItem, setDraggingItem] = useState(null);
  const [dragPosition, setDragPosition] = useState(null);
  const [hoveredZone, setHoveredZone] = useState(null);
  const [lastPlacementResult, setLastPlacementResult] = useState(null);
  const [roundScore, setRoundScore] = useState(0);

  const boardRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  // Start timer on mount and round change
  React.useEffect(() => {
    if (phase !== 'PLAYING') return;
    const limit = ROUND_TIME_LIMITS[round - 1] || 15;
    setTimeLeft(limit);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 0.1;
        if (next <= 0) {
          clearInterval(timerRef.current);
          handleRoundEnd();
          return 0;
        }
        return Math.max(0, next);
      });
    }, 100);

    return () => clearInterval(timerRef.current);
  }, [phase, round]);

  const getNormalizedPosition = (e) => {
    const board = boardRef.current;
    if (!board) return null;
    const rect = board.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height,
    };
  };

  const checkZoneProximity = useCallback((item, pos) => {
    if (!item || !pos) return null;
    const dx = pos.x - item.targetX;
    const dy = pos.y - item.targetY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= item.zoneRadius * 0.5) return 'perfect';
    if (dist <= item.zoneRadius * 2) return 'near';
    return null;
  }, []);

  // ─── DRAG HANDLERS ───
  const handleDragStart = (item) => {
    if (phase !== 'PLAYING') return;
    setDraggingItem(item);
    playManjira(0, 1.1);
  };

  const handleDragMove = (e) => {
    if (!draggingItem) return;
    e.preventDefault();
    const pos = getNormalizedPosition(e);
    if (pos) {
      setDragPosition(pos);
      setHoveredZone(checkZoneProximity(draggingItem, pos));
    }
  };

  const handleDragEnd = (e) => {
    if (!draggingItem || phase !== 'PLAYING') return;

    const pos = dragPosition || getNormalizedPosition(e);
    if (!pos) {
      setDraggingItem(null);
      setDragPosition(null);
      setHoveredZone(null);
      return;
    }

    // Evaluate placement
    const result = evaluatePlacement(draggingItem, pos.x, pos.y);
    setLastPlacementResult({ ...result, name: draggingItem.name });

    if (result.rating === 'PERFECT') {
      playInkStroke(true);
      confetti({
        particleCount: 15,
        spread: 40,
        origin: { x: pos.x, y: pos.y * 0.6 },
        colors: ['#10B981', '#34D399', '#FDE68A'],
      });
    } else if (result.rating === 'GREAT') {
      playInkStroke(true);
    } else if (result.rating === 'GOOD') {
      playManjira(0, 1.0);
    } else {
      playInkBlotSound();
    }

    // Record placement
    const placed = {
      id: draggingItem.id,
      icon: draggingItem.icon,
      x: pos.x,
      y: pos.y,
      rating: result.rating,
    };

    setPlacedThisRound(prev => [...prev, placed]);
    setAllPlacedItems(prev => [...prev, placed]);
    setAllPlacements(prev => [...prev, result]);
    allPlacementsRef.current.push(result);
    setRoundScore(prev => prev + result.score);

    // Remove from tray
    setTrayItems(prev => prev.filter(i => i.id !== draggingItem.id));

    // Clear drag state
    setDraggingItem(null);
    setDragPosition(null);
    setHoveredZone(null);

    // Clear placement feedback after brief display
    setTimeout(() => setLastPlacementResult(null), 1500);

    // Check if all items for this round are placed
    const remainingAfter = trayItems.filter(i => i.id !== draggingItem.id);
    if (remainingAfter.length === 0) {
      clearInterval(timerRef.current);
      handleRoundEnd();
    }
  };

  // ─── ROUND END ───
  const handleRoundEnd = useCallback(() => {
    if (phase !== 'PLAYING') return;
    setPhase('ROUND_RESULT');

    setTimeout(() => {
      if (round < TOTAL_ROUNDS) {
        // Next round
        const nextRound = round + 1;
        setRound(nextRound);
        const nextItems = getItemsForRound(nextRound);
        setCurrentItems(nextItems);
        setTrayItems(nextItems);
        setPlacedThisRound([]);
        setRoundScore(0);
        setPhase('PLAYING');
      } else {
        // Stage complete!
        setPhase('COMPLETE');
        playFlowRestoredSound();

        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const stageResult = evaluatePandalStage(allPlacementsRef.current, elapsed);

        confetti({
          particleCount: 40,
          spread: 70,
          origin: { x: 0.5, y: 0.5 },
          colors: ['#F59E0B', '#D4AF37', '#EC4899', '#10B981'],
        });

        setTimeout(() => {
          onStageComplete({
            stageId: 'pandal',
            score: stageResult.score,
            accuracy: stageResult.accuracy,
            details: stageResult,
          });
        }, 1800);
      }
    }, 1800);
  }, [phase, round, allPlacements, onStageComplete]);

  return (
    <div
      className="stage-workspace"
      style={{ display: 'flex', flexDirection: 'column', userSelect: 'none' }}
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
    >
      {/* Top Bar */}
      <div className="stage-instruction-bar">
        <div>
          <span className="stage-title">VIGHNA II: PANDAL BUILDER</span>
          <p className="stage-hint">
            {phase === 'PLAYING' ? '✦ Drag decorations from the tray onto the pandal blueprint' :
             phase === 'ROUND_RESULT' ? '✦ Round complete!' :
             '✦ The Pandal shines in sacred illumination!'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{
            background: 'rgba(212, 175, 55, 0.15)',
            border: '1px solid var(--gold-500)',
            borderRadius: '9999px',
            padding: '4px 14px',
            fontSize: '0.78rem',
            color: 'var(--gold-300)',
            fontWeight: 700,
          }}>
            ROUND {round} / {TOTAL_ROUNDS}
          </div>

          {phase === 'PLAYING' && (
            <div style={{
              background: timeLeft <= 3 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.15)',
              border: `1px solid ${timeLeft <= 3 ? '#EF4444' : '#10B981'}`,
              borderRadius: '9999px',
              padding: '4px 14px',
              fontSize: '0.78rem',
              color: timeLeft <= 3 ? '#F87171' : '#34D399',
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
            }}>
              ⏱ {timeLeft.toFixed(1)}s
            </div>
          )}
        </div>
      </div>

      {/* Main Board Area */}
      <div ref={boardRef} style={{ flex: 1, position: 'relative' }}>
        <PandalBoard
          roundItems={currentItems}
          placedItems={placedThisRound}
          draggingItem={draggingItem}
          dragPosition={dragPosition}
          hoveredZone={hoveredZone}
          allPlacedItems={allPlacedItems}
          isCompleted={phase === 'COMPLETE'}
        />

        {/* Placement Feedback Toast */}
        {lastPlacementResult && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 40,
            background: lastPlacementResult.rating === 'PERFECT'
              ? 'linear-gradient(135deg, rgba(6, 78, 59, 0.95), rgba(4, 47, 46, 0.98))'
              : lastPlacementResult.rating === 'MISSED'
              ? 'linear-gradient(135deg, rgba(127, 29, 29, 0.95), rgba(69, 10, 10, 0.98))'
              : 'linear-gradient(135deg, rgba(120, 27, 43, 0.95), rgba(61, 10, 19, 0.98))',
            border: `2px solid ${lastPlacementResult.rating === 'PERFECT' ? '#10B981' : lastPlacementResult.rating === 'MISSED' ? '#EF4444' : '#FBBF24'}`,
            borderRadius: 'var(--radius-md)',
            padding: '8px 20px',
            textAlign: 'center',
            boxShadow: '0 8px 30px rgba(0,0,0,0.8)',
            animation: 'modalZoomIn 0.2s ease-out',
          }}>
            <div style={{
              fontFamily: 'var(--font-title)',
              fontSize: '1rem',
              color: lastPlacementResult.rating === 'PERFECT' ? '#34D399' : lastPlacementResult.rating === 'MISSED' ? '#F87171' : '#FDE68A',
              fontWeight: 800,
            }}>
              {lastPlacementResult.rating}! +{lastPlacementResult.score} pts
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--parchment-surface)', marginTop: '2px' }}>
              {lastPlacementResult.name} — {lastPlacementResult.accuracy}% accuracy
            </div>
          </div>
        )}
      </div>

      {/* Bottom Item Tray */}
      {phase === 'PLAYING' && (
        <div style={{
          padding: '10px 16px',
          background: 'rgba(26, 4, 8, 0.9)',
          borderTop: '1px solid var(--gold-800)',
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          {trayItems.map(item => (
            <div
              key={item.id}
              onMouseDown={() => handleDragStart(item)}
              onTouchStart={() => handleDragStart(item)}
              style={{
                background: draggingItem?.id === item.id
                  ? 'rgba(245, 158, 11, 0.3)'
                  : 'rgba(14, 48, 62, 0.6)',
                border: `1.5px solid ${draggingItem?.id === item.id ? '#FBBF24' : 'rgba(212, 175, 55, 0.3)'}`,
                borderRadius: '12px',
                padding: '8px 14px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                cursor: 'grab',
                transition: 'all 0.2s ease',
                minWidth: '80px',
                userSelect: 'none',
              }}
            >
              <span style={{ fontSize: '1.6rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}>{item.icon}</span>
              <span style={{
                fontSize: '0.65rem',
                color: 'var(--gold-300)',
                fontWeight: 700,
                letterSpacing: '0.5px',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}>
                {item.name.split(' ').slice(0, 2).join(' ')}
              </span>
            </div>
          ))}

          {trayItems.length === 0 && (
            <span style={{ fontSize: '0.8rem', color: 'var(--gold-400)', fontStyle: 'italic' }}>
              All items placed this round! ✦
            </span>
          )}
        </div>
      )}
    </div>
  );
}
