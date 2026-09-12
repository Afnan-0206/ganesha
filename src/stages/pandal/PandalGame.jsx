import React, { useState, useRef } from 'react';
import PandalBoard from './PandalBoard';
import { PANDAL_NODES, PANDAL_VIGHNAS } from './components';
import { evaluatePandalCircuit } from './pandalScoring';
import { playFlowRestoredSound, playManjira } from '../../audio/synthInstruments';

export default function PandalGame({ onStageComplete, festivalFlow }) {
  const [nodes] = useState(PANDAL_NODES);
  const [vighna] = useState(PANDAL_VIGHNAS[0]); // Limited Power 75W
  const [connectedNodeIds, setConnectedNodeIds] = useState(['lights']); // Default lights
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('Connect circuits to illuminate the Pandal within generator limits');
  const [evaluation, setEvaluation] = useState(null);

  const startTimeRef = useRef(Date.now());

  const handleToggleNode = (id) => {
    if (isCompleted) return;
    playManjira(0, 1.2);
    setConnectedNodeIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      // Live evaluation preview
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const res = evaluatePandalCircuit({
        connectedNodeIds: next,
        nodes,
        vighna,
        timeElapsedSeconds: elapsed
      });
      setEvaluation(res);
      return next;
    });
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
