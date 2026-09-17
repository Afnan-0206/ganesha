import React, { useRef, useEffect } from 'react';

export default function CityMap({
  boatY,
  boatYRef,
  riverObjects,
  riverObjectsRef,
  health,
  score,
  progress,
  hitFlash,
  collectEffects,
  collectEffectsRef,
}) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);
  const propsRef = useRef({ boatY, riverObjects, health, progress, hitFlash, collectEffects });

  useEffect(() => {
    propsRef.current = { boatY, riverObjects, health, progress, hitFlash, collectEffects };
  }, [boatY, riverObjects, health, progress, hitFlash, collectEffects]);

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

      const currentBoatY = (boatYRef && boatYRef.current !== undefined)
        ? boatYRef.current
        : (boatY && typeof boatY === 'object' && 'current' in boatY)
        ? boatY.current
        : (propsRef.current.boatY !== undefined ? propsRef.current.boatY : 0.5);

      const currentObjects = (riverObjectsRef && riverObjectsRef.current)
        ? riverObjectsRef.current
        : (riverObjects && typeof riverObjects === 'object' && 'current' in riverObjects)
        ? riverObjects.current
        : propsRef.current.riverObjects;

      const currentEffects = (collectEffectsRef && collectEffectsRef.current)
        ? collectEffectsRef.current
        : (collectEffects && typeof collectEffects === 'object' && 'current' in collectEffects)
        ? collectEffects.current
        : propsRef.current.collectEffects;

      const currentHealth = propsRef.current.health;
      const currentProg = propsRef.current.progress;
      const isHit = propsRef.current.hitFlash;

      // 1. Sunset Sky
      drawSky(ctx, w, h, t, currentProg);

      // 2. Flowing River Water (High Performance)
      drawRiver(ctx, w, h, t);

      // 3. Banks with temples, trees, and glowing diyas
      drawBanks(ctx, w, h, t);

      // 4. River Objects (Obstacles & Sacred Blessings)
      if (currentObjects) {
        for (let i = 0; i < currentObjects.length; i++) {
          const obj = currentObjects[i];
          if (obj.x < -0.1 || obj.x > 1.1) continue; // Skip offscreen items

          if (obj.kind === 'obstacle' && !obj.hit) {
            drawObstacle(ctx, obj.x * w, obj.y * h, obj.icon, t);
          } else if (obj.kind === 'collectible' && !obj.collected) {
            drawCollectible(ctx, obj.x * w, obj.y * h, obj.icon, t);
          }
        }
      }

      // 5. Sacred Chariot Boat (Lord Ganesha Murti)
      drawBoat(ctx, w * 0.18, currentBoatY * h, w, h, t, isHit);

      // 6. Floating Score Floaties
      if (currentEffects && currentEffects.length > 0) {
        const nowSec = Date.now() / 1000;
        for (let i = 0; i < currentEffects.length; i++) {
          const eff = currentEffects[i];
          const age = nowSec - eff.time;
          if (age < 0.7) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, 1 - age * 1.5);
            ctx.fillStyle = '#FDE68A';
            ctx.font = 'bold 13px Outfit, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`+${eff.points}`, eff.x * w, eff.y * h - age * 35);
            ctx.restore();
          }
        }
      }

      // 7. Hit flash red overlay
      if (isHit) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
        ctx.fillRect(0, 0, w, h);
      }

      // 8. In-Canvas Heads Up Display (Health & Progress)
      drawHUD(ctx, w, h, currentHealth, currentProg);

      ctx.restore();
      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []); // Run once! Ref keeps data fresh at 60 FPS without re-mounting!

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
}

// ─── HIGH-PERFORMANCE DRAWING ROUTINES ───

function drawSky(ctx, w, h, t, progress) {
  const grad = ctx.createLinearGradient(0, 0, 0, h * 0.14);
  grad.addColorStop(0, '#0F2B48');
  grad.addColorStop(0.6, '#1C4A6E');
  grad.addColorStop(1, '#D97706');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h * 0.14);

  // Golden Sun setting over the sacred river
  const sunX = w * (0.8 - progress * 0.4);
  const sunY = h * 0.07;
  ctx.fillStyle = '#FBBF24';
  ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawRiver(ctx, w, h, t) {
  const riverTop = h * 0.14;
  const riverBot = h * 0.86;

  // River water gradient
  const grad = ctx.createLinearGradient(0, riverTop, 0, riverBot);
  grad.addColorStop(0, '#0C4A6E');
  grad.addColorStop(0.3, '#075985');
  grad.addColorStop(0.7, '#0369A1');
  grad.addColorStop(1, '#082F49');
  ctx.fillStyle = grad;
  ctx.fillRect(0, riverTop, w, riverBot - riverTop);

  // Smooth Wave Curves (Fast step of 40px with Bezier curves)
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1.5;

  for (let i = 0; i < 4; i++) {
    const yBase = riverTop + (riverBot - riverTop) * (0.2 + i * 0.22);
    ctx.beginPath();
    ctx.moveTo(0, yBase);
    for (let x = 0; x < w; x += 45) {
      const cy = yBase + Math.sin((x * 0.03) + (t * 3) + i) * 5;
      ctx.quadraticCurveTo(x + 22, cy, x + 45, yBase);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawBanks(ctx, w, h, t) {
  // Top Bank (Lush Ghat & Palm Trees)
  ctx.fillStyle = '#143823';
  ctx.fillRect(0, 0, w, h * 0.14);

  ctx.fillStyle = '#0B2316';
  for (let x = 0; x < w; x += 36) {
    ctx.beginPath();
    ctx.moveTo(x, h * 0.14);
    ctx.lineTo(x + 18, h * 0.14 - 12);
    ctx.lineTo(x + 36, h * 0.14);
    ctx.fill();
  }

  // Bottom Bank (Stone Steps with Festival Diyas)
  ctx.fillStyle = '#6B4A12';
  ctx.fillRect(0, h * 0.86, w, h * 0.14);

  ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.86);
  ctx.lineTo(w, h * 0.86);
  ctx.stroke();

  // Floating Diyas near Ghat
  for (let x = 20; x < w; x += 55) {
    const flicker = Math.sin(t * 4 + x) * 0.2 + 0.8;
    ctx.fillStyle = `rgba(245, 158, 11, ${flicker * 0.8})`;
    ctx.beginPath();
    ctx.arc(x, h * 0.88, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawObstacle(ctx, x, y, icon, t) {
  ctx.save();
  const bob = Math.sin(t * 3.5 + x * 0.05) * 3;

  // Crimson warning aura
  ctx.fillStyle = 'rgba(239, 68, 68, 0.18)';
  ctx.beginPath();
  ctx.arc(x, y + bob, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = '26px system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(icon, x, y + bob);
  ctx.restore();
}

function drawCollectible(ctx, x, y, icon, t) {
  ctx.save();
  const bob = Math.sin(t * 4 + x * 0.05) * 4;

  // Golden blessing aura
  ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
  ctx.beginPath();
  ctx.arc(x, y + bob, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = '24px system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(icon, x, y + bob);
  ctx.restore();
}

function drawBoat(ctx, x, y, w, h, t, isHit) {
  ctx.save();
  const rock = Math.sin(t * 3) * 0.06;
  ctx.translate(x, y);
  ctx.rotate(rock);

  // Boat Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 16, 36, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Chariot Boat Hull
  const hullGrad = ctx.createLinearGradient(-35, 0, 35, 0);
  hullGrad.addColorStop(0, '#B45309');
  hullGrad.addColorStop(0.5, isHit ? '#DC2626' : '#D97706');
  hullGrad.addColorStop(1, '#92400E');
  ctx.fillStyle = hullGrad;

  ctx.beginPath();
  ctx.moveTo(-35, 0);
  ctx.quadraticCurveTo(-15, 14, 25, 14);
  ctx.lineTo(38, 2);
  ctx.lineTo(34, -4);
  ctx.lineTo(-30, -4);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#FDE68A';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Divine Ganesha Murti atop the chariot
  ctx.font = '28px system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🐘', 2, -14);

  // Golden halo around Ganesha
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(2, -14, 16, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

function drawHUD(ctx, w, h, health, progress) {
  ctx.save();

  // Health Bar (Top Left)
  const barW = 120;
  const barH = 8;
  const barX = 16;
  const barY = h * 0.16;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.roundRect(barX, barY, barW, barH, 4);
  ctx.fill();

  const healthColor = health > 50 ? '#10B981' : health > 25 ? '#F59E0B' : '#EF4444';
  ctx.fillStyle = healthColor;
  ctx.roundRect(barX, barY, Math.max(0, barW * (health / 100)), barH, 4);
  ctx.fill();

  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 9px Outfit, sans-serif';
  ctx.fillText(`CHARIOT INTEGRITY: ${health}%`, barX, barY - 3);

  // Journey Progress Bar (Bottom Center)
  const progW = Math.min(260, w * 0.5);
  const progX = (w - progW) / 2;
  const progY = h * 0.82;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.roundRect(progX, progY, progW, 6, 3);
  ctx.fill();

  ctx.fillStyle = '#38BDF8';
  ctx.roundRect(progX, progY, progW * Math.min(1, progress), 6, 3);
  ctx.fill();

  ctx.fillStyle = '#E0F2FE';
  ctx.font = 'bold 9px Outfit, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SACRED GHAT APPROACH', w / 2, progY - 4);

  ctx.restore();
}
