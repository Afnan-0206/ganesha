import React, { useState, useEffect } from 'react';
import { FILLING_TYPES } from './orders';
import { playInkStroke, playManjira } from '../../audio/synthInstruments';

export default function Kitchen({
  currentOrder,
  onModakComplete,
  streak
}) {
  const [step, setStep] = useState('DOUGH'); // 'DOUGH' | 'FILLING' | 'SHAPE' | 'STEAM' | 'PACK'
  const [selectedFilling, setSelectedFilling] = useState(null);
  const [steamProgress, setSteamProgress] = useState(0);
  const [steamDirection, setSteamDirection] = useState(1);
  const [feedback, setFeedback] = useState('Step 1: Roll the steamed rice flour dough');

  // Steaming Bar Oscillating Animation
  useEffect(() => {
    let anim;
    if (step === 'STEAM') {
      anim = setInterval(() => {
        setSteamProgress(prev => {
          let next = prev + steamDirection * 2.5;
          if (next >= 100) {
            setSteamDirection(-1);
            next = 100;
          } else if (next <= 0) {
            setSteamDirection(1);
            next = 0;
          }
          return next;
        });
      }, 25);
    }
    return () => clearInterval(anim);
  }, [step, steamDirection]);

  // Step 1: Roll Dough
  const handleRollDough = () => {
    playInkStroke(false);
    setStep('FILLING');
    setFeedback(`Step 2: Add filling matching order (${currentOrder?.desc || 'Coconut & Jaggery'})`);
  };

  // Step 2: Add Filling
  const handleSelectFilling = (filling) => {
    playManjira(0, 1.1);
    setSelectedFilling(filling);
    setStep('SHAPE');
    setFeedback('Step 3: Pleat the dough and pinch the sacred apex');
  };

  // Step 3: Shape Modak
  const handleShapeModak = () => {
    playInkStroke(true);
    setStep('STEAM');
    setSteamProgress(10);
    setFeedback('Step 4: Steam to perfection! Lift lid when the gauge hits the gold zone.');
  };

  // Step 4: Steam Timing Check
  const handleLiftLid = () => {
    // Perfect zone between 40% and 68%
    const isPerfect = steamProgress >= 40 && steamProgress <= 68;
    playManjira(0, isPerfect ? 1.5 : 1.0);

    setStep('PACK');
    setFeedback(isPerfect ? '✦ PERFECT STEAM! Golden & tender.' : 'Good steam! Ready to plate.');

    setTimeout(() => {
      onModakComplete(isPerfect, selectedFilling);
      // Reset for next modak
      setStep('DOUGH');
      setSelectedFilling(null);
      setFeedback('Roll the next dough portion!');
    }, 600);
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      gap: '16px'
    }}>
      {/* Current Step Instruction Banner */}
      <div style={{
        background: 'rgba(38, 5, 11, 0.85)',
        border: '1.5px solid var(--gold-500)',
        borderRadius: '12px',
        padding: '8px 18px',
        textAlign: 'center',
        maxWidth: '520px',
        width: '100%'
      }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--marigold-300)', fontWeight: 700 }}>
          {feedback}
        </span>
        {streak > 1 && (
          <div style={{ color: '#34D399', fontSize: '0.75rem', fontWeight: 800, marginTop: '2px' }}>
            ✦ PRASAD STREAK ×{streak} ✦
          </div>
        )}
      </div>

      {/* Interactive Workbench Stage */}
      <div style={{
        width: '100%',
        maxWidth: '520px',
        minHeight: '220px',
        background: 'rgba(26, 4, 8, 0.75)',
        border: '1.5px solid var(--gold-700)',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        gap: '14px'
      }}>
        {/* STEP 1: DOUGH */}
        {step === 'DOUGH' && (
          <button
            className="btn-festival-primary"
            onClick={handleRollDough}
            style={{ width: '220px' }}
          >
            <span>🥟</span>
            <span>ROLL RICE DOUGH</span>
          </button>
        )}

        {/* STEP 2: FILLINGS */}
        {step === 'FILLING' && (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {FILLING_TYPES.map(f => (
              <button
                key={f.id}
                className="btn-festival-secondary"
                onClick={() => handleSelectFilling(f)}
                style={{ padding: '10px 16px', borderColor: f.color }}
              >
                <span>{f.icon}</span>
                <span>{f.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* STEP 3: SHAPE */}
        {step === 'SHAPE' && (
          <button
            className="btn-festival-primary"
            onClick={handleShapeModak}
            style={{ width: '240px' }}
          >
            <span>✨</span>
            <span>PLEAT & PINCH APEX</span>
          </button>
        )}

        {/* STEP 4: STEAMING BAR */}
        {step === 'STEAM' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--gold-400)', letterSpacing: '1px' }}>
              STEAMING GAUGE: LIFT IN GOLDEN ZONE
            </span>
            <div style={{
              width: '100%',
              height: '24px',
              background: 'rgba(0,0,0,0.6)',
              border: '1.5px solid var(--gold-600)',
              borderRadius: '9999px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Perfect Zone (40% to 68%) */}
              <div style={{
                position: 'absolute',
                left: '40%',
                width: '28%',
                height: '100%',
                background: 'rgba(245, 158, 11, 0.45)',
                borderLeft: '2px solid #FDE68A',
                borderRight: '2px solid #FDE68A'
              }} />
              {/* Indicator Needle */}
              <div style={{
                position: 'absolute',
                left: `${steamProgress}%`,
                top: 0,
                bottom: 0,
                width: '4px',
                background: '#FFF',
                boxShadow: '0 0 8px #FFF'
              }} />
            </div>

            <button className="btn-festival-primary" onClick={handleLiftLid}>
              <span>♨️</span>
              <span>LIFT STEAMER LID</span>
            </button>
          </div>
        )}

        {/* STEP 5: PACK TO TRAY */}
        {step === 'PACK' && (
          <div style={{ fontSize: '1.2rem', color: '#34D399', fontWeight: 800 }}>
            Plating onto sacred banana leaf...
          </div>
        )}
      </div>
    </div>
  );
}
