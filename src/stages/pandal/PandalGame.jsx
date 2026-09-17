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

  const handleEnergizePandal = () => {
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const result = evaluatePandalCircuit({
      connectedNodeIds,
      nodes,
      vighna,
      timeElapsedSeconds: elapsed
    });
    setEvaluation(result);

    if (result.isSatisfied) {
      playFlowRestoredSound();
      setIsCompleted(true);
      setFeedbackMsg('✦ PANDAL READY! THE ILLUMINATION SHINES ACROSS THE MANDAP ✦');

      setTimeout(() => {
        onStageComplete({
          stageId: 'pandal',
          score: result.score,
          accuracy: result.efficiency,
          details: result
        });
      }, 1900);
    } else if (result.isOverloaded) {
      setFeedbackMsg(`POWER BALANCE NEEDS WORK: Used ${result.totalPowerUsed}W / ${result.maxCapacity}W max.`);
    } else {
      setFeedbackMsg('CIRCUIT INCOMPLETE: Make sure essential lights and altar diyas are powered.');
    }
  };

  const totalUsed = connectedNodeIds
    .map(id => nodes.find(n => n.id === id)?.powerCost || 0)
    .reduce((a, b) => a + b, 0);

  const maxCap = vighna.maxCapacity;
  const isOverload = totalUsed > maxCap;

  return (
    <div className="stage-workspace" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Top Controls & Constraints Bar */}
      <div style={{
        padding: '10px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--gold-800)',
        background: 'rgba(38, 5, 11, 0.7)'
      }}>
        <div>
          <span style={{ fontFamily: 'var(--font-title)', fontSize: '0.85rem', color: 'var(--marigold-300)' }}>
            VIGHNA II: {vighna.name}
          </span>
          <p style={{ fontSize: '0.72rem', color: 'var(--gold-400)', margin: 0 }}>
            {feedbackMsg}
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
