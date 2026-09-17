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

        {/* Live Power Load Meter */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(20, 2, 5, 0.7)',
          border: `1px solid ${isOverload ? '#EF4444' : '#F59E0B'}`,
          borderRadius: '10px',
          padding: '6px 14px'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--gold-300)', fontWeight: 700 }}>
            LOAD: {totalUsed}W / {maxCap}W
          </span>
          <button
            className="btn-festival-primary"
            style={{ padding: '6px 18px', fontSize: '0.82rem' }}
            onClick={handleEnergizePandal}
            disabled={isCompleted}
          >
            {isCompleted ? 'ILLUMINATED ✓' : 'ENERGIZE PANDAL'}
          </button>
        </div>
      </div>

      {/* Board */}
      <div style={{ flex: 1, position: 'relative' }}>
        <PandalBoard
          nodes={nodes}
          connectedNodeIds={connectedNodeIds}
          onToggleNode={handleToggleNode}
          vighna={vighna}
          isCompleted={isCompleted}
        />
      </div>
    </div>
  );
}
