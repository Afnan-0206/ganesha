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
  const [orders] = useState(INITIAL_ORDERS);
  const [currentOrderIndex, setCurrentOrderIndex] = useState(0);
  const [completedModaks, setCompletedModaks] = useState([]);
  const [perfectSteams, setPerfectSteams] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [steamToast, setSteamToast] = useState(null);

  const targetQuota = 5;
  const startTimeRef = useRef(Date.now());
  const currentOrder = orders[currentOrderIndex % orders.length];

  const handleModakComplete = (isPerfect, filling) => {
    const newStreak = isPerfect ? streak + 1 : 0;
    setStreak(newStreak);
    if (newStreak > highestStreak) setHighestStreak(newStreak);
    if (isPerfect) {
      setPerfectSteams(p => p + 1);
      setSteamToast({
        title: 'उत्कृष्ट प्रसाद! PERFECT STEAM!',
        sub: `${filling?.name || 'Classic'} Modak crafted with sacred devotion`,
        score: '+25 Pts'
      });

      confetti({
        particleCount: 20,
        spread: 45,
        origin: { x: 0.5, y: 0.4 },
        colors: ['#F59E0B', '#FBBF24', '#34D399', '#FFFBEB']
      });

      setTimeout(() => setSteamToast(null), 2400);
    } else {
      setSteamToast({
        title: 'मोदक सिद्धम्! MODAK COMPLETED',
        sub: 'Good effort, keep the steam gauge in the golden zone!',
        score: '+10 Pts'
      });
      setTimeout(() => setSteamToast(null), 2000);
    }

    const newModak = {
      id: Date.now(),
      filling: filling || { name: 'Classic', icon: '🥟' },
      isPerfect
    };

    setCompletedModaks(prev => {
      const updated = [...prev, newModak];
      if (updated.length >= targetQuota && !isFinished) {
        // Stage completed!
        setIsFinished(true);
        playFlowRestoredSound();

        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const evaluation = evaluateModakSession({
          completedModaks: updated.length,
          perfectSteams: isPerfect ? perfectSteams + 1 : perfectSteams,
          highestStreak: Math.max(highestStreak, newStreak),
          timeElapsedSeconds: elapsed,
          targetCount: targetQuota
        });

        setTimeout(() => {
          onStageComplete({
            stageId: 'modak',
            score: evaluation.score,
            accuracy: evaluation.steamAccuracy,
            details: evaluation
          });
        }, 1800);
      }
      return updated;
    });

    // Advance order rotation
    setCurrentOrderIndex(idx => idx + 1);
  };

  return (
    <div className="stage-workspace" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Top Order HUD */}
      <div style={{
        padding: '10px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--gold-800)',
        background: 'rgba(38, 5, 11, 0.75)'
      }}>
        <div>
          <span style={{ fontFamily: 'var(--font-title)', fontSize: '0.85rem', color: 'var(--marigold-300)' }}>
            VIGHNA III: THE PRASAD RUSH
          </span>
          <p style={{ fontSize: '0.72rem', color: 'var(--gold-400)', margin: 0 }}>
            Prepare {targetQuota} sacred modaks with correct sequence and timing
          </p>
        </div>

        {/* Banana Leaf Platter Mini Count */}
        <div style={{
          background: 'rgba(46, 125, 50, 0.25)',
          border: '1.5px solid #2E7D32',
          borderRadius: '10px',
          padding: '6px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '1.1rem' }}>🍃</span>
          <span style={{ fontSize: '0.8rem', color: '#86EFAC', fontWeight: 700 }}>
            TRAY: {completedModaks.length} / {targetQuota}
          </span>
        </div>
      </div>

      {/* Main Kitchen Workbench */}
      <div style={{ flex: 1, position: 'relative' }}>
        {steamToast && (
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.95), rgba(4, 47, 46, 0.98))',
            border: '2px solid #34D399',
            borderRadius: 'var(--radius-md)',
            padding: '10px 20px',
            textAlign: 'center',
            boxShadow: '0 8px 30px rgba(0,0,0,0.8), 0 0 20px rgba(52, 211, 153, 0.5)',
            animation: 'modalZoomIn 0.25s ease-out',
            zIndex: 40,
            whiteSpace: 'nowrap'
          }}>
            <div style={{
              fontFamily: 'var(--font-title)',
              fontSize: '1.1rem',
              color: '#86EFAC',
              fontWeight: 800
            }}>
              {steamToast.title}
            </div>
            <div style={{ fontSize: '0.76rem', color: '#D1FAE5', marginTop: '2px' }}>
              {steamToast.sub}
            </div>
            <div style={{
              display: 'inline-block',
              marginTop: '4px',
              background: 'rgba(52, 211, 153, 0.2)',
              border: '1px solid #34D399',
              borderRadius: '9999px',
              padding: '2px 8px',
              fontSize: '0.7rem',
              color: '#A7F3D0',
              fontWeight: 700
            }}>
              {steamToast.score}
            </div>
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
