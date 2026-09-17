import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DHOL_ROUNDS, LANES, TIMING, SCROLL_SPEED, STRIKE_ZONE_Y, evaluateDholStage } from './rhythmEngine';
import { playDhol, playTasha, playManjira, playFlowRestoredSound, playInkBlotSound, playInkStroke } from '../../audio/synthInstruments';
import confetti from 'canvas-confetti';
import { ArrowRight, Music2 } from 'lucide-react';

const TOTAL_ROUNDS = 5;

export default function DholGame({ onStageComplete, festivalFlow }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState('COUNTDOWN'); // 'COUNTDOWN' | 'PLAYING' | 'ROUND_RESULT' | 'COMPLETE'
  const [countdown, setCountdown] = useState(3);

  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [perfects, setPerfects] = useState(0);
  const [goods, setGoods] = useState(0);
  const [misses, setMisses] = useState(0);

  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);
  const roundStartRef = useRef(0);
  const beatsRef = useRef([]);
  const statsRef = useRef({ perfects: 0, goods: 0, misses: 0, maxCombo: 0 });
  const allResultsRef = useRef([]);
  const finishRoundRef = useRef(null);

  const hitEffectsRef = useRef([]);
  const laneFlashRef = useRef([false, false, false]);
  const currentRound = DHOL_ROUNDS[roundIndex] || DHOL_ROUNDS[0];

  // ─── START ROUND ───
  const startRound = useCallback(() => {
    const round = DHOL_ROUNDS[roundIndex] || DHOL_ROUNDS[0];
    const newBeats = round.beats.map((b, idx) => ({
      id: `${roundIndex}-${idx}`,
      lane: b.lane,
      targetTime: b.time,
      y: 0,
      hit: false,
      missed: false,
      hitType: null,
    }));
    statsRef.current = { perfects: 0, goods: 0, misses: 0, maxCombo: 0 };
    beatsRef.current = newBeats;
    setCombo(0);
    setMaxCombo(0);
    setPerfects(0);
    setGoods(0);
    setMisses(0);
    hitEffectsRef.current = [];
    roundStartRef.current = performance.now() / 1000;
    setPhase('PLAYING');
  }, [roundIndex]);

  // ─── COUNTDOWN ───
  useEffect(() => {
    if (phase !== 'COUNTDOWN') return;
    setCountdown(3);
    roundStartRef.current = 0; // Prevent early time calculations!

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          startRound();
          return 0;
        }
        return prev - 1;
      });
    }, 700);

    return () => clearInterval(interval);
  }, [phase, roundIndex, startRound]);

  // ─── LANE HIT ───
  const handleLaneHit = useCallback((laneIdx) => {
    if (phase !== 'PLAYING' || roundStartRef.current === 0) return;
    const now = performance.now() / 1000 - roundStartRef.current;
    const lane = LANES[laneIdx];

    // Audio playback
    if (lane.sound === 'dhol') playDhol(0, 1.0);
    else if (lane.sound === 'tasha') playTasha(0, 0.9);
    else if (lane.sound === 'manjira') playManjira(0, 1.2);

    // Visual Flash
    laneFlashRef.current[laneIdx] = true;
    setTimeout(() => {
      laneFlashRef.current[laneIdx] = false;
    }, 140);

    // Find closest unhit beat in this lane
    let closestBeat = null;
    let closestDelta = Infinity;

    beatsRef.current.forEach(beat => {
      if (beat.hit || beat.missed || beat.lane !== laneIdx) return;
      const delta = Math.abs(now - beat.targetTime);
      if (delta < closestDelta && delta < TIMING.MISS_WINDOW) {
        closestDelta = delta;
        closestBeat = beat;
      }
    });

    if (closestBeat) {
      closestBeat.hit = true;

      if (closestDelta <= TIMING.PERFECT) {
        closestBeat.hitType = 'PERFECT';
        statsRef.current.perfects++;
        setPerfects(p => p + 1);
        setCombo(c => {
          const nc = c + 1;
          statsRef.current.maxCombo = Math.max(statsRef.current.maxCombo, nc);
          setMaxCombo(m => Math.max(m, nc));
          return nc;
        });
        hitEffectsRef.current.push({
          lane: laneIdx,
          type: 'PERFECT',
          time: performance.now(),
        });
      } else if (closestDelta <= TIMING.GOOD) {
        closestBeat.hitType = 'GOOD';
        statsRef.current.goods++;
        setGoods(g => g + 1);
        setCombo(c => {
          const nc = c + 1;
          statsRef.current.maxCombo = Math.max(statsRef.current.maxCombo, nc);
          setMaxCombo(m => Math.max(m, nc));
          return nc;
        });
        hitEffectsRef.current.push({
          lane: laneIdx,
          type: 'GOOD',
          time: performance.now(),
        });
      }
    }
  }, [phase]);

  // Keyboard Handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (phase !== 'PLAYING') return;
      const laneIdx = LANES.findIndex(l => l.key === e.code);
      if (laneIdx !== -1) {
        e.preventDefault();
        handleLaneHit(laneIdx);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, handleLaneHit]);

  // ─── FINISH ROUND ───
  const finishRound = useCallback(() => {
    if (phase !== 'PLAYING') return;
    setPhase('ROUND_RESULT');

    const stats = statsRef.current;
    const result = {
      perfects: stats.perfects,
      goods: stats.goods,
      misses: stats.misses,
      maxCombo: stats.maxCombo,
      round: roundIndex + 1,
    };
    allResultsRef.current.push(result);

    const totalBeats = stats.perfects + stats.goods + stats.misses;
    const accuracy = totalBeats > 0 ? Math.round(((stats.perfects + stats.goods) / totalBeats) * 100) : 0;

    if (accuracy >= 70) {
      confetti({
        particleCount: 25 + roundIndex * 8,
        spread: 55,
        origin: { x: 0.5, y: 0.6 },
        colors: ['#F59E0B', '#D4AF37', '#FEF08A', '#E11D48'],
      });
    }

    setTimeout(() => {
      if (roundIndex < TOTAL_ROUNDS - 1) {
        setRoundIndex(r => r + 1);
        setPhase('COUNTDOWN');
      } else {
        // Stage complete!
        setPhase('COMPLETE');
        playFlowRestoredSound();
        const stageResult = evaluateDholStage(allResultsRef.current);

        setTimeout(() => {
          onStageComplete({
            stageId: 'dhol',
            score: stageResult.score,
            accuracy: stageResult.accuracy,
            details: stageResult,
          });
        }, 1500);
      }
    }, 1600);
  }, [phase, roundIndex, onStageComplete]);

  finishRoundRef.current = finishRound;

  // ─── STABLE GAME LOOP (Continuous Canvas Rendering) ───
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      timeRef.current += 0.016;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const dpr = window.devicePixelRatio || 1;

      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Background
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#160408');
      bg.addColorStop(0.7, '#0D0205');
      bg.addColorStop(1, '#050002');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // 3 Lanes Setup
      const laneWidth = w / 3;
      const strikeY = h * STRIKE_ZONE_Y;

      // Draw Lanes
      LANES.forEach((lane, idx) => {
        const laneX = idx * laneWidth;
        const isFlashed = laneFlashRef.current[idx];

        // Lane background
        ctx.fillStyle = isFlashed ? `${lane.color}25` : 'rgba(255, 255, 255, 0.02)';
        ctx.fillRect(laneX, 0, laneWidth, h);

        // Lane border dividers
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(laneX, 0);
        ctx.lineTo(laneX, h);
        ctx.stroke();

        // Lane label & key hint at bottom
        ctx.fillStyle = `${lane.color}CC`;
        ctx.font = 'bold 13px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(lane.label, laneX + laneWidth / 2, h - 22);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = '10px Outfit, sans-serif';
        ctx.fillText(`[${lane.key.replace('Key', '')}]`, laneX + laneWidth / 2, h - 8);
      });

      // Strike line
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.8)';
      ctx.lineWidth = 3;
      ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(0, strikeY);
      ctx.lineTo(w, strikeY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw active notes if in PLAYING phase
      if (phase === 'PLAYING' && roundStartRef.current > 0) {
        const now = performance.now() / 1000 - roundStartRef.current;

        beatsRef.current.forEach(beat => {
          if (beat.hit) return;

          const timeToStrike = beat.targetTime - now;
          const beatY = strikeY - timeToStrike * (h * SCROLL_SPEED * 2.8);

          // Check miss condition
          if (timeToStrike < -TIMING.MISS_WINDOW && !beat.missed) {
            beat.missed = true;
            statsRef.current.misses++;
            setMisses(m => m + 1);
            setCombo(0);
            playInkBlotSound();
          }

          // Draw note circle
          if (beatY > -30 && beatY < h + 30 && !beat.missed) {
            const lane = LANES[beat.lane];
            const beatX = beat.lane * laneWidth + laneWidth / 2;
            const radius = 20;

            ctx.shadowColor = lane.color;
            ctx.shadowBlur = 14;
            ctx.fillStyle = lane.color;
            ctx.beginPath();
            ctx.arc(beatX, beatY, radius, 0, Math.PI * 2);
            ctx.fill();

            // Inner white dot
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.arc(beatX, beatY, radius * 0.45, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // Check if all beats processed
        const allDone = beatsRef.current.length > 0 && beatsRef.current.every(b => b.hit || b.missed);
        const lastBeatTime = Math.max(...(currentRound.beats?.map(b => b.time) || [6]));
        if (allDone || now > lastBeatTime + 1.2) {
          if (finishRoundRef.current) finishRoundRef.current();
        }
      }

      // Hit Effects (Expanding rings & rating text)
      const nowMs = performance.now();
      hitEffectsRef.current = hitEffectsRef.current.filter(eff => (nowMs - eff.time) < 600);

      hitEffectsRef.current.forEach(eff => {
        const age = (nowMs - eff.time) / 1000;
        const alpha = Math.max(0, 1 - age * 1.8);
        const beatX = eff.lane * laneWidth + laneWidth / 2;

        ctx.strokeStyle = eff.type === 'PERFECT' ? '#FBBF24' : '#10B981';
        ctx.lineWidth = 3;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(beatX, strikeY, 20 + age * 50, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = eff.type === 'PERFECT' ? '#FDE68A' : '#86EFAC';
        ctx.font = 'bold 15px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(eff.type, beatX, strikeY - 32 - age * 30);
        ctx.globalAlpha = 1;
      });

      ctx.restore();
      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [phase, currentRound]);

  const handleSkipToNextStage = () => {
    const stageResult = evaluateDholStage(allResultsRef.current);
    onStageComplete({
      stageId: 'dhol',
      score: stageResult.score,
      accuracy: stageResult.accuracy,
      details: stageResult,
    });
  };

  return (
    <div className="stage-workspace" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <div style={{
        padding: '10px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--gold-800)',
        background: 'rgba(38, 5, 11, 0.85)',
      }}>
        <div>
          <span style={{ fontFamily: 'var(--font-title)', fontSize: '0.85rem', color: 'var(--marigold-300)' }}>
            VIGHNA IV: {currentRound.title || 'DHOL TALAM'}
          </span>
          <p style={{ fontSize: '0.72rem', color: 'var(--gold-400)', margin: 0 }}>
            {phase === 'COUNTDOWN' ? '✦ Listen to the rhythm... Get ready!' :
             phase === 'PLAYING' ? '✦ Tap D / F / J or on-screen drums as beats cross the golden strike line' :
             phase === 'ROUND_RESULT' ? `✦ Round ${roundIndex + 1} Complete!` :
             '✦ The Grand Procession Resounds in Glory! ✦'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{
            background: 'rgba(212, 175, 55, 0.15)',
            border: '1px solid var(--gold-500)',
            borderRadius: '9999px',
            padding: '4px 14px',
            fontSize: '0.78rem',
            color: 'var(--gold-300)',
            fontWeight: 700,
          }}>
            ROUND {roundIndex + 1} / {TOTAL_ROUNDS}
          </div>

          <div style={{ display: 'flex', gap: '10px', fontSize: '0.75rem', fontWeight: 700 }}>
            <span style={{ color: '#FDE68A' }}>✦ {perfects}</span>
            <span style={{ color: '#86EFAC' }}>● {goods}</span>
            <span style={{ color: '#F87171' }}>✕ {misses}</span>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div style={{ flex: 1, position: 'relative' }}>
        {/* Countdown Overlay */}
        {phase === 'COUNTDOWN' && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 30,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
          }}>
            <div style={{
              fontFamily: 'var(--font-title)',
              fontSize: '4.5rem',
              color: '#FBBF24',
              fontWeight: 900,
              textShadow: '0 0 40px rgba(245, 158, 11, 0.8)',
              animation: 'modalZoomIn 0.3s ease-out',
            }}>
              {countdown}
            </div>
          </div>
        )}

        {/* Round Result Overlay */}
        {phase === 'ROUND_RESULT' && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 30,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
          }}>
            <div style={{
              background: 'rgba(38, 5, 11, 0.95)',
              border: '2px solid var(--gold-500)',
              borderRadius: '20px',
              padding: '24px 36px',
              textAlign: 'center',
              animation: 'modalZoomIn 0.3s ease-out',
              minWidth: '280px',
            }}>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: '1.3rem', color: 'var(--marigold-300)', fontWeight: 800, marginBottom: '12px' }}>
                Round {roundIndex + 1} Complete!
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
                <div>
                  <div style={{ color: '#FDE68A', fontSize: '1.5rem', fontWeight: 800 }}>{perfects}</div>
                  <div style={{ color: 'var(--gold-400)', fontSize: '0.68rem' }}>PERFECT</div>
                </div>
                <div>
                  <div style={{ color: '#86EFAC', fontSize: '1.5rem', fontWeight: 800 }}>{goods}</div>
                  <div style={{ color: 'var(--gold-400)', fontSize: '0.68rem' }}>GOOD</div>
                </div>
                <div>
                  <div style={{ color: '#F87171', fontSize: '1.5rem', fontWeight: 800 }}>{misses}</div>
                  <div style={{ color: 'var(--gold-400)', fontSize: '0.68rem' }}>MISS</div>
                </div>
              </div>
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
            <div style={{ fontSize: '48px' }}>🥁</div>
            <h2 className="text-gold-gradient" style={{ fontFamily: 'var(--font-title)', fontSize: '1.8rem', margin: 0 }}>
              DHOL TALAM OVERCOME!
            </h2>
            <p style={{ color: 'var(--parchment-surface)', fontSize: '0.9rem', margin: 0 }}>
              The divine rhythms echoed through every street in celebration!
            </p>
            <button
              className="btn-festival-primary"
              style={{ padding: '12px 28px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={handleSkipToNextStage}
            >
              <span>CONTINUE TO NEXT GAME (VISARJAN)</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />

        {/* Large Interactive Touch & Click Drum Pads */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          height: '75px',
          zIndex: 10,
          background: 'rgba(10, 2, 4, 0.85)',
          borderTop: '2px solid rgba(212, 175, 55, 0.3)',
        }}>
          {LANES.map((lane, idx) => (
            <button
              key={lane.id}
              onPointerDown={(e) => {
                e.preventDefault();
                handleLaneHit(idx);
              }}
              style={{
                flex: 1,
                background: 'rgba(0, 0, 0, 0.4)',
                border: 'none',
                borderRight: idx < 2 ? '1px solid rgba(212, 175, 55, 0.2)' : 'none',
                color: lane.color,
                fontSize: '0.95rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                outline: 'none',
                fontFamily: 'var(--font-title)',
                letterSpacing: '1px',
                userSelect: 'none',
                touchAction: 'none',
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>
                {idx === 0 ? '🥁' : idx === 1 ? '🪘' : '🔔'}
              </span>
              <span>{lane.label} [{lane.key.replace('Key', '')}]</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
