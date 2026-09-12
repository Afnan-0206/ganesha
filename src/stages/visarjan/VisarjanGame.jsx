import React, { useState, useRef } from 'react';
import CityMap from './CityMap';
import { PROCESSION_ROUTES, DYNAMIC_VIGHNAS } from './routes';
import { evaluateVisarjanRun } from './visarjanScoring';
import { playFlowRestoredSound, playManjira } from '../../audio/synthInstruments';
import confetti from 'canvas-confetti';

export default function VisarjanGame({ onStageComplete, festivalFlow }) {
  const [routes] = useState(PROCESSION_ROUTES);
  const [selectedRoute, setSelectedRoute] = useState(PROCESSION_ROUTES[1]); // Default Lake Promenade
  const [isMoving, setIsMoving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeVighna, setActiveVighna] = useState(null);
  const [adaptedDetour, setAdaptedDetour] = useState(false);
  const [feedback, setFeedback] = useState('Select the safest procession route to the Sacred Ghat');

  const [showImmersionCeremony, setShowImmersionCeremony] = useState(false);
  const startTimeRef = useRef(Date.now());

  const handleStartProcession = () => {
    setIsMoving(true);
    setFeedback('The Grand Procession moves through the city!');
    playManjira(0, 1.2);
    startTimeRef.current = Date.now();

    // Animate procession progress over 6 seconds
    let currentP = 0;
    const interval = setInterval(() => {
      currentP += 0.02;
      setProgress(Math.min(1.0, currentP));

      // Trigger dynamic Vighna midway (at 45% progress)
      if (currentP >= 0.45 && currentP < 0.48 && !activeVighna && !adaptedDetour) {
        setActiveVighna(DYNAMIC_VIGHNAS[0]);
      }

      if (currentP >= 1.0) {
        clearInterval(interval);
        handleArrival();
      }
    }, 100);
  };

  const handleAdaptRoute = (takeDetour) => {
    setActiveVighna(null);
    setAdaptedDetour(takeDetour);
    if (takeDetour) {
      setSelectedRoute(PROCESSION_ROUTES[0]); // Detour to alternative route
      setFeedback('Adapted smoothly! Detour taken avoiding rain.');
    } else {
      setFeedback('Held steady through the showers with joyous devotion!');
    }
  };

  const handleArrival = () => {
    playFlowRestoredSound();
    setShowImmersionCeremony(true);
    setFeedback('✦ SACRED IMMERSION: ECO-FRIENDLY CLAY MURTI RETURNS TO NATURE ✦');

    // Auspicious confetti burst
    confetti({
      particleCount: 55,
      spread: 80,
      origin: { x: 0.5, y: 0.5 },
      colors: ['#F59E0B', '#D4AF37', '#E11D48', '#38BDF8', '#FEF08A']
    });

    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const evaluation = evaluateVisarjanRun({
      selectedRoute,
      adaptedDetour,
      timeElapsedSeconds: elapsed
    });

    setTimeout(() => {
      onStageComplete({
        stageId: 'visarjan',
        score: evaluation.score,
        accuracy: evaluation.routeEfficiency,
        details: evaluation
      });
    }, 3200);
  };

  return (
    <div className="stage-workspace" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Top Route HUD */}
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
            VIGHNA V: THE FINAL JOURNEY
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
