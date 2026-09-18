import React, { useRef, useEffect, useCallback } from 'react';

export default function AartiAltar({
  phase, // 'AARTI' | 'BLESSING' | 'WHISPER'
  completedRotations, // 0, 1, 2, 3
  currentAngleProgress, // 0 to 1 of current circle
  onPositionUpdate, // callback (x, y, clientWidth, clientHeight)
  isBlessingActive,
}) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const imageRef = useRef(null);
  const imageLoadedRef = useRef(false);
  const particlesRef = useRef([]);
  const flameParticlesRef = useRef([]);
  const flowerParticlesRef = useRef([]);
  const thaliPosRef = useRef({ x: 0.5, y: 0.82 });
  const timeRef = useRef(0);

  // Load the Ganesha Aarti artwork
  useEffect(() => {
    const img = new Image();
    img.src = '/images/ganesha_aarti.jpg';
    img.onload = () => {
      imageRef.current = img;
      imageLoadedRef.current = true;
    };
  }, []);

  // Pointer position tracker
  const handlePointerMove = useCallback((e) => {
    if (phase !== 'AARTI') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY);
    if (clientX === undefined || clientY === undefined) return;

    const x = Math.max(0.05, Math.min(0.95, (clientX - rect.left) / rect.width));
    const y = Math.max(0.05, Math.min(0.95, (clientY - rect.top) / rect.height));

    thaliPosRef.current = { x, y };
    onPositionUpdate?.(x, y, rect.width, rect.height);

    // Spawn flame spark particles as thali moves
    if (Math.random() < 0.7) {
      flameParticlesRef.current.push({
        x: x * rect.width,
        y: y * rect.height - 18,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 3 - 1,
        life: 1.0,
        size: 3 + Math.random() * 4,
        color: Math.random() < 0.5 ? '#FBBF24' : '#F59E0B',
      });
    }
  }, [phase, onPositionUpdate]);

  const propsRef = useRef({ phase, completedRotations, currentAngleProgress, isBlessingActive });
  useEffect(() => {
    propsRef.current = { phase, completedRotations, currentAngleProgress, isBlessingActive };
  }, [phase, completedRotations, currentAngleProgress, isBlessingActive]);

  // Main Canvas Render Loop - Lag-Free Uninterrupted 60 FPS
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
        phase: curPhase,
        completedRotations: curRotations,
        currentAngleProgress: curAngleProg,
        isBlessingActive: curBlessingActive
      } = propsRef.current;

      ctx.save();
      ctx.scale(dpr, dpr);

      // 1. Dark Temple Sanctum Background
      drawSanctumBackground(ctx, w, h, t);

      // 2. Lord Ganesha Murti with Radiant Divine Halo
      const cx = w * 0.5;
      const cy = h * 0.44;
      const murtiSize = Math.min(w * 0.72, h * 0.58);

      drawDivineHalo(ctx, cx, cy, murtiSize, t, curRotations, curBlessingActive);

      if (imageLoadedRef.current && imageRef.current) {
        drawGaneshaMurti(ctx, imageRef.current, cx, cy, murtiSize, t, curBlessingActive);
      }

      // 3. Sacred Circular Aarti Guide Orbit Track
      if (curPhase === 'AARTI') {
        const orbitRadius = murtiSize * 0.62;
        drawAartiTrack(ctx, cx, cy, orbitRadius, curRotations, curAngleProg, t);
      }

      // 4. Blessing Rays & Pushpanjali Flower Shower
      if (curBlessingActive || curPhase === 'BLESSING' || curPhase === 'WHISPER') {
        drawBlessingLightRays(ctx, cx, cy, w, h, t);
        updateAndDrawPushpanjaliFlowers(ctx, w, h, flowerParticlesRef.current);
      }

      // 5. Interactive Aarti Thali (Camphor Diya, Bell, Flowers)
      if (curPhase === 'AARTI') {
        const thaliX = thaliPosRef.current.x * w;
        const thaliY = thaliPosRef.current.y * h;
        drawAartiThali(ctx, thaliX, thaliY, t);
      }

      // 6. Flame Sparks & Smoke
      updateAndDrawFlameSparks(ctx, flameParticlesRef.current);

      ctx.restore();
      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        touchAction: 'none',
        userSelect: 'none',
      }}
      onPointerDown={handlePointerMove}
      onPointerMove={handlePointerMove}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: phase === 'AARTI' ? 'grab' : 'default',
        }}
      />
    </div>
  );
}

// ─── HIGH-AESTHETIC DRAWING ROUTINES ───

function drawSanctumBackground(ctx, w, h, t) {
  // Rich Garbhagriha ambient darkness
  const grad = ctx.createRadialGradient(w * 0.5, h * 0.45, 60, w * 0.5, h * 0.45, Math.max(w, h) * 0.75);
  grad.addColorStop(0, '#260B12');
  grad.addColorStop(0.5, '#150308');
  grad.addColorStop(1, '#080103');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Subtle altar floral border glow
  ctx.save();
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.08)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(16, 16, w - 32, h - 32);
  ctx.restore();
}

function drawDivineHalo(ctx, cx, cy, size, t, rotations, isBlessing) {
  ctx.save();
  const baseIntensity = isBlessing ? 1.0 : 0.35 + rotations * 0.22;
  const radius = size * 0.62;

  // Multi-layered golden prabhavali aura
  const grad = ctx.createRadialGradient(cx, cy, radius * 0.3, cx, cy, radius * 1.35);
  grad.addColorStop(0, `rgba(253, 230, 138, ${0.4 * baseIntensity})`);
  grad.addColorStop(0.4, `rgba(245, 158, 11, ${0.3 * baseIntensity})`);
  grad.addColorStop(0.8, `rgba(217, 119, 6, ${0.15 * baseIntensity})`);
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.35, 0, Math.PI * 2);
  ctx.fill();

  // Subtle rotating celestial light beams
  const beamCount = 16;
  ctx.strokeStyle = `rgba(254, 240, 138, ${0.12 * baseIntensity})`;
  ctx.lineWidth = 2;
  for (let i = 0; i < beamCount; i++) {
    const angle = (i * (Math.PI * 2) / beamCount) + t * 0.15;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * (radius * 1.4), cy + Math.sin(angle) * (radius * 1.4));
    ctx.stroke();
  }
  ctx.restore();
}

function drawGaneshaMurti(ctx, img, cx, cy, size, t, isBlessing) {
  ctx.save();
  const half = size / 2;

  // Gentle divine floating breath
  const floatY = Math.sin(t * 2) * 4;

  // Clip into arched temple frame
  ctx.beginPath();
  const topRadius = size * 0.15;
  ctx.roundRect(cx - half, cy - half + floatY, size, size, topRadius);
  ctx.clip();

  // Draw Ganesha Image
  ctx.drawImage(img, cx - half, cy - half + floatY, size, size);

  // Blessing golden celestial sheen
  if (isBlessing) {
    const sheen = Math.sin(t * 5) * 0.15 + 0.2;
    ctx.fillStyle = `rgba(254, 240, 138, ${sheen})`;
    ctx.fillRect(cx - half, cy - half + floatY, size, size);
  }

  ctx.restore();

  // Outer golden ornamental arch border
  ctx.save();
  ctx.strokeStyle = isBlessing ? '#FDE68A' : 'rgba(245, 158, 11, 0.7)';
  ctx.lineWidth = 3.5;
  ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.roundRect(cx - half, cy - half + floatY, size, size, size * 0.15);
  ctx.stroke();
  ctx.restore();
}

function drawAartiTrack(ctx, cx, cy, radius, rotations, angleProgress, t) {
  ctx.save();

  // Faint dotted guideline for the circular Aarti path
  ctx.strokeStyle = 'rgba(254, 240, 138, 0.25)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Active circular golden arc showing current rotation progress
  if (angleProgress > 0) {
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (angleProgress * Math.PI * 2);

    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 5;
    ctx.shadowColor = '#FDE68A';
    ctx.shadowBlur = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.stroke();
  }

  // Sacred Direction Indicator: Clockwise Arrow
  const arrowAngle = t * 1.8;
  const ax = cx + Math.cos(arrowAngle) * radius;
  const ay = cy + Math.sin(arrowAngle) * radius;
  ctx.fillStyle = '#FEF08A';
  ctx.shadowColor = '#F59E0B';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(ax, ay, 5.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawAartiThali(ctx, x, y, t) {
  ctx.save();
  const thaliRadius = 38;

  // Thali shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.arc(x, y + 8, thaliRadius, 0, Math.PI * 2);
  ctx.fill();

  // Brass Golden Thali Rim
  const rimGrad = ctx.createLinearGradient(x - thaliRadius, y - thaliRadius, x + thaliRadius, y + thaliRadius);
  rimGrad.addColorStop(0, '#FDE68A');
  rimGrad.addColorStop(0.3, '#D97706');
  rimGrad.addColorStop(0.7, '#FBBF24');
  rimGrad.addColorStop(1, '#92400E');

  ctx.fillStyle = rimGrad;
  ctx.beginPath();
  ctx.arc(x, y, thaliRadius, 0, Math.PI * 2);
  ctx.fill();

  // Inner brass plate engraving
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, thaliRadius - 7, 0, Math.PI * 2);
  ctx.stroke();

  // Decorative ring of fresh orange marigold blossoms
  const flowerCount = 8;
  for (let i = 0; i < flowerCount; i++) {
    const a = (i * Math.PI * 2) / flowerCount;
    const fx = x + Math.cos(a) * (thaliRadius - 13);
    const fy = y + Math.sin(a) * (thaliRadius - 13);
    ctx.fillStyle = i % 2 === 0 ? '#F97316' : '#EF4444';
    ctx.beginPath();
    ctx.arc(fx, fy, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Center Camphor Lamp (Aarti Diya)
  ctx.fillStyle = '#78350F';
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, Math.PI * 2);
  ctx.fill();

  // Flickering Divine Flame
  const flameWobbleX = Math.sin(t * 14) * 2;
  const flameWobbleY = Math.cos(t * 18) * 3;
  const flameH = 24 + Math.sin(t * 12) * 4;

  const flameGrad = ctx.createRadialGradient(x + flameWobbleX, y - 8 + flameWobbleY, 2, x, y - 10, flameH);
  flameGrad.addColorStop(0, '#FFFFFF');
  flameGrad.addColorStop(0.2, '#FEF08A');
  flameGrad.addColorStop(0.5, '#F59E0B');
  flameGrad.addColorStop(0.85, '#EF4444');
  flameGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

  ctx.fillStyle = flameGrad;
  ctx.shadowColor = '#F59E0B';
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.moveTo(x - 9, y - 2);
  ctx.quadraticCurveTo(x - 11, y - 16, x + flameWobbleX, y - flameH + flameWobbleY);
  ctx.quadraticCurveTo(x + 11, y - 16, x + 9, y - 2);
  ctx.closePath();
  ctx.fill();

  // Hand hint text
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = 'bold 10px Outfit, sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowBlur = 0;
  ctx.fillText('AARTI THALI', x, y + 26);

  ctx.restore();
}

function drawBlessingLightRays(ctx, cx, cy, w, h, t) {
  ctx.save();
  const rayCount = 18;
  for (let i = 0; i < rayCount; i++) {
    const angle = (i * (Math.PI * 2) / rayCount) + t * 0.25;
    const grad = ctx.createLinearGradient(cx, cy, cx + Math.cos(angle) * w, cy + Math.sin(angle) * h);
    grad.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
    grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.15)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle - 0.08) * w, cy + Math.sin(angle - 0.08) * h);
    ctx.lineTo(cx + Math.cos(angle + 0.08) * w, cy + Math.sin(angle + 0.08) * h);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function updateAndDrawPushpanjaliFlowers(ctx, w, h, flowers = []) {
  // Replenish flower shower
  if (flowers.length < 35) {
    flowers.push({
      x: Math.random() * w,
      y: -20,
      vx: (Math.random() - 0.5) * 1.5,
      vy: 1.5 + Math.random() * 2.5,
      rot: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.08,
      size: 7 + Math.random() * 8,
      color: Math.random() < 0.6 ? '#F97316' : '#EF4444',
    });
  }

  for (let i = flowers.length - 1; i >= 0; i--) {
    const f = flowers[i];
    f.x += f.vx;
    f.y += f.vy;
    f.rot += f.vRot;

    if (f.y > h + 30) {
      flowers.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(f.rot);
    ctx.fillStyle = f.color;
    ctx.shadowColor = f.color;
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.ellipse(0, 0, f.size, f.size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function updateAndDrawFlameSparks(ctx, sparks = []) {
  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i];
    s.x += s.vx;
    s.y += s.vy;
    s.life -= 0.04;

    if (s.life <= 0) {
      sparks.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.globalAlpha = s.life;
    ctx.fillStyle = s.color;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
