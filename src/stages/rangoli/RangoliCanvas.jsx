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
  onConnect,
}) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);
  const timeRef = useRef(0);

  // Mutable ref for real-time smooth finger dragging and line creation
  const dragStateRef = useRef({
    isDragging: false,
    activeDotId: null,
    currentPos: null,
    snapDotId: null,
  });

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

  // Spawn celebratory petals/sparks on correct hit
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

      for (let i = 0; i < 10; i++) {
        particlesRef.current.push({
          x: mx, y: my,
          vx: (Math.random() - 0.5) * 5,
          vy: (Math.random() - 0.5) * 5,
          life: 1.0,
          size: 2.5 + Math.random() * 3,
          color: `hsl(${38 + Math.random() * 25}, 100%, ${60 + Math.random() * 30}%)`,
        });
      }
    }
  }, [lastHitType, playerConnections, roundData, getDotPosition]);

  // Keep activeDotId in sync with selectedDot from props
  useEffect(() => {
    if (!dragStateRef.current.isDragging) {
      dragStateRef.current.activeDotId = selectedDot;
    }
  }, [selectedDot]);

  const propsRef = useRef({
    roundData,
    phase,
    playerConnections,
    selectedDot,
    previewProgress,
    correctSet,
    wrongSet,
    getDotPosition
  });

  // Always keep propsRef in sync synchronously on every render
  propsRef.current = {
    roundData,
    phase,
    playerConnections,
    selectedDot,
    previewProgress,
    correctSet,
    wrongSet,
    getDotPosition
  };

  // ─── CONTINUOUS CANVAS RENDER LOOP (UNINTERRUPTED 60 FPS) ───
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

      const {
        roundData: curRoundData,
        phase: curPhase,
        playerConnections: curConns,
        selectedDot: curSelectedDot,
        previewProgress: curPreviewProg,
        correctSet: curCorrectSet,
        wrongSet: curWrongSet,
        getDotPosition: curGetDotPos
      } = propsRef.current;

      ctx.save();
      ctx.scale(dpr, dpr);

      // Background
      drawBackground(ctx, width, height, t);

      // Subtle Grid Guide Dots
      drawGridGuide(ctx, width, height, curRoundData.gridSize);

      // Pattern Dot Positions
      const dotPositions = {};
      curRoundData.dots.forEach(dot => {
        const pos = curGetDotPos(dot, width, height);
        dotPositions[dot.id] = pos;
      });

      // Connections based on phase
      if (curPhase === 'PREVIEW') {
        drawPreviewPattern(ctx, curRoundData, dotPositions, curPreviewProg, t);
      } else if (curPhase === 'PLAY' || curPhase === 'RESULT') {
        // Draw the target pattern guide mark lines so player sees what to trace
        drawTargetGuide(ctx, curRoundData, dotPositions);

        // Draw connections player has formed
        drawPlayerConnections(ctx, curConns, dotPositions, curCorrectSet, curWrongSet);
      }

      if (curPhase === 'RESULT') {
        drawTargetGhost(ctx, curRoundData, dotPositions);
      }

      // ─── LIVE FINGER / ROLLING DRAWING STRAIGHT LINE ───
      const { isDragging, activeDotId, currentPos, snapDotId } = dragStateRef.current;
      const anchorId = activeDotId !== null ? activeDotId : curSelectedDot;

      if (curPhase === 'PLAY' && anchorId !== null && dotPositions[anchorId]) {
        const startPos = dotPositions[anchorId];
        const endPos = (snapDotId !== null && dotPositions[snapDotId])
          ? dotPositions[snapDotId]
          : currentPos
          ? currentPos
          : null;

        if (endPos) {
          ctx.save();
          // Glowing Sacred Line
          ctx.strokeStyle = snapDotId !== null ? 'rgba(52, 211, 153, 0.85)' : 'rgba(251, 191, 36, 0.85)';
          ctx.lineWidth = 5;
          ctx.shadowColor = snapDotId !== null ? '#10B981' : '#F59E0B';
          ctx.shadowBlur = 12;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(startPos.x, startPos.y);
          ctx.lineTo(endPos.x, endPos.y);
          ctx.stroke();

          // White rice-flour / chalk core straight line
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2.5;
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.moveTo(startPos.x, startPos.y);
          ctx.lineTo(endPos.x, endPos.y);
          ctx.stroke();

          // Finger tip / cursor drawing point
          ctx.fillStyle = snapDotId !== null ? '#34D399' : '#FDE68A';
          ctx.shadowColor = '#FBBF24';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(endPos.x, endPos.y, 7, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      }

      // Magnetic snap ring around candidate target dot
      if (snapDotId !== null && dotPositions[snapDotId]) {
        const sPos = dotPositions[snapDotId];
        ctx.save();
        ctx.strokeStyle = '#34D399';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#10B981';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(sPos.x, sPos.y, 16 + Math.sin(t * 12) * 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Draw all Dots
      curRoundData.dots.forEach(dot => {
        const pos = dotPositions[dot.id];
        const isSelected = curSelectedDot === dot.id || anchorId === dot.id;
        const isInteractive = curPhase === 'PLAY';
        drawDot(ctx, pos, dot, isSelected, isInteractive, t, curPhase);
      });

      // Flower Particle Burst
      updateAndDrawParticles(ctx);

      ctx.restore();
      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  // ─── POINTER & FINGER DRAWING HELPERS ───
  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY);
    if (clientX === undefined || clientY === undefined) return null;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const findNearestDot = useCallback((coords, hitRadius = 38) => {
    if (!coords || !roundData?.dots) return null;
    const canvas = canvasRef.current;
    if (!canvas) return null;

    let nearest = null;
    let minDist = Infinity;

    for (const dot of roundData.dots) {
      const pos = getDotPosition(dot, canvas.clientWidth, canvas.clientHeight);
      const dist = Math.hypot(coords.x - pos.x, coords.y - pos.y);
      if (dist <= hitRadius && dist < minDist) {
        minDist = dist;
        nearest = { dot, pos, dist };
      }
    }
    return nearest;
  }, [roundData, getDotPosition]);

  // ─── POINTER DOWN (Touch / Click Start) ───
  const handlePointerDown = (e) => {
    if (phase !== 'PLAY') return;
    const coords = getCanvasCoords(e);
    if (!coords) return;

    try {
      e.target.setPointerCapture(e.pointerId);
    } catch (_) {}

    const nearest = findNearestDot(coords, 38);

    if (nearest) {
      const dotId = nearest.dot.id;

      // If user previously selected dot A and taps dot B
      if (selectedDot !== null && selectedDot !== dotId && !dragStateRef.current.isDragging) {
        onConnect?.(selectedDot, dotId);
        dragStateRef.current = {
          isDragging: true,
          activeDotId: dotId,
          currentPos: nearest.pos,
          snapDotId: null,
        };
        return;
      }

      dragStateRef.current = {
        isDragging: true,
        activeDotId: dotId,
        currentPos: nearest.pos,
        snapDotId: null,
      };
      onDotClick?.(dotId);
    } else {
      // Click on empty area deselects anchor
      dragStateRef.current.activeDotId = null;
      dragStateRef.current.snapDotId = null;
      onDotClick?.(null);
    }
  };

  // ─── POINTER MOVE (Finger Drag / Rolling / Hover Connection) ───
  const handlePointerMove = (e) => {
    if (phase !== 'PLAY') return;
    const coords = getCanvasCoords(e);
    if (!coords) return;

    dragStateRef.current.currentPos = coords;

    const fromId = dragStateRef.current.activeDotId !== null
      ? dragStateRef.current.activeDotId
      : selectedDot;

    const nearest = findNearestDot(coords, 34);

    if (nearest) {
      const targetId = nearest.dot.id;

      if (fromId === null) {
        // User rolled over a dot with no previous anchor -> auto-activate it as anchor
        dragStateRef.current.activeDotId = targetId;
        onDotClick?.(targetId);
      } else if (targetId !== fromId) {
        // User rolled over another dot -> auto-connect!
        dragStateRef.current.snapDotId = targetId;
        onConnect?.(fromId, targetId);

        // Continuous drawing/rolling stroke: target dot becomes the new anchor
        dragStateRef.current.activeDotId = targetId;
        dragStateRef.current.currentPos = nearest.pos;
        dragStateRef.current.snapDotId = null;
      }
    } else {
      dragStateRef.current.snapDotId = null;
    }
  };

  // ─── POINTER UP (Finger Lift / Release) ───
  const handlePointerUp = (e) => {
    if (phase !== 'PLAY') return;
    try {
      if (e.target.hasPointerCapture(e.pointerId)) {
        e.target.releasePointerCapture(e.pointerId);
      }
    } catch (_) {}

    const coords = getCanvasCoords(e);
    const fromId = dragStateRef.current.activeDotId !== null
      ? dragStateRef.current.activeDotId
      : selectedDot;

    if (coords && dragStateRef.current.isDragging && fromId !== null) {
      const nearest = findNearestDot(coords, 34);
      if (nearest && nearest.dot.id !== fromId) {
        onConnect?.(fromId, nearest.dot.id);
        dragStateRef.current.activeDotId = nearest.dot.id;
      }
    }

    dragStateRef.current.isDragging = false;
    dragStateRef.current.snapDotId = null;
  };

  const handlePointerCancel = () => {
    dragStateRef.current.isDragging = false;
    dragStateRef.current.snapDotId = null;
  };

  const handlePointerLeave = () => {
    dragStateRef.current.isDragging = false;
    dragStateRef.current.currentPos = null;
    dragStateRef.current.snapDotId = null;
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', touchAction: 'none' }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: phase === 'PLAY' ? 'crosshair' : 'default',
          touchAction: 'none',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={handlePointerLeave}
      />
    </div>
  );
}

// ─── HIGH PERFORMANCE DRAWING ROUTINES ───

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
  ctx.restore();
}

function drawGridGuide(ctx, w, h, gridSize) {
  const padding = 0.12;
  const areaSize = Math.min(w, h) * (1 - padding * 2);
  const cellSize = areaSize / (gridSize - 1);
  const offsetX = (w - areaSize) / 2;
  const offsetY = (h - areaSize) / 2;

  ctx.save();
  ctx.fillStyle = 'rgba(212, 175, 55, 0.08)';
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
  if (!roundData?.connections) return;
  ctx.save();

  const connections = roundData.connections;

  // Draw all sacred pattern connections brightly and clearly
  connections.forEach(([id1, id2]) => {
    const p1 = dotPositions[id1];
    const p2 = dotPositions[id2];
    if (!p1 || !p2) return;

    // Glowing Sacred Aura Line
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.75)';
    ctx.lineWidth = 6;
    ctx.shadowColor = 'rgba(251, 191, 36, 0.9)';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();

    // Core White rice-flour / chalk line
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  });

  // Flowing sacred prana light pulses along lines
  const pulse = Math.sin(t * 6) * 0.25 + 0.75;
  connections.forEach(([id1, id2], idx) => {
    const p1 = dotPositions[id1];
    const p2 = dotPositions[id2];
    if (!p1 || !p2) return;
    const offset = ((t * 0.7 + idx * 0.15) % 1);
    const mx = p1.x + (p2.x - p1.x) * offset;
    const my = p1.y + (p2.y - p1.y) * offset;
    ctx.fillStyle = `rgba(254, 240, 138, ${pulse})`;
    ctx.shadowColor = '#FBBF24';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(mx, my, 4.5, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

function drawTargetGuide(ctx, roundData, dotPositions) {
  if (!roundData?.connections) return;
  ctx.save();
  ctx.setLineDash([7, 5]);
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
  ctx.lineWidth = 2;
  ctx.shadowColor = 'rgba(251, 191, 36, 0.35)';
  ctx.shadowBlur = 6;

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

  // Active glowing aura for selected or hovered dot
  if (isSelected) {
    ctx.strokeStyle = '#FBBF24';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(245, 158, 11, 0.9)';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius + 7, 0, Math.PI * 2);
    ctx.stroke();
  } else if (isInteractive) {
    const hoverGlow = Math.sin(t * 3 + dot.id) * 0.2 + 0.5;
    ctx.strokeStyle = `rgba(212, 175, 55, ${hoverGlow})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius + 4, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Dot core fill
  if (dot.type === 'center') {
    ctx.fillStyle = '#F59E0B';
    ctx.shadowColor = 'rgba(245, 158, 11, 0.8)';
    ctx.shadowBlur = 10;
  } else if (dot.type === 'sacred') {
    ctx.fillStyle = '#EC4899';
    ctx.shadowColor = 'rgba(236, 72, 153, 0.6)';
    ctx.shadowBlur = 8;
  } else {
    ctx.fillStyle = '#FEF08A';
    ctx.shadowBlur = 4;
    ctx.shadowColor = 'rgba(254, 240, 138, 0.4)';
  }

  ctx.beginPath();
  ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
  ctx.fill();

  // White inner center dot
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, radius * 0.35, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function updateAndDrawParticles(ctx) {
  const particles = particlesRef.current;
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.94;
    p.vy *= 0.94;
    p.life -= 0.035;

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
