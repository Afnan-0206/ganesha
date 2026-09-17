import React, { useState, useRef, useCallback, useEffect } from 'react';
import PandalBoard from './PandalBoard';
import { getItemsForRound, ROUND_TIME_LIMITS, TOTAL_ROUNDS } from './components';
import { evaluatePlacement, evaluatePandalStage } from './pandalScoring';
import { playManjira, playFlowRestoredSound, playInkStroke, playInkBlotSound } from '../../audio/synthInstruments';
import confetti from 'canvas-confetti';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function PandalGame({ onStageComplete, festivalFlow }) {
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME_LIMITS[0] || 18);
  const [phase, setPhase] = useState('PLAYING'); // 'PLAYING' | 'ROUND_RESULT' | 'COMPLETE'

  // Items for current round
  const [currentItems, setCurrentItems] = useState(() => getItemsForRound(1));
  const [trayItems, setTrayItems] = useState(() => getItemsForRound(1));
  const [selectedItem, setSelectedItem] = useState(null);
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
  const roundEndTimerRef = useRef(null);

  // Auto-select first item in tray when round starts or item is placed
  useEffect(() => {
    if (trayItems.length > 0 && !selectedItem && !draggingItem) {
      setSelectedItem(trayItems[0]);
    }
  }, [trayItems, selectedItem, draggingItem]);

  // Round Timer
  useEffect(() => {
    if (phase !== 'PLAYING') return;
    const limit = ROUND_TIME_LIMITS[round - 1] || 15;
    setTimeLeft(limit);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 0.1;
        if (next <= 0) {
          clearInterval(timerRef.current);
          handleTimeExpired();
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

  // Place item at (x, y) coordinates
  const placeItem = useCallback((itemToPlace, targetX, targetY) => {
    if (!itemToPlace || phase !== 'PLAYING') return;

    const result = evaluatePlacement(itemToPlace, targetX, targetY);
    setLastPlacementResult({ ...result, name: itemToPlace.name });

    if (result.rating === 'PERFECT') {
      playInkStroke(true);
      confetti({
        particleCount: 20,
        spread: 45,
        origin: { x: targetX, y: targetY * 0.7 },
        colors: ['#10B981', '#34D399', '#FDE68A', '#F59E0B'],
      });
    } else if (result.rating === 'GREAT') {
      playInkStroke(true);
    } else if (result.rating === 'GOOD') {
      playManjira(0, 1.0);
    } else {
      playInkBlotSound();
    }

    const placed = {
      id: itemToPlace.id,
      icon: itemToPlace.icon,
      x: targetX,
      y: targetY,
      rating: result.rating,
    };

    setPlacedThisRound(prev => [...prev, placed]);
    setAllPlacedItems(prev => [...prev, placed]);
    setAllPlacements(prev => [...prev, result]);
    allPlacementsRef.current.push(result);
    setRoundScore(prev => prev + result.score);

    // Remove from tray and select next available
    const remaining = trayItems.filter(i => i.id !== itemToPlace.id);
    setTrayItems(remaining);
    setSelectedItem(remaining.length > 0 ? remaining[0] : null);

    setDraggingItem(null);
    setDragPosition(null);
    setHoveredZone(null);

    // Brief placement toast
    setTimeout(() => setLastPlacementResult(null), 1400);

    // If all items placed this round
    if (remaining.length === 0) {
      clearInterval(timerRef.current);
      triggerRoundEnd(round);
    }
  }, [phase, trayItems, round]);

  // Click on board to place selected item
  const handleBoardClick = useCallback((clickX, clickY) => {
    const active = draggingItem || selectedItem;
    if (!active || phase !== 'PLAYING') return;

    // Check if clicked near target zone - if so, auto-snap to target for rewarding feel!
    const dx = clickX - active.targetX;
    const dy = clickY - active.targetY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= active.zoneRadius * 1.5) {
      // Snap to perfect target!
      placeItem(active, active.targetX, active.targetY);
    } else {
      placeItem(active, clickX, clickY);
    }
  }, [draggingItem, selectedItem, phase, placeItem]);

  // Drag handlers
  const handleDragStart = (item) => {
    if (phase !== 'PLAYING') return;
    setSelectedItem(item);
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
    if (!pos || pos.y > 0.95 || pos.y < 0.02) {
      // Released outside board: keep item selected for click-to-place!
      setDraggingItem(null);
      setDragPosition(null);
      setHoveredZone(null);
      return;
    }

    placeItem(draggingItem, pos.x, pos.y);
  };

  // Handle round completion and progression
  const triggerRoundEnd = (currentRoundNum) => {
    setPhase('ROUND_RESULT');

    roundEndTimerRef.current = setTimeout(() => {
      if (currentRoundNum < TOTAL_ROUNDS) {
        const nextRound = currentRoundNum + 1;
        setRound(nextRound);
        const nextItems = getItemsForRound(nextRound);
        setCurrentItems(nextItems);
        setTrayItems(nextItems);
        setSelectedItem(nextItems[0] || null);
        setPlacedThisRound([]);
        setRoundScore(0);
        setPhase('PLAYING');
      } else {
        // All 3 rounds complete! Pandal Stage Complete!
        setPhase('COMPLETE');
        playFlowRestoredSound();

        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const stageResult = evaluatePandalStage(allPlacementsRef.current, elapsed);

        confetti({
          particleCount: 50,
          spread: 75,
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
        }, 1500);
      }
    }, 1500);
  };

  // Safety when timer expires
  const handleTimeExpired = () => {
    // Auto-place remaining items with safe default coordinates
    trayItems.forEach((item, idx) => {
      const placed = {
        id: item.id,
        icon: item.icon,
        x: item.targetX,
        y: item.targetY,
        rating: 'GOOD',
      };
      allPlacementsRef.current.push({
        accuracy: 70,
        rating: 'GOOD',
        score: Math.round(item.points * 0.7),
        maxPoints: item.points,
      });
      setAllPlacedItems(prev => [...prev, placed]);
    });
    setTrayItems([]);
    triggerRoundEnd(round);
  };

  const handleSkipToNextStage = () => {
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const stageResult = evaluatePandalStage(allPlacementsRef.current, elapsed);
    onStageComplete({
      stageId: 'pandal',
      score: stageResult.score,
      accuracy: stageResult.accuracy,
      details: stageResult,
    });
  };

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
            {phase === 'PLAYING'
              ? '✦ Select or drag an item, then tap its glowing target zone on the pandal'
              : phase === 'ROUND_RESULT'
              ? '✦ Round Complete! Sacred illumination spreads...'
              : '✦ The Pandal shines in divine radiance! ✦'}
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
              background: timeLeft <= 4 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.15)',
              border: `1px solid ${timeLeft <= 4 ? '#EF4444' : '#10B981'}`,
              borderRadius: '9999px',
              padding: '4px 14px',
              fontSize: '0.78rem',
              color: timeLeft <= 4 ? '#F87171' : '#34D399',
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
          selectedItem={selectedItem}
          dragPosition={dragPosition}
          hoveredZone={hoveredZone}
          allPlacedItems={allPlacedItems}
          isCompleted={phase === 'COMPLETE'}
          onBoardClick={handleBoardClick}
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

        {/* Stage Complete Banner */}
        {phase === 'COMPLETE' && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '14px',
            backdropFilter: 'blur(8px)',
          }}>
            <div style={{ fontSize: '48px' }}>🏛️</div>
            <h2 className="text-gold-gradient" style={{ fontFamily: 'var(--font-title)', fontSize: '1.8rem', margin: 0 }}>
              PANDAL COMPLETED!
            </h2>
            <p style={{ color: 'var(--parchment-surface)', fontSize: '0.9rem', margin: 0 }}>
              The sacred pandal is fully illuminated in Lord Ganesha's honor!
            </p>
            <button
              className="btn-festival-primary"
              style={{ padding: '12px 28px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={handleSkipToNextStage}
            >
              <span>CONTINUE TO NEXT GAME (MODAK)</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Item Tray */}
      {phase === 'PLAYING' && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(26, 4, 8, 0.95)',
          borderTop: '1.5px solid var(--gold-700)',
          display: 'flex',
          gap: '10px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          {trayItems.map(item => {
            const isSelected = selectedItem?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                onMouseDown={() => handleDragStart(item)}
                onTouchStart={() => handleDragStart(item)}
                role="button"
                tabIndex={0}
                style={{
                  background: isSelected
                    ? 'rgba(245, 158, 11, 0.35)'
                    : 'rgba(14, 48, 62, 0.7)',
                  border: isSelected
                    ? '2px solid #FBBF24'
                    : '1.5px solid rgba(212, 175, 55, 0.35)',
                  boxShadow: isSelected ? '0 0 16px rgba(245, 158, 11, 0.5)' : 'none',
                  borderRadius: '12px',
                  padding: '8px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  transform: isSelected ? 'scale(1.06)' : 'scale(1)',
                  transition: 'all 0.15s ease',
                  minWidth: '85px',
                  userSelect: 'none',
                }}
              >
                <span style={{ fontSize: '1.8rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>{item.icon}</span>
                <span style={{
                  fontSize: '0.68rem',
                  color: isSelected ? '#FDE68A' : 'var(--gold-300)',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}>
                  {item.name.split(' ').slice(0, 2).join(' ')}
                </span>
                {isSelected && (
                  <span style={{ fontSize: '0.6rem', color: '#34D399', fontWeight: 800 }}>
                    SELECTED ✓
                  </span>
                )}
              </div>
            );
          })}

          {trayItems.length === 0 && (
            <span style={{ fontSize: '0.85rem', color: '#34D399', fontWeight: 700 }}>
              ✓ All items placed for Round {round}!
            </span>
          )}
        </div>
      )}
    </div>
  );
}
