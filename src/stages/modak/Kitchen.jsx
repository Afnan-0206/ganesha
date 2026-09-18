import React, { useRef, useEffect } from 'react';

export default function Kitchen({
  bowlX,          // 0 to 1 normalized bowl position
  fallingItems,   // Array of { id, icon, x, y, isCorrect, isBad, caught, missed }
  catchEffects,   // Array of { x, y, type, time }
  recipe,         // Current recipe object
  caughtCorrect,  // Number of correct catches for current recipe
  catchTarget,    // Target catches needed
  steamPhase,     // null | 'steaming'
  steamProgress,  // 0 to 100
  comboCount,
  steamZone = { min: 40, max: 65 },
}) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);

  const propsRef = useRef({
    bowlX,
    fallingItems,
    catchEffects,
    recipe,
    caughtCorrect,
    catchTarget,
    steamPhase,
    steamProgress,
    comboCount,
    steamZone,
  });

  useEffect(() => {
    propsRef.current = {
      bowlX,
      fallingItems,
      catchEffects,
      recipe,
      caughtCorrect,
      catchTarget,
      steamPhase,
      steamProgress,
      comboCount,
      steamZone,
    };
  }, [bowlX, fallingItems, catchEffects, recipe, caughtCorrect, catchTarget, steamPhase, steamProgress, comboCount, steamZone]);

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

      const {
        bowlX: curBowlX,
        fallingItems: curFallingItems,
        catchEffects: curCatchEffects,
        recipe: curRecipe,
        caughtCorrect: curCaughtCorrect,
        catchTarget: curCatchTarget,
        steamPhase: curSteamPhase,
        steamProgress: curSteamProgress,
        comboCount: curComboCount,
        steamZone: curSteamZone,
      } = propsRef.current;

      ctx.save();
      ctx.scale(dpr, dpr);

      // Kitchen background
      drawKitchenBG(ctx, w, h, t);

      if (curSteamPhase === 'steaming') {
        drawSteamGauge(ctx, w, h, curSteamProgress, t, curSteamZone);
      } else {
        // Falling items
        if (curFallingItems) {
          curFallingItems.forEach(item => {
            if (item.caught || item.missed) return;
            drawFallingItem(ctx, item.x * w, item.y * h, item.icon, item.isCorrect, item.isBad, t);
          });
        }

        // Bowl
        drawBowl(ctx, curBowlX * w, h * 0.85, w, t);

        // Catch zone indicator
        drawCatchZone(ctx, curBowlX * w, h * 0.82, w);
      }

      // Catch effects
      if (curCatchEffects) {
        curCatchEffects.forEach(eff => {
          const age = t - eff.time;
          if (age < 0.8) {
            drawCatchEffect(ctx, eff.x * w, eff.y * h, eff.type, age);
          }
        });
      }

      // Recipe HUD overlay
      drawRecipeHUD(ctx, w, h, curRecipe, curCaughtCorrect, curCatchTarget);

      // Combo display
      if (curComboCount >= 3) {
        drawCombo(ctx, w, h, curComboCount, t);
      }

      ctx.restore();
      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
}

// ─── Drawing Functions ───

function drawKitchenBG(ctx, w, h, t) {
  // Warm kitchen gradient
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#2D080E');
  grad.addColorStop(0.6, '#1A0408');
  grad.addColorStop(1, '#0D0204');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Subtle brick pattern
  ctx.fillStyle = 'rgba(180, 83, 9, 0.04)';
  const brickW = 40, brickH = 20;
  for (let y = 0; y < h; y += brickH) {
    const offset = (Math.floor(y / brickH) % 2) * brickW * 0.5;
    for (let x = -offset; x < w; x += brickW) {
      ctx.fillRect(x + 1, y + 1, brickW - 2, brickH - 2);
    }
  }

  // Warm fire glow from bottom
  const fireGrad = ctx.createRadialGradient(w * 0.5, h, 30, w * 0.5, h, h * 0.4);
  fireGrad.addColorStop(0, `rgba(245, 158, 11, ${0.08 + Math.sin(t * 3) * 0.03})`);
  fireGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = fireGrad;
  ctx.fillRect(0, h * 0.5, w, h * 0.5);
}

function drawFallingItem(ctx, x, y, icon, isCorrect, isBad, t) {
  if (typeof x !== 'number' || isNaN(x) || typeof y !== 'number' || isNaN(y)) return;
  if (y < -50) return;

  ctx.save();
  ctx.translate(x, y);

  const rotation = Math.sin(t * 2.5 + (x * 0.02)) * 0.14;
  ctx.rotate(rotation);

  // Background aura badge
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  if (isCorrect) {
    ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(16, 185, 129, 0.7)';
    ctx.shadowBlur = 12;
  } else if (isBad) {
    ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(239, 68, 68, 0.7)';
    ctx.shadowBlur = 10;
  } else {
    ctx.fillStyle = 'rgba(245, 158, 11, 0.18)';
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
    ctx.lineWidth = 1;
    ctx.shadowColor = 'rgba(245, 158, 11, 0.3)';
    ctx.shadowBlur = 8;
  }
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Icon rendering with emoji fallback
  ctx.font = '28px system-ui, -apple-system, "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(icon, 0, 1);

  ctx.restore();
}

function drawBowl(ctx, x, y, w, t) {
  ctx.save();

  const bowlWidth = w * 0.12;
  const bowlHeight = 28;

  // Bowl shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(x, y + bowlHeight + 4, bowlWidth * 0.9, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Bowl body
  const bowlGrad = ctx.createLinearGradient(x - bowlWidth, y - bowlHeight, x + bowlWidth, y + bowlHeight);
  bowlGrad.addColorStop(0, '#CD853F');
  bowlGrad.addColorStop(0.5, '#8B4513');
  bowlGrad.addColorStop(1, '#654321');
  ctx.fillStyle = bowlGrad;

  ctx.beginPath();
  ctx.moveTo(x - bowlWidth, y - 5);
  ctx.quadraticCurveTo(x - bowlWidth * 0.8, y + bowlHeight, x, y + bowlHeight);
  ctx.quadraticCurveTo(x + bowlWidth * 0.8, y + bowlHeight, x + bowlWidth, y - 5);
  ctx.lineTo(x + bowlWidth, y - 10);
  ctx.lineTo(x - bowlWidth, y - 10);
  ctx.closePath();
  ctx.fill();

  // Rim highlight
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(x, y - 10, bowlWidth, 6, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Sacred Om on bowl
  ctx.fillStyle = 'rgba(212, 175, 55, 0.4)';
  ctx.font = '14px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ॐ', x, y + 8);

  ctx.restore();
}

function drawCatchZone(ctx, x, y, w) {
  ctx.save();
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.15)';
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(w, y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawCatchEffect(ctx, x, y, type, age) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, 1 - age * 1.5);

  const scale = 1 + age * 2;
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  if (type === 'correct') {
    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 14px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✓', 0, -10 - age * 30);
  } else if (type === 'wrong') {
    ctx.fillStyle = '#F87171';
    ctx.font = 'bold 14px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✕', 0, -10 - age * 30);
  } else if (type === 'bad') {
    ctx.fillStyle = '#EF4444';
    ctx.font = 'bold 12px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('−5', 0, -10 - age * 40);
  }

  ctx.restore();
}

function drawRecipeHUD(ctx, w, h, recipe, caught, target) {
  if (!recipe) return;
  ctx.save();

  // Recipe card background
  const cardW = Math.min(280, w * 0.6);
  const cardH = 36;
  const cardX = (w - cardW) / 2;
  const cardY = 8;

  ctx.fillStyle = 'rgba(26, 4, 8, 0.85)';
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 10);
  ctx.fill();
  ctx.stroke();

  // Recipe name
  ctx.fillStyle = '#FDE68A';
  ctx.font = 'bold 11px Outfit, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`${recipe.icon} ${recipe.name}`, cardX + 10, cardY + 15);

  // Progress bar
  const barX = cardX + 10;
  const barY = cardY + 22;
  const barW = cardW - 20;
  const barH = 6;
  const progress = Math.min(1, caught / target);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW, barH, 3);
  ctx.fill();

  ctx.fillStyle = progress >= 1 ? '#10B981' : '#F59E0B';
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW * progress, barH, 3);
  ctx.fill();

  // Counter
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 10px Outfit, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`${caught}/${target}`, cardX + cardW - 10, cardY + 15);

  ctx.restore();
}

function drawSteamGauge(ctx, w, h, progress, t, steamZone) {
  ctx.save();

  // Steamer visual
  const cx = w / 2;
  const cy = h * 0.4;

  // Steam clouds
  for (let i = 0; i < 8; i++) {
    const sx = cx + Math.sin(t * 2 + i * 1.5) * 40;
    const sy = cy - 30 - i * 15 - Math.sin(t * 3 + i) * 10;
    const opacity = Math.max(0, 0.4 - i * 0.04);
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.beginPath();
    ctx.arc(sx, sy, 10 + Math.sin(t + i) * 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Steamer pot
  ctx.fillStyle = '#654321';
  ctx.beginPath();
  ctx.roundRect(cx - 60, cy, 120, 80, [0, 0, 15, 15]);
  ctx.fill();
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Lid
  ctx.fillStyle = '#8B4513';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 65, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#D4AF37';
  ctx.stroke();

  // Handle
  ctx.fillStyle = '#D4AF37';
  ctx.beginPath();
  ctx.arc(cx, cy - 16, 8, 0, Math.PI * 2);
  ctx.fill();

  // Gauge bar
  const gaugeY = h * 0.72;
  const gaugeW = w * 0.65;
  const gaugeX = (w - gaugeW) / 2;
  const gaugeH = 28;

  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.beginPath();
  ctx.roundRect(gaugeX, gaugeY, gaugeW, gaugeH, 14);
  ctx.fill();
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Dynamic Golden Zone from difficulty tier
  const minFrac = (steamZone?.min ?? 40) / 100;
  const maxFrac = (steamZone?.max ?? 65) / 100;
  const zoneStartX = gaugeX + gaugeW * minFrac;
  const zoneWidth = gaugeW * (maxFrac - minFrac);

  ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
  ctx.fillRect(zoneStartX, gaugeY, zoneWidth, gaugeH);
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(zoneStartX, gaugeY);
  ctx.lineTo(zoneStartX, gaugeY + gaugeH);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(zoneStartX + zoneWidth, gaugeY);
  ctx.lineTo(zoneStartX + zoneWidth, gaugeY + gaugeH);
  ctx.stroke();

  // Golden zone inner glow
  const glowGrad = ctx.createLinearGradient(zoneStartX, gaugeY, zoneStartX + zoneWidth, gaugeY);
  glowGrad.addColorStop(0, 'rgba(253, 230, 138, 0.15)');
  glowGrad.addColorStop(0.5, 'rgba(253, 230, 138, 0.35)');
  glowGrad.addColorStop(1, 'rgba(253, 230, 138, 0.15)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(zoneStartX, gaugeY + 2, zoneWidth, gaugeH - 4);

  // Needle
  const needleX = gaugeX + (progress / 100) * gaugeW;
  ctx.fillStyle = '#FFF';
  ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
  ctx.shadowBlur = 8;
  ctx.fillRect(needleX - 2, gaugeY - 2, 4, gaugeH + 4);
  ctx.shadowBlur = 0;

  // Label
  ctx.fillStyle = '#FDE68A';
  ctx.font = 'bold 11px Outfit, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('LIFT LID IN GOLDEN ZONE', w / 2, gaugeY - 10);

  ctx.restore();
}

function drawCombo(ctx, w, h, count, t) {
  ctx.save();
  const pulse = Math.sin(t * 6) * 0.1 + 1.0;
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = '#FBBF24';
  ctx.font = `bold ${14 * pulse}px Outfit, sans-serif`;
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(245, 158, 11, 0.8)';
  ctx.shadowBlur = 10;
  ctx.fillText(`COMBO ×${count}`, w / 2, h * 0.15);
  ctx.shadowBlur = 0;
  ctx.restore();
}
