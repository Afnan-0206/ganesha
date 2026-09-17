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
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [pattern, gameState, userPath, visitedNodes, previewTimeRemaining, previewTotalTime]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', touchAction: 'none' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block', cursor: gameState === 'TRACING' ? 'crosshair' : 'default' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />
    </div>
  );
}

// 1. Temple Courtyard Sandstone Floor
function drawCourtyardFloor(ctx, width, height) {
  const grad = ctx.createRadialGradient(width * 0.5, height * 0.5, 40, width * 0.5, height * 0.5, Math.max(width, height) * 0.7);
  grad.addColorStop(0, '#420D15');
  grad.addColorStop(0.6, '#2D080E');
  grad.addColorStop(1, '#1A0408');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Subtle terracotta paving lines
  ctx.save();
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.05)';
  ctx.lineWidth = 1;
  const tileSize = 48;
  for (let x = 0; x < width; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();
}

// 2. Sacred Kolam Dot Grid
function drawKolamGrid(ctx, cx, cy, size, gameState) {
  ctx.save();
  ctx.strokeStyle = 'rgba(253, 230, 138, 0.12)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.48, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.28, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

// Helper to convert normalized pattern point to canvas coordinates
function toCanvasCoords(pt, cx, cy, size) {
  return {
    x: cx + (pt.x - 0.5) * size,
    y: cy + (pt.y - 0.5) * size
  };
}

// 3. Full Glowing Pattern during Preview (Memorize Step)
function drawFullGlowingPattern(ctx, cx, cy, size, pattern, timeRatio) {
  ctx.save();

  // Outer glowing aura
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.85)';
  ctx.lineWidth = 4;
  ctx.shadowColor = 'rgba(251, 191, 36, 0.9)';
  ctx.shadowBlur = 16;

  // Draw sequence lines
  ctx.beginPath();
  const seq = pattern.sequence;
  for (let i = 0; i < seq.length; i++) {
    const pt = toCanvasCoords(pattern.points[seq[i]], cx, cy, size);
    if (i === 0) ctx.moveTo(pt.x, pt.y);
    else ctx.lineTo(pt.x, pt.y);
  }
  ctx.stroke();

  // White rice flour core stroke
  ctx.strokeStyle = '#FFFDF5';
  ctx.lineWidth = 2.5;
  ctx.shadowBlur = 0;
  ctx.stroke();

  // Draw Nodes / Lotus Dots
  pattern.points.forEach((pt, idx) => {
    const cp = toCanvasCoords(pt, cx, cy, size);
    ctx.fillStyle = pt.landmark ? '#FBBF24' : '#FFFDF5';
    ctx.shadowColor = 'rgba(245, 158, 11, 0.9)';
    ctx.shadowBlur = pt.landmark ? 12 : 6;
    ctx.beginPath();
    ctx.arc(cp.x, cp.y, pt.landmark ? 7 : 5, 0, Math.PI * 2);
    ctx.fill();

    // Node Order Label
    ctx.font = '700 10px "Outfit", sans-serif';
    ctx.fillStyle = '#1A0408';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(idx + 1, cp.x, cp.y);
  });

  ctx.restore();
}

// 4. Tracing Mode (Landmarks remain, player draws chalk trail)
function drawTracingMode(ctx, cx, cy, size, pattern, visitedNodes, userPath) {
  ctx.save();

  // Landmark dots (Soft glowing guide)
  pattern.points.forEach((pt, idx) => {
    const cp = toCanvasCoords(pt, cx, cy, size);
    const isVisited = visitedNodes.includes(idx);

    ctx.fillStyle = isVisited ? '#10B981' : (pt.landmark ? 'rgba(251, 191, 36, 0.75)' : 'rgba(255, 255, 255, 0.4)');
    ctx.shadowColor = isVisited ? 'rgba(16, 185, 129, 0.9)' : 'rgba(245, 158, 11, 0.5)';
    ctx.shadowBlur = isVisited ? 12 : 4;

    ctx.beginPath();
    ctx.arc(cp.x, cp.y, isVisited ? 8 : (pt.landmark ? 6 : 4), 0, Math.PI * 2);
    ctx.fill();

    if (pt.landmark || isVisited) {
      ctx.strokeStyle = '#FFFDF5';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  });

  // Completed Sequence Lines
  if (visitedNodes.length > 1) {
    ctx.strokeStyle = '#FBBF24';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(245, 158, 11, 0.7)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    for (let i = 0; i < visitedNodes.length; i++) {
      const pt = toCanvasCoords(pattern.points[visitedNodes[i]], cx, cy, size);
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();
  }

  // Active User Finger/Cursor Chalk Path
  if (userPath && userPath.length > 1) {
    ctx.strokeStyle = 'rgba(255, 253, 245, 0.95)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(253, 230, 138, 0.9)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(userPath[0].x, userPath[0].y);
    for (let i = 1; i < userPath.length; i++) {
      ctx.lineTo(userPath[i].x, userPath[i].y);
    }
    ctx.stroke();

    // Chalk dust particles at brush tip
    const tip = userPath[userPath.length - 1];
    ctx.fillStyle = '#FFFDF5';
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// 5. Blossomed Rangoli on Success (Full Color Gulal Fill)
function drawBlossomedRangoli(ctx, cx, cy, size, pattern) {
  ctx.save();

  // Radiant Golden Background Aura
  const bloomGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, size * 0.55);
  bloomGrad.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
  bloomGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.2)');
  bloomGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = bloomGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.55, 0, Math.PI * 2);
  ctx.fill();

  // Full Color Petal Fills
  const seq = pattern.sequence;
  ctx.fillStyle = pattern.fillColors[0] || '#FF7700';
  ctx.strokeStyle = '#FFFDF5';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i < seq.length; i++) {
    const pt = toCanvasCoords(pattern.points[seq[i]], cx, cy, size);
    if (i === 0) ctx.moveTo(pt.x, pt.y);
    else ctx.lineTo(pt.x, pt.y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Secondary floral ring
  ctx.strokeStyle = '#FDE68A';
  ctx.lineWidth = 2;
  pattern.points.forEach((pt) => {
    const cp = toCanvasCoords(pt, cx, cy, size);
    ctx.fillStyle = '#EC4899'; // Gulal pink
    ctx.beginPath();
    ctx.arc(cp.x, cp.y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  // Center golden bindu
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.arc(cx, cy, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
