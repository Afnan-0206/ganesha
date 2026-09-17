import React, { useRef, useEffect, useCallback } from 'react';

export default function RangoliCanvas({
  roundData,
  phase,        // 'PREVIEW' | 'PLAY' | 'RESULT'
  playerConnections,
  selectedDot,
  previewProgress,  // 0 to 1 (how much of preview has elapsed)
  correctSet,       // Set of normalized connection keys that are correct
  wrongSet,         // Set of normalized connection keys that are wrong
  lastHitType,      // 'correct' | 'wrong' | null
  comboCount,
  onDotClick,
}) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);
  const timeRef = useRef(0);

  const getDotPosition = useCallback((dot, width, height) => {
    const gridSize = roundData.gridSize;
    const padding = 0.12;
    const areaSize = Math.min(width, height) * (1 - padding * 2);
    const cellSize = areaSize / (gridSize - 1);
    const offsetX = (width - areaSize) / 2;
    const offsetY = (height - areaSize) / 2;
    return {
      x: offsetX + dot.col * cellSize,
      y: offsetY + dot.row * cellSize,
    };
  }, [roundData]);

  // Spawn particles on correct hit
  useEffect(() => {
    if (lastHitType === 'correct' && playerConnections.length > 0) {
      const last = playerConnections[playerConnections.length - 1];
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dot1 = roundData.dots.find(d => d.id === last[0]);
      const dot2 = roundData.dots.find(d => d.id === last[1]);
      if (!dot1 || !dot2) return;
      const p1 = getDotPosition(dot1, canvas.clientWidth, canvas.clientHeight);
      const p2 = getDotPosition(dot2, canvas.clientWidth, canvas.clientHeight);
      const mx = (p1.x + p2.x) / 2;
      const my = (p1.y + p2.y) / 2;

      for (let i = 0; i < 8; i++) {
        particlesRef.current.push({
          x: mx, y: my,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          life: 1.0,
          size: 2 + Math.random() * 3,
          color: `hsl(${40 + Math.random() * 20}, 100%, ${60 + Math.random() * 30}%)`,
        });
      }
    }
  }, [lastHitType, playerConnections, roundData, getDotPosition]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      timeRef.current += 0.016;
      const t = timeRef.current;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const dpr = window.devicePixelRatio || 1;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Background
      drawBackground(ctx, width, height, t);

      // Grid dots (subtle guide)
      drawGridGuide(ctx, width, height, roundData.gridSize);

      // Pattern dots
      const dotPositions = {};
      roundData.dots.forEach(dot => {
        const pos = getDotPosition(dot, width, height);
        dotPositions[dot.id] = pos;
      });

      // Draw connections based on phase
      if (phase === 'PREVIEW') {
        drawPreviewPattern(ctx, roundData, dotPositions, previewProgress, t);
      } else if (phase === 'PLAY' || phase === 'RESULT') {
        drawPlayerConnections(ctx, playerConnections, dotPositions, correctSet, wrongSet);
      }

      if (phase === 'RESULT') {
        // Show target pattern faintly
        drawTargetGhost(ctx, roundData, dotPositions);
      }

      // Draw dots
      roundData.dots.forEach(dot => {
        const pos = dotPositions[dot.id];
        const isSelected = selectedDot === dot.id;
        const isInteractive = phase === 'PLAY';
        drawDot(ctx, pos, dot, isSelected, isInteractive, t, phase);
      });

      // Particles
      updateAndDrawParticles(ctx);

      ctx.restore();
      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [roundData, phase, playerConnections, selectedDot, previewProgress, correctSet, wrongSet, getDotPosition]);

  const handleClick = (e) => {
    if (phase !== 'PLAY' || !onDotClick) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const hitRadius = 28;

    for (const dot of roundData.dots) {
      const pos = getDotPosition(dot, canvas.clientWidth, canvas.clientHeight);
      const dist = Math.hypot(x - pos.x, y - pos.y);
      if (dist <= hitRadius) {
        onDotClick(dot.id);
        return;
      }
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', touchAction: 'none' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block', cursor: phase === 'PLAY' ? 'pointer' : 'default' }}
        onClick={handleClick}
      />
    </div>
  );
}

// ─── Drawing Functions ───

function drawBackground(ctx, w, h, t) {
  const grad = ctx.createRadialGradient(w * 0.5, h * 0.5, 40, w * 0.5, h * 0.5, Math.max(w, h) * 0.7);
  grad.addColorStop(0, '#420D15');
  grad.addColorStop(0.6, '#2D080E');
  grad.addColorStop(1, '#1A0408');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Subtle mandala circles
  ctx.save();
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.04)';
  ctx.lineWidth = 1;
  const cx = w / 2, cy = h / 2;
  for (let r = 50; r < Math.max(w, h); r += 60) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Rotating subtle lines
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.03)';
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a + t * 0.05) * Math.max(w, h), cy + Math.sin(a + t * 0.05) * Math.max(w, h));
    ctx.stroke();
  }
  ctx.restore();
}

function drawGridGuide(ctx, w, h, gridSize) {
  const padding = 0.12;
  const areaSize = Math.min(w, h) * (1 - padding * 2);
  const cellSize = areaSize / (gridSize - 1);
  const offsetX = (w - areaSize) / 2;
  const offsetY = (h - areaSize) / 2;

  ctx.save();
  ctx.fillStyle = 'rgba(212, 175, 55, 0.06)';
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      ctx.beginPath();
      ctx.arc(offsetX + c * cellSize, offsetY + r * cellSize, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawPreviewPattern(ctx, roundData, dotPositions, progress, t) {
  ctx.save();

  const connections = roundData.connections;
  const totalConns = connections.length;
  const visibleCount = Math.floor(progress * totalConns * 1.5); // Draw faster than time

  // Draw connections with golden glow trail animation
  for (let i = 0; i < Math.min(totalConns, visibleCount); i++) {
    const [id1, id2] = connections[i];
    const p1 = dotPositions[id1];
    const p2 = dotPositions[id2];
    if (!p1 || !p2) continue;

    // Glow layer
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
    ctx.lineWidth = 6;
    ctx.shadowColor = 'rgba(251, 191, 36, 0.8)';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();

    // Core line
    ctx.strokeStyle = '#FFFDF5';
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }

  // Fading pulse effect on the last revealed connection
  if (visibleCount > 0 && visibleCount <= totalConns) {
    const lastIdx = Math.min(totalConns - 1, visibleCount - 1);
    const [id1, id2] = connections[lastIdx];
    const p1 = dotPositions[id1];
    const p2 = dotPositions[id2];
    if (p1 && p2) {
      const mx = (p1.x + p2.x) / 2;
      const my = (p1.y + p2.y) / 2;
      const pulse = Math.sin(t * 6) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(254, 240, 138, ${pulse * 0.6})`;
      ctx.beginPath();
      ctx.arc(mx, my, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

function drawPlayerConnections(ctx, connections, dotPositions, correctSet, wrongSet) {
  ctx.save();

  connections.forEach(([id1, id2]) => {
    const p1 = dotPositions[id1];
    const p2 = dotPositions[id2];
    if (!p1 || !p2) return;

    const key = `${Math.min(id1, id2)}-${Math.max(id1, id2)}`;
    const isCorrect = correctSet && correctSet.has(key);
    const isWrong = wrongSet && wrongSet.has(key);

    if (isCorrect) {
      ctx.strokeStyle = '#10B981';
      ctx.shadowColor = 'rgba(16, 185, 129, 0.8)';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 3.5;
    } else if (isWrong) {
      ctx.strokeStyle = '#EF4444';
      ctx.shadowColor = 'rgba(239, 68, 68, 0.6)';
      ctx.shadowBlur = 8;
      ctx.lineWidth = 2.5;
    } else {
      ctx.strokeStyle = '#FBBF24';
      ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
      ctx.shadowBlur = 6;
      ctx.lineWidth = 3;
    }

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.shadowBlur = 0;
  });

  ctx.restore();
}

function drawTargetGhost(ctx, roundData, dotPositions) {
  ctx.save();
  ctx.setLineDash([6, 4]);
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.2)';
  ctx.lineWidth = 1.5;

  roundData.connections.forEach(([id1, id2]) => {
    const p1 = dotPositions[id1];
    const p2 = dotPositions[id2];
    if (!p1 || !p2) return;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  });

  ctx.setLineDash([]);
  ctx.restore();
}

function drawDot(ctx, pos, dot, isSelected, isInteractive, t, phase) {
  ctx.save();

  const baseRadius = dot.type === 'center' ? 10 : dot.type === 'sacred' ? 8 : 6;
  const pulse = isSelected ? Math.sin(t * 8) * 3 : 0;
  const radius = baseRadius + pulse;

  // Glow ring for interactive dots
  if (isInteractive) {
    const hoverGlow = Math.sin(t * 3 + dot.id) * 0.2 + 0.5;
    ctx.strokeStyle = `rgba(212, 175, 55, ${hoverGlow})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius + 8, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Selected highlight ring
  if (isSelected) {
    ctx.strokeStyle = '#FBBF24';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(251, 191, 36, 0.9)';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius + 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // Dot fill
  let fillColor = '#FFFDF5';
  if (dot.type === 'center') fillColor = '#FBBF24';
  else if (dot.type === 'sacred') fillColor = '#F59E0B';

  if (phase === 'PLAY') {
    ctx.shadowColor = `rgba(245, 158, 11, 0.6)`;
    ctx.shadowBlur = 8;
  }

  ctx.fillStyle = fillColor;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Inner ring for sacred dots
  if (dot.type === 'sacred' || dot.type === 'center') {
    ctx.strokeStyle = 'rgba(255, 253, 245, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius - 2, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.shadowBlur = 0;
  ctx.restore();
}

function updateAndDrawParticles(ctx) {
  const particles = particlesRef.current;
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.025;
    p.vx *= 0.96;
    p.vy *= 0.96;

    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

const particlesRef = { current: [] };
