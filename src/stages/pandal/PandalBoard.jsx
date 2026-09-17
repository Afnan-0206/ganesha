import React, { useRef, useEffect, useCallback } from 'react';

export default function PandalBoard({
  roundItems,       // Items to place this round
  placedItems,      // Array of { id, x, y, rating }
  draggingItem,     // Currently dragging item object or null
  dragPosition,     // { x, y } normalized position
  hoveredZone,      // 'near' | 'perfect' | null
  allPlacedItems,   // All items placed across all rounds
  isCompleted,
}) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      timeRef.current += 0.016;
      const t = timeRef.current;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const dpr = window.devicePixelRatio || 1;

      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Draw pandal background
      drawPandalBackground(ctx, w, h, t);

      // Draw pandal structure outline
      drawPandalStructure(ctx, w, h, allPlacedItems, t);

      // Draw target zones for current round items (subtle hints)
      roundItems.forEach(item => {
        const alreadyPlaced = placedItems.some(p => p.id === item.id);
        if (!alreadyPlaced) {
          drawTargetZone(ctx, item.targetX * w, item.targetY * h, item.zoneRadius * Math.min(w, h), t, item);
        }
      });

      // Draw already placed items across all rounds
      allPlacedItems.forEach(placed => {
        drawPlacedItem(ctx, placed.x * w, placed.y * h, placed.icon, placed.rating, t);
      });

      // Draw dragging item
      if (draggingItem && dragPosition) {
        const dx = dragPosition.x * w;
        const dy = dragPosition.y * h;

        // Zone proximity glow
        if (hoveredZone === 'perfect') {
          ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
          ctx.beginPath();
          ctx.arc(dx, dy, 40, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#10B981';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else if (hoveredZone === 'near') {
          ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
          ctx.beginPath();
          ctx.arc(dx, dy, 35, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#FBBF24';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Dragging icon
        ctx.font = '32px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(245, 158, 11, 0.8)';
        ctx.shadowBlur = 16;
        ctx.fillText(draggingItem.icon, dx, dy);
        ctx.shadowBlur = 0;
      }

      // Completion shimmer
      if (isCompleted) {
        drawCompletionEffect(ctx, w, h, t);
      }

      ctx.restore();
      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [roundItems, placedItems, draggingItem, dragPosition, hoveredZone, allPlacedItems, isCompleted]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
}

// ─── Drawing Helpers ───

function drawPandalBackground(ctx, w, h, t) {
  // Night sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#0A1628');
  grad.addColorStop(0.4, '#0E2439');
  grad.addColorStop(1, '#1A0408');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Stars
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  for (let i = 0; i < 30; i++) {
    const sx = ((i * 137.5) % w);
    const sy = ((i * 71.3) % (h * 0.35));
    const twinkle = Math.sin(t * 2 + i) * 0.3 + 0.7;
    ctx.globalAlpha = twinkle * 0.5;
    ctx.beginPath();
    ctx.arc(sx, sy, 1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Ground
  ctx.fillStyle = '#1A0408';
  ctx.fillRect(0, h * 0.82, w, h * 0.18);
  ctx.fillStyle = 'rgba(212, 175, 55, 0.08)';
  ctx.fillRect(0, h * 0.82, w, 2);
}

function drawPandalStructure(ctx, w, h, placedItems, t) {
  ctx.save();

  // Pandal pillars
  const pillarColor = 'rgba(180, 83, 9, 0.35)';
  const pillarW = w * 0.04;
  ctx.fillStyle = pillarColor;
  ctx.fillRect(w * 0.15 - pillarW / 2, h * 0.15, pillarW, h * 0.67);
  ctx.fillRect(w * 0.85 - pillarW / 2, h * 0.15, pillarW, h * 0.67);

  // Canopy arch
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.25)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(w * 0.15, h * 0.15);
  ctx.quadraticCurveTo(w * 0.5, h * 0.02, w * 0.85, h * 0.15);
  ctx.stroke();

  // Inner arch
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.15)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.20, h * 0.20);
  ctx.quadraticCurveTo(w * 0.5, h * 0.08, w * 0.80, h * 0.20);
  ctx.stroke();

  // Base platform
  ctx.fillStyle = 'rgba(120, 53, 15, 0.3)';
  ctx.beginPath();
  ctx.moveTo(w * 0.25, h * 0.82);
  ctx.lineTo(w * 0.75, h * 0.82);
  ctx.lineTo(w * 0.80, h * 0.88);
  ctx.lineTo(w * 0.20, h * 0.88);
  ctx.closePath();
  ctx.fill();

  // Steps
  ctx.fillStyle = 'rgba(100, 43, 10, 0.25)';
  ctx.fillRect(w * 0.35, h * 0.88, w * 0.30, h * 0.04);
  ctx.fillRect(w * 0.38, h * 0.92, w * 0.24, h * 0.04);

  // Light up areas based on placed items count
  const intensity = Math.min(1, placedItems.length / 8);
  if (intensity > 0) {
    const glowGrad = ctx.createRadialGradient(w * 0.5, h * 0.45, 20, w * 0.5, h * 0.45, w * 0.3);
    glowGrad.addColorStop(0, `rgba(245, 158, 11, ${intensity * 0.08})`);
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, w, h);
  }

  ctx.restore();
}

function drawTargetZone(ctx, x, y, radius, t, item) {
  ctx.save();

  // Pulsing dashed circle
  const pulse = Math.sin(t * 3) * 0.15 + 0.85;
  ctx.strokeStyle = `rgba(212, 175, 55, ${0.25 * pulse})`;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Center dot
  ctx.fillStyle = `rgba(212, 175, 55, ${0.3 * pulse})`;
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawPlacedItem(ctx, x, y, icon, rating, t) {
  ctx.save();

  // Glow based on rating
  let glowColor = 'rgba(245, 158, 11, 0.4)';
  if (rating === 'PERFECT') glowColor = 'rgba(16, 185, 129, 0.6)';
  else if (rating === 'GREAT') glowColor = 'rgba(251, 191, 36, 0.5)';
  else if (rating === 'MISSED') glowColor = 'rgba(239, 68, 68, 0.3)';

  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 12;
  ctx.font = '28px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(icon, x, y);

  // Rating badge
  ctx.shadowBlur = 0;
  ctx.font = 'bold 9px Outfit, sans-serif';
  ctx.fillStyle = rating === 'PERFECT' ? '#10B981' : rating === 'GREAT' ? '#FBBF24' : rating === 'GOOD' ? '#F59E0B' : '#F87171';
  ctx.fillText(rating, x, y + 22);

  ctx.restore();
}

function drawCompletionEffect(ctx, w, h, t) {
  // Golden shimmer overlay
  const shimmer = Math.sin(t * 2) * 0.05 + 0.08;
  ctx.fillStyle = `rgba(254, 240, 138, ${shimmer})`;
  ctx.fillRect(0, 0, w, h);

  // Radial glow from center
  const grad = ctx.createRadialGradient(w * 0.5, h * 0.45, 20, w * 0.5, h * 0.45, w * 0.4);
  grad.addColorStop(0, `rgba(245, 158, 11, ${0.08 + Math.sin(t * 3) * 0.04})`);
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}
