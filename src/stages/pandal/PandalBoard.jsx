import React, { useRef, useEffect } from 'react';

export default function PandalBoard({
  roundItems,       // Items to place this round
  placedItems,      // Array of { id, x, y, rating }
  draggingItem,     // Currently dragging item object or null
  selectedItem,     // Currently selected item from tray or null
  dragPosition,     // { x, y } normalized position
  hoveredZone,      // 'near' | 'perfect' | null
  allPlacedItems,   // All items placed across all rounds
  isCompleted,
  onBoardClick,     // (x, y) callback when board is clicked
}) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);

  const activeItem = draggingItem || selectedItem;

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

      // Draw target zones for current round items
      roundItems.forEach(item => {
        const alreadyPlaced = allPlacedItems.some(p => p.id === item.id);
        if (!alreadyPlaced) {
          const isTargeted = activeItem && activeItem.id === item.id;
          drawTargetZone(ctx, item.targetX * w, item.targetY * h, item.zoneRadius * Math.min(w, h), t, item, isTargeted);
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
          ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
          ctx.beginPath();
          ctx.arc(dx, dy, 42, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#10B981';
          ctx.lineWidth = 2.5;
          ctx.stroke();
        } else if (hoveredZone === 'near') {
          ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
          ctx.beginPath();
          ctx.arc(dx, dy, 38, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#FBBF24';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Dragging icon
        ctx.font = '36px system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(245, 158, 11, 0.9)';
        ctx.shadowBlur = 18;
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
  }, [roundItems, placedItems, draggingItem, selectedItem, dragPosition, hoveredZone, allPlacedItems, isCompleted, activeItem]);

  const handleClick = (e) => {
    if (!onBoardClick) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    onBoardClick(x, y);
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      style={{ width: '100%', height: '100%', display: 'block', cursor: activeItem ? 'crosshair' : 'default' }}
    />
  );
}

// ─── Drawing Helpers ───

function drawPandalBackground(ctx, w, h, t) {
  // Deep temple night gradient
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#06131F');
  grad.addColorStop(0.4, '#0A2234');
  grad.addColorStop(1, '#1A0408');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Twinkling temple stars
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  for (let i = 0; i < 30; i++) {
    const sx = ((i * 137.5) % w);
    const sy = ((i * 71.3) % (h * 0.35));
    const twinkle = Math.sin(t * 2.5 + i) * 0.3 + 0.7;
    ctx.globalAlpha = twinkle * 0.5;
    ctx.beginPath();
    ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Floor
  ctx.fillStyle = '#180407';
  ctx.fillRect(0, h * 0.82, w, h * 0.18);
  ctx.fillStyle = 'rgba(212, 175, 55, 0.15)';
  ctx.fillRect(0, h * 0.82, w, 2);
}

function drawPandalStructure(ctx, w, h, placedItems, t) {
  ctx.save();

  // Pandal pillars
  const pillarColor = 'rgba(180, 83, 9, 0.4)';
  const pillarW = w * 0.045;
  ctx.fillStyle = pillarColor;
  ctx.fillRect(w * 0.14 - pillarW / 2, h * 0.14, pillarW, h * 0.68);
  ctx.fillRect(w * 0.86 - pillarW / 2, h * 0.14, pillarW, h * 0.68);

  // Canopy arch
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(w * 0.14, h * 0.14);
  ctx.quadraticCurveTo(w * 0.5, h * 0.01, w * 0.86, h * 0.14);
  ctx.stroke();

  // Inner arch
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.2)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.19, h * 0.19);
  ctx.quadraticCurveTo(w * 0.5, h * 0.07, w * 0.81, h * 0.19);
  ctx.stroke();

  // Base platform
  ctx.fillStyle = 'rgba(120, 53, 15, 0.35)';
  ctx.beginPath();
  ctx.moveTo(w * 0.25, h * 0.82);
  ctx.lineTo(w * 0.75, h * 0.82);
  ctx.lineTo(w * 0.80, h * 0.88);
  ctx.lineTo(w * 0.20, h * 0.88);
  ctx.closePath();
  ctx.fill();

  // Sacred steps
  ctx.fillStyle = 'rgba(100, 43, 10, 0.3)';
  ctx.fillRect(w * 0.33, h * 0.88, w * 0.34, h * 0.04);
  ctx.fillRect(w * 0.36, h * 0.92, w * 0.28, h * 0.04);

  // Pandal Illumination Glow as items are placed
  const intensity = Math.min(1, placedItems.length / 7);
  if (intensity > 0) {
    const glowGrad = ctx.createRadialGradient(w * 0.5, h * 0.45, 20, w * 0.5, h * 0.45, w * 0.35);
    glowGrad.addColorStop(0, `rgba(245, 158, 11, ${intensity * 0.15})`);
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, w, h);
  }

  ctx.restore();
}

function drawTargetZone(ctx, x, y, radius, t, item, isTargeted) {
  ctx.save();

  const pulse = Math.sin(t * 3.5) * 0.2 + 0.8;

  if (isTargeted) {
    // Strongly highlighted target zone for active item!
    ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#FBBF24';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(245, 158, 11, 0.9)';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.2 * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // "TAP HERE" guidance label
    ctx.fillStyle = '#FDE68A';
    ctx.font = 'bold 10px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TAP TO PLACE', x, y - radius - 8);
  } else {
    // Gentle dashed ring
    ctx.strokeStyle = `rgba(212, 175, 55, ${0.35 * pulse})`;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Ghost icon hint
  ctx.globalAlpha = isTargeted ? 0.65 : 0.3;
  ctx.font = '22px system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(item.icon, x, y);
  ctx.globalAlpha = 1;

  ctx.restore();
}

function drawPlacedItem(ctx, x, y, icon, rating, t) {
  ctx.save();

  let glowColor = 'rgba(245, 158, 11, 0.5)';
  if (rating === 'PERFECT') glowColor = 'rgba(16, 185, 129, 0.7)';
  else if (rating === 'GREAT') glowColor = 'rgba(251, 191, 36, 0.6)';
  else if (rating === 'MISSED') glowColor = 'rgba(239, 68, 68, 0.4)';

  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 14;
  ctx.font = '30px system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(icon, x, y);

  // Rating badge
  ctx.shadowBlur = 0;
  ctx.font = 'bold 10px Outfit, sans-serif';
  ctx.fillStyle = rating === 'PERFECT' ? '#10B981' : rating === 'GREAT' ? '#FBBF24' : rating === 'GOOD' ? '#F59E0B' : '#F87171';
  ctx.fillText(rating, x, y + 24);

  ctx.restore();
}

function drawCompletionEffect(ctx, w, h, t) {
  const shimmer = Math.sin(t * 2) * 0.06 + 0.1;
  ctx.fillStyle = `rgba(254, 240, 138, ${shimmer})`;
  ctx.fillRect(0, 0, w, h);

  const grad = ctx.createRadialGradient(w * 0.5, h * 0.45, 20, w * 0.5, h * 0.45, w * 0.45);
  grad.addColorStop(0, `rgba(245, 158, 11, ${0.12 + Math.sin(t * 3) * 0.05})`);
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}
