import React, { useRef, useEffect } from 'react';

export default function CityMap({
  boatY,          // 0 to 1 normalized
  riverObjects,   // Array of objects with x, y, icon, kind, etc.
  health,         // 0 to 100
  score,          // Current score
  progress,       // 0 to 1 journey progress
  hitFlash,       // true when just hit obstacle
  collectEffects, // Array of { x, y, time }
}) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);
  const waveRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      timeRef.current += 0.016;
      waveRef.current += 0.02;
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

      // Sky
      drawSky(ctx, w, h, t, progress);

      // River water
      drawRiver(ctx, w, h, t, waveRef.current);

      // Riverbanks
      drawBanks(ctx, w, h, t);

      // River objects (obstacles & collectibles)
      riverObjects.forEach(obj => {
        if (obj.kind === 'obstacle' && !obj.hit) {
          drawObstacle(ctx, obj.x * w, obj.y * h, obj.icon, obj.width * w, t);
        } else if (obj.kind === 'collectible' && !obj.collected) {
          drawCollectible(ctx, obj.x * w, obj.y * h, obj.icon, t);
        }
      });

      // Boat
      drawBoat(ctx, w * 0.18, boatY * h, w, h, t, hitFlash);

      // Collect effects
      collectEffects.forEach(eff => {
        const age = t - eff.time;
        if (age < 0.8) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, 1 - age * 1.5);
          ctx.fillStyle = '#FDE68A';
          ctx.font = `bold ${12 + age * 6}px Outfit, sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(`+${eff.points}`, eff.x * w, eff.y * h - age * 40);
          ctx.restore();
        }
      });

      // Hit flash overlay
      if (hitFlash) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
        ctx.fillRect(0, 0, w, h);
      }

      // HUD — Health bar
      drawHealthBar(ctx, w, h, health);

      // Progress bar
      drawProgressBar(ctx, w, h, progress);

      ctx.restore();
      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [boatY, riverObjects, health, score, progress, hitFlash, collectEffects]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
}

// ─── Drawing Functions ───

function drawSky(ctx, w, h, t, progress) {
  // Sunset gradient that shifts as you progress
  const sunsetPhase = progress;
  const grad = ctx.createLinearGradient(0, 0, 0, h * 0.3);
  grad.addColorStop(0, lerpColor('#1E3A5F', '#FF6B35', sunsetPhase * 0.5));
  grad.addColorStop(0.5, lerpColor('#2C5F8A', '#FF8C42', sunsetPhase * 0.5));
  grad.addColorStop(1, lerpColor('#3A7CA5', '#FFB347', sunsetPhase * 0.3));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h * 0.12);

  // Sun/moon
  const sunX = w * (0.7 - progress * 0.3);
  const sunY = h * 0.05;
  ctx.fillStyle = progress > 0.7 ? '#FFE4B5' : '#FFD700';
  ctx.shadowColor = progress > 0.7 ? 'rgba(255, 228, 181, 0.6)' : 'rgba(255, 215, 0, 0.5)';
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawRiver(ctx, w, h, t, wave) {
  const riverTop = h * 0.12;
  const riverBot = h * 0.88;

  // Water gradient
  const grad = ctx.createLinearGradient(0, riverTop, 0, riverBot);
  grad.addColorStop(0, '#0A4B6B');
  grad.addColorStop(0.3, '#0E6693');
  grad.addColorStop(0.6, '#0B5575');
  grad.addColorStop(1, '#083D55');
  ctx.fillStyle = grad;
  ctx.fillRect(0, riverTop, w, riverBot - riverTop);

  // Animated wave lines
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 1;
  for (let waveY = riverTop + 20; waveY < riverBot - 20; waveY += 30) {
    ctx.beginPath();
    for (let x = 0; x < w; x += 5) {
      const y = waveY + Math.sin((x + wave * 100 + waveY) * 0.03) * 4;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Flowing current lines
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    const baseY = riverTop + (riverBot - riverTop) * (0.2 + i * 0.15);
    ctx.beginPath();
    for (let x = 0; x < w; x += 4) {
      const flowOffset = ((x + t * 80 + i * 50) % (w + 200)) - 100;
      const y = baseY + Math.sin(flowOffset * 0.02 + i) * 6;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawBanks(ctx, w, h, t) {
  // Top bank (tree line)
  ctx.fillStyle = '#1A4D2E';
  ctx.fillRect(0, 0, w, h * 0.13);

  // Tree silhouettes on top
  ctx.fillStyle = '#0D2818';
  for (let x = 0; x < w; x += 40) {
    const treeH = 10 + Math.sin(x * 0.1) * 5;
    ctx.beginPath();
    ctx.moveTo(x, h * 0.13);
    ctx.lineTo(x + 15, h * 0.13 - treeH);
    ctx.lineTo(x + 30, h * 0.13);
    ctx.fill();
  }

  // Bottom bank (ghat steps)
  ctx.fillStyle = '#8B6914';
  ctx.fillRect(0, h * 0.88, w, h * 0.12);

  // Step lines
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.15)';
  ctx.lineWidth = 1;
  for (let y = h * 0.88; y < h; y += 8) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Diyas on bank
  for (let x = 30; x < w; x += 70) {
    const flicker = Math.sin(t * 4 + x) * 0.2 + 0.8;
    ctx.fillStyle = `rgba(245, 158, 11, ${flicker * 0.6})`;
    ctx.beginPath();
    ctx.arc(x, h * 0.89, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawObstacle(ctx, x, y, icon, objWidth, t) {
  ctx.save();

  // Danger glow
  ctx.shadowColor = 'rgba(239, 68, 68, 0.4)';
  ctx.shadowBlur = 8;

  // Bob animation
  const bob = Math.sin(t * 2 + x * 0.5) * 3;

  ctx.font = '24px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(icon, x, y + bob);
  ctx.shadowBlur = 0;

  ctx.restore();
}

function drawCollectible(ctx, x, y, icon, t) {
  ctx.save();

  // Golden glow
  ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
  ctx.shadowBlur = 10;

  const bob = Math.sin(t * 3 + x) * 4;
  const pulse = Math.sin(t * 5 + y) * 0.1 + 1.0;

  ctx.font = `${20 * pulse}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(icon, x, y + bob);
  ctx.shadowBlur = 0;

  ctx.restore();
}

function drawBoat(ctx, x, y, w, h, t, hitFlash) {
  ctx.save();

  // Gentle rocking
  const rock = Math.sin(t * 2) * 0.04;
  ctx.translate(x, y);
  ctx.rotate(rock);

  // Boat hull
  const boatW = 50;
  const boatH = 20;

  // Shadow on water
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.beginPath();
  ctx.ellipse(0, boatH + 4, boatW * 0.8, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hull
  ctx.fillStyle = hitFlash ? '#DC2626' : '#8B4513';
  ctx.beginPath();
  ctx.moveTo(-boatW * 0.6, 0);
  ctx.quadraticCurveTo(-boatW * 0.3, boatH, 0, boatH * 0.8);
  ctx.quadraticCurveTo(boatW * 0.3, boatH, boatW * 0.6, 0);
  ctx.quadraticCurveTo(boatW * 0.4, -boatH * 0.3, 0, -boatH * 0.4);
  ctx.quadraticCurveTo(-boatW * 0.4, -boatH * 0.3, -boatW * 0.6, 0);
  ctx.closePath();
  ctx.fill();

  // Gold trim
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Murti on boat
  ctx.font = '22px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(245, 158, 11, 0.7)';
  ctx.shadowBlur = 12;
  ctx.fillText('🛕', 0, -8);
  ctx.shadowBlur = 0;

  // Flowers around
  ctx.font = '10px serif';
  ctx.fillText('🌼', -20, -2);
  ctx.fillText('🌼', 20, -2);

  ctx.restore();
}

function drawHealthBar(ctx, w, h, health) {
  const barW = 120;
  const barH = 10;
  const barX = 12;
  const barY = h * 0.12 + 12;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.roundRect(barX - 2, barY - 2, barW + 4, barH + 4, 6);
  ctx.fill();

  // Health fill
  const healthRatio = health / 100;
  const healthColor = healthRatio > 0.5 ? '#10B981' : healthRatio > 0.25 ? '#F59E0B' : '#EF4444';
  ctx.fillStyle = healthColor;
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW * healthRatio, barH, 4);
  ctx.fill();

  // Label
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 9px Outfit, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`HP ${Math.round(health)}%`, barX, barY - 5);
}

function drawProgressBar(ctx, w, h, progress) {
  const barW = w - 24;
  const barH = 4;
  const barX = 12;
  const barY = h * 0.88 + 6;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(barX, barY, barW, barH);

  ctx.fillStyle = '#38BDF8';
  ctx.fillRect(barX, barY, barW * progress, barH);

  // Boat icon on progress
  ctx.font = '12px serif';
  ctx.fillText('⛵', barX + barW * progress - 6, barY + barH + 12);

  // Start/End labels
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = '8px Outfit, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('PANDAL', barX, barY + barH + 14);
  ctx.textAlign = 'right';
  ctx.fillText('GHAT', barX + barW, barY + barH + 14);
}

function lerpColor(c1, c2, t) {
  const hex = (c) => parseInt(c.slice(1), 16);
  const r1 = (hex(c1) >> 16) & 255, g1 = (hex(c1) >> 8) & 255, b1 = hex(c1) & 255;
  const r2 = (hex(c2) >> 16) & 255, g2 = (hex(c2) >> 8) & 255, b2 = hex(c2) & 255;
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r}, ${g}, ${b})`;
}
