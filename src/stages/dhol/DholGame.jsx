import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DHOL_ROUNDS, LANES, TIMING, SCROLL_SPEED, STRIKE_ZONE_Y, evaluateDholStage } from './rhythmEngine';
import { playDhol, playTasha, playManjira, playFlowRestoredSound, playInkBlotSound } from '../../audio/synthInstruments';
import confetti from 'canvas-confetti';

const TOTAL_ROUNDS = 5;

export default function DholGame({ onStageComplete, festivalFlow }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState('COUNTDOWN'); // 'COUNTDOWN' | 'PLAYING' | 'ROUND_RESULT' | 'COMPLETE'
  const [countdown, setCountdown] = useState(3);

  const [beats, setBeats] = useState([]);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [perfects, setPerfects] = useState(0);
  const [goods, setGoods] = useState(0);
  const [misses, setMisses] = useState(0);
  const [hitEffects, setHitEffects] = useState([]);
  const [laneFlash, setLaneFlash] = useState([false, false, false]);
  const [roundResults, setRoundResults] = useState([]);

  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);
  const roundStartRef = useRef(0);
  const beatsRef = useRef([]);
  const statsRef = useRef({ perfects: 0, goods: 0, misses: 0, maxCombo: 0 });
  const allResultsRef = useRef([]);
  const finishRoundRef = useRef(null);

  const currentRound = DHOL_ROUNDS[roundIndex];

  // ─── COUNTDOWN ───
  useEffect(() => {
    if (phase !== 'COUNTDOWN') return;
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          startRound();
          return 0;
        }
        return prev - 1;
      });
    }, 800);
    return () => clearInterval(interval);
  }, [phase, roundIndex]);

  // ─── START ROUND ───
  const startRound = useCallback(() => {
    const round = DHOL_ROUNDS[roundIndex];
    const newBeats = round.beats.map((b, idx) => ({
      id: `${roundIndex}-${idx}`,
      lane: b.lane,
      targetTime: b.time,
      y: 0,  // Will be calculated in render
      hit: false,
      missed: false,
      hitType: null, // 'PERFECT' | 'GOOD'
    }));
    statsRef.current = { perfects: 0, goods: 0, misses: 0, maxCombo: 0 };
    setBeats(newBeats);
    beatsRef.current = newBeats;
    setCombo(0);
    setMaxCombo(0);
    setPerfects(0);
    setGoods(0);
    setMisses(0);
    setHitEffects([]);
    roundStartRef.current = performance.now() / 1000;
    setPhase('PLAYING');
  }, [roundIndex]);

  // ─── KEY HANDLER ───
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (phase !== 'PLAYING') return;
      const laneIdx = LANES.findIndex(l => l.key === e.code);
      if (laneIdx === -1) return;
      e.preventDefault();
      handleLaneHit(laneIdx);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase]);

  // ─── LANE HIT ───
  const handleLaneHit = useCallback((laneIdx) => {
    if (phase !== 'PLAYING') return;
    const now = performance.now() / 1000 - roundStartRef.current;
    const lane = LANES[laneIdx];

    // Play sound
    if (lane.sound === 'dhol') playDhol(0, 1.0);
    else if (lane.sound === 'tasha') playTasha(0, 0.9);
    else if (lane.sound === 'manjira') playManjira(0, 1.2);

    // Flash lane
    setLaneFlash(prev => {
      const next = [...prev];
      next[laneIdx] = true;
      return next;
    });
    setTimeout(() => {
      setLaneFlash(prev => {
        const next = [...prev];
        next[laneIdx] = false;
        return next;
      });
    }, 120);

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
        setHitEffects(prev => [...prev.slice(-8), {
          lane: laneIdx, type: 'PERFECT', time: performance.now(),
        }]);
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
        setHitEffects(prev => [...prev.slice(-8), {
          lane: laneIdx, type: 'GOOD', time: performance.now(),
        }]);
      }

      setBeats([...beatsRef.current]);
    }
  }, [phase]);

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
    setRoundResults(prev => [...prev, result]);

    const totalBeats = stats.perfects + stats.goods + stats.misses;
    const accuracy = totalBeats > 0 ? Math.round(((stats.perfects + stats.goods) / totalBeats) * 100) : 0;

    if (accuracy >= 80) {
      confetti({
        particleCount: 20 + roundIndex * 5,
        spread: 50,
        origin: { x: 0.5, y: 0.6 },
        colors: ['#F59E0B', '#D4AF37', '#FEF08A', '#E11D48'],
      });
    }

    setTimeout(() => {
      if (roundIndex < TOTAL_ROUNDS - 1) {
        setRoundIndex(r => r + 1);
        setPhase('COUNTDOWN');
      } else {
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
        }, 1800);
      }
    }, 2000);
  }, [phase, roundIndex, onStageComplete]);

  finishRoundRef.current = finishRound;

  // ─── GAME LOOP (Canvas Rendering) ───
  useEffect(() => {
    if (phase !== 'PLAYING') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      const now = performance.now() / 1000 - roundStartRef.current;
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
      bg.addColorStop(0, '#1A0408');
      bg.addColorStop(1, '#0D0204');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Lane setup
      const laneWidth = w / 3;
      const strikeY = h * STRIKE_ZONE_Y;

      // Draw lanes
      LANES.forEach((lane, idx) => {
        const laneX = idx * laneWidth;

        // Lane background
        ctx.fillStyle = laneFlash[idx]
          ? `${lane.color}15`
          : 'rgba(255, 255, 255, 0.02)';
        ctx.fillRect(laneX, 0, laneWidth, h);

        // Lane dividers
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(laneX, 0);
        ctx.lineTo(laneX, h);
        ctx.stroke();

        // Lane label at bottom
        ctx.fillStyle = `${lane.color}80`;
        ctx.font = 'bold 12px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(lane.label, laneX + laneWidth / 2, h - 12);

        // Key hint
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.font = '10px Outfit, sans-serif';
        ctx.fillText(lane.key.replace('Key', ''), laneX + laneWidth / 2, h - 28);
      });

      // Strike zone line
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, strikeY);
      ctx.lineTo(w, strikeY);
      ctx.stroke();

      // Strike zone glow
      const strikeGrad = ctx.createLinearGradient(0, strikeY - 15, 0, strikeY + 15);
      strikeGrad.addColorStop(0, 'transparent');
      strikeGrad.addColorStop(0.5, 'rgba(212, 175, 55, 0.08)');
      strikeGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = strikeGrad;
      ctx.fillRect(0, strikeY - 15, w, 30);

      // Draw beats
      let allProcessed = true;
      beatsRef.current.forEach(beat => {
        if (beat.hit) return; // Already hit

        // Calculate Y position based on time
        const timeToStrike = beat.targetTime - now;
        const beatY = strikeY - timeToStrike * (h * SCROLL_SPEED * 3);

        // Check if missed
        if (timeToStrike < -TIMING.MISS_WINDOW && !beat.missed) {
          beat.missed = true;
          statsRef.current.misses++;
          setMisses(m => m + 1);
          setCombo(0);
          playInkBlotSound();
        }

        if (!beat.hit && !beat.missed) allProcessed = false;

        // Only draw if on screen
        if (beatY > -40 && beatY < h + 40 && !beat.missed) {
          const lane = LANES[beat.lane];
          const beatX = beat.lane * laneWidth + laneWidth / 2;
          const beatRadius = 18;

          // Beat note
          ctx.fillStyle = lane.color;
          ctx.shadowColor = lane.color;
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(beatX, beatY, beatRadius, 0, Math.PI * 2);
          ctx.fill();

          // Inner circle
          ctx.fillStyle = '#FFF';
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.arc(beatX, beatY, beatRadius * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Miss marker
        if (beat.missed && beatY < h + 40) {
          const beatX = beat.lane * laneWidth + laneWidth / 2;
          ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
          ctx.beginPath();
          ctx.arc(beatX, strikeY, 12, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Hit effects
      const nowMs = performance.now();
      hitEffects.forEach(eff => {
        const age = (nowMs - eff.time) / 1000;
        if (age > 0.6) return;

        const lane = LANES[eff.lane];
        const beatX = eff.lane * laneWidth + laneWidth / 2;
        const alpha = Math.max(0, 1 - age * 2);

        // Expanding ring
        ctx.strokeStyle = eff.type === 'PERFECT' ? '#FBBF24' : '#10B981';
        ctx.lineWidth = 3;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(beatX, strikeY, 18 + age * 60, 0, Math.PI * 2);
        ctx.stroke();

        // Text
        ctx.fillStyle = eff.type === 'PERFECT' ? '#FDE68A' : '#86EFAC';
        ctx.font = `bold ${14 + age * 8}px Outfit, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(eff.type, beatX, strikeY - 30 - age * 40);

        ctx.globalAlpha = 1;
      });

      // Combo display
      if (combo >= 3) {
        const pulse = Math.sin(nowMs / 200) * 0.1 + 1.0;
        ctx.fillStyle = '#FBBF24';
        ctx.font = `bold ${16 * pulse}px Outfit, sans-serif`;
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(245, 158, 11, 0.8)';
        ctx.shadowBlur = 12;
        ctx.fillText(`COMBO ×${combo}`, w / 2, 30);
        ctx.shadowBlur = 0;
      }

      ctx.restore();

      // Check if round is done
      const allDone = beatsRef.current.every(b => b.hit || b.missed);
      const lastBeatTime = Math.max(...currentRound.beats.map(b => b.time));
      if (allDone || now > lastBeatTime + 1.0) {
        if (finishRoundRef.current) finishRoundRef.current();
        return;
      }

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [phase, combo, hitEffects, laneFlash]);

  return (
    <div className="stage-workspace" style={{ display: 'flex', flexDirection: 'column' }}>
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
            VIGHNA IV: {currentRound.title}
          </span>
          <p style={{ fontSize: '0.72rem', color: 'var(--gold-400)', margin: 0 }}>
            {phase === 'COUNTDOWN' ? 'Get Ready...' :
             phase === 'PLAYING' ? 'Hit D / F / J when notes reach the strike line!' :
             phase === 'ROUND_RESULT' ? `Round ${roundIndex + 1} Complete!` :
             'The Grand Procession is Complete! ✦'}
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
          {phase === 'PLAYING' && (
            <div style={{
              display: 'flex', gap: '10px', fontSize: '0.72rem', fontWeight: 700,
            }}>
              <span style={{ color: '#FDE68A' }}>✦{perfects}</span>
              <span style={{ color: '#86EFAC' }}>●{goods}</span>
              <span style={{ color: '#F87171' }}>✕{misses}</span>
            </div>
          )}
        </div>

        {/* Player Tap Interaction Buttons */}
        <div style={{ display: 'flex', gap: '16px', width: '100%', maxWidth: '420px', justifyContent: 'center' }}>
          <button
            className="btn-festival-primary"
            style={{ flex: 1, padding: '14px 18px', fontSize: '1rem' }}
            onClick={() => handlePlayerTap('dhol')}
            disabled={phase !== 'RESPONSE'}
          >
            <span>🥁</span>
            <span>DHA (BASS)</span>
          </button>
          <button
            className="btn-festival-secondary"
            style={{ flex: 1, padding: '14px 18px', fontSize: '1rem', justifyContent: 'center' }}
            onClick={() => handlePlayerTap('tasha')}
            disabled={phase !== 'RESPONSE'}
          >
            <span>💥</span>
            <span>TAK (RIM)</span>
          </button>
        </div>

        {/* Celebratory Hit Toast / Popup */}
        {celebrationPopup && (
          <div style={{
            position: 'absolute',
            top: '20px',
            background: 'linear-gradient(135deg, rgba(120, 27, 43, 0.95), rgba(61, 10, 19, 0.98))',
            border: '2px solid var(--border-prominent)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 20px',
            textAlign: 'center',
            boxShadow: '0 8px 30px rgba(0,0,0,0.8), 0 0 20px rgba(245, 158, 11, 0.5)',
            animation: 'modalZoomIn 0.25s ease-out',
            zIndex: 30
          }}>
            <div style={{
              fontFamily: 'var(--font-title)',
              fontSize: '1.2rem',
              color: 'var(--marigold-300)',
              fontWeight: 800,
              letterSpacing: '0.5px'
            }}>
              {celebrationPopup.title}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--gold-300)', marginTop: '2px' }}>
              {celebrationPopup.sub}
            </div>
            <div style={{
              display: 'inline-block',
              marginTop: '4px',
              background: 'rgba(245, 158, 11, 0.2)',
              border: '1px solid var(--gold-400)',
              borderRadius: '9999px',
              padding: '2px 8px',
              fontSize: '0.7rem',
              color: '#FEF08A',
              fontWeight: 700
            }}>
              {celebrationPopup.bonus}
            </div>
          </div>
        )}

        <span style={{ fontSize: '0.72rem', color: 'var(--gold-400)', opacity: 0.8 }}>
          TAP BUTTONS OR PRESS SPACEBAR IN RHYTHM
        </span>
      </div>
    </div>
  );
}
