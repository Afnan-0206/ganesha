import React, { useRef, useEffect, useState, useCallback } from 'react';
import { unlockAudio } from '../audio/audioContext';
import { startCinematicAudio, stopCinematicAudio } from '../audio/cinematicAudio';

export default function CinematicOpening({ onComplete }) {
  const canvasRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const audioStopRef = useRef(null);

  const handleFinish = useCallback(() => {
    if (audioStopRef.current) {
      audioStopRef.current();
    } else {
      stopCinematicAudio();
    }
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    let active = true;

    const start = async () => {
      await unlockAudio();
      if (!active) return;
      audioStopRef.current = startCinematicAudio(
        (t) => {
          if (active) setCurrentTime(t);
        },
        () => {
          if (active) handleFinish();
        }
      );
    };

    start();

    return () => {
      active = false;
      if (audioStopRef.current) audioStopRef.current();
      else stopCinematicAudio();
    };
  }, [handleFinish]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const render = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const dpr = window.devicePixelRatio || 1;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const t = currentTime;
      const safeCX = width * 0.5;
      const safeCY = height * 0.5;

      // ----------------------------------------------------
      // SCENE RENDERING BASED ON STORYBOARD TIMELINE (0s - 20s)
      // ----------------------------------------------------

      if (t < 3.0) {
        // [0s - 3s] Scene 1: The First Diya & Dawn
        drawScene1TheFirstDiya(ctx, width, height, safeCX, safeCY, t);
      } else if (t < 6.0) {
        // [3s - 6s] Scene 2: The Neighborhood Wakes & Rangoli
        drawScene2NeighborhoodWakes(ctx, width, height, safeCX, safeCY, t - 3.0);
      } else if (t < 9.0) {
        // [6s - 9s] Scene 3: Festival Montage (Modak, Dhol, Lamps, Flags)
        drawScene3FestivalMontage(ctx, width, height, safeCX, safeCY, t - 6.0);
      } else if (t < 12.0) {
        // [9s - 12s] Scene 4: Peaceful Presence of Ganesha
        drawScene4PeacefulGanesha(ctx, width, height, safeCX, safeCY, t - 9.0);
      } else if (t < 15.0) {
        // [12s - 15s] Scene 5: The Five Vighnas Emerge into Mandala
        drawScene5FiveVighnas(ctx, width, height, safeCX, safeCY, t - 12.0);
      } else if (t < 18.0) {
        // [15s - 18s] Scene 6: Golden Glow Expands & Title Reveal "PANCH VIGHNA"
        drawScene6TitleReveal(ctx, width, height, safeCX, safeCY, t - 15.0);
      } else {
        // [18s - 20s] Scene 7: Subtitle "GANPATI BAPPA MORAYA" & Fade to Game
        drawScene7FinalFade(ctx, width, height, safeCX, safeCY, t - 18.0);
      }

      // Environmental floating golden marigold particles
      drawFloatingParticles(ctx, width, height, t);

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [currentTime]);

  const progressPercent = Math.min(100, (currentTime / 20.0) * 100);

  return (
    <div className="cinematic-container">
      <div className="cinematic-viewport">
        <canvas ref={canvasRef} className="cinematic-canvas" />

        {/* UI Overlay */}
        <div className="cinematic-ui-overlay">
          <div className="cinematic-top-bar">
            <span className="cinematic-badge">✦ NIAT FESTIVAL CINEMATIC ✦</span>
            <button className="btn-skip-cinematic" onClick={handleFinish}>
              <span>SKIP INTRO</span>
              <span>⏭</span>
            </button>
          </div>

          <div className="cinematic-bottom-bar">
            <div className="cinematic-progress-track">
              <div
                className="cinematic-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="cinematic-time-label">
              {currentTime.toFixed(1)}s / 20.0s
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// SCENE 1 (0–3s): The First Diya in Dawn Darkness
// -----------------------------------------------------------------------------
function drawScene1TheFirstDiya(ctx, width, height, cx, cy, t) {
  // Deep warm maroon void fading into amber glow
  const bgGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(width, height) * 0.7);
  bgGrad.addColorStop(0, '#2B070D');
  bgGrad.addColorStop(0.6, '#1A0408');
  bgGrad.addColorStop(1, '#0C0103');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  const zoom = 1.0 + (t / 3.0) * 0.15;
  const flameAlpha = Math.min(1.0, t * 0.8);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(zoom, zoom);

  // Soft Diya Aura
  const auraR = 60 + Math.sin(t * 8) * 6 + t * 40;
  const aura = ctx.createRadialGradient(0, 0, 5, 0, 0, auraR);
  aura.addColorStop(0, `rgba(251, 191, 36, ${0.7 * flameAlpha})`);
  aura.addColorStop(0.4, `rgba(245, 158, 11, ${0.35 * flameAlpha})`);
  aura.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, 0, auraR, 0, Math.PI * 2);
  ctx.fill();

  // Brass Diya Lamp Vessel
  ctx.fillStyle = '#B88E1B';
  ctx.beginPath();
  ctx.ellipse(0, 26, 32, 12, 0, 0, Math.PI);
  ctx.fill();

  // Diya Flame Core
  const flameFlicker = Math.sin(t * 14) * 3;
  ctx.fillStyle = '#FFFBEB';
  ctx.beginPath();
  ctx.moveTo(0, 22);
  ctx.quadraticCurveTo(12, 10, 0 + flameFlicker, -18);
  ctx.quadraticCurveTo(-12, 10, 0, 22);
  ctx.fill();

  // Marigold Petals revealed around diya as camera pulls back
  if (t > 1.2) {
    const revealAlpha = Math.min(1.0, (t - 1.2) * 0.9);
    ctx.save();
    ctx.globalAlpha = revealAlpha;
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const px = Math.cos(angle) * 75;
      const py = Math.sin(angle) * 55 + 26;
      ctx.fillStyle = i % 2 === 0 ? '#F59E0B' : '#E65100';
      ctx.beginPath();
      ctx.ellipse(px, py, 10, 6, angle, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Narrative Text
  if (t > 0.8) {
    const textAlpha = Math.min(1.0, (t - 0.8) * 1.2);
    ctx.font = '500 13px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = `rgba(253, 230, 138, ${textAlpha * 0.9})`;
    ctx.fillText('A sacred dawn awakens...', 0, 120);
  }

  ctx.restore();
}

// -----------------------------------------------------------------------------
// SCENE 2 (3–6s): The Neighborhood Wakes & Rangoli
// -----------------------------------------------------------------------------
function drawScene2NeighborhoodWakes(ctx, width, height, cx, cy, t) {
  // Morning sunlight sweeping in
  const dawnGrad = ctx.createLinearGradient(0, 0, width, height);
  dawnGrad.addColorStop(0, '#3D0A13');
  dawnGrad.addColorStop(0.5, '#57121E');
  dawnGrad.addColorStop(1, '#26050B');
  ctx.fillStyle = dawnGrad;
  ctx.fillRect(0, 0, width, height);

  // Sunlight ray sweep
  const sunAlpha = Math.min(0.45, t * 0.15);
  ctx.save();
  const rayGrad = ctx.createRadialGradient(cx * 0.2, 0, 10, cx, cy, Math.max(width, height));
  rayGrad.addColorStop(0, `rgba(253, 230, 138, ${sunAlpha})`);
  rayGrad.addColorStop(0.6, `rgba(245, 158, 11, ${sunAlpha * 0.3})`);
  rayGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = rayGrad;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  // Draw Intricate Sacred Floral Rangoli being completed
  ctx.save();
  ctx.translate(cx, cy + 20);
  const rangoliScale = Math.min(1.0, 0.7 + t * 0.1);
  ctx.scale(rangoliScale, rangoliScale);

  // Concentric Rangoli Petal Rings
  const petals = 16;
  for (let ring = 3; ring >= 1; ring--) {
    const rRadius = ring * 42;
    for (let i = 0; i < petals; i++) {
      const angle = (i / petals) * Math.PI * 2 + (t * 0.05 * (ring % 2 === 0 ? 1 : -1));
      const px = Math.cos(angle) * rRadius;
      const py = Math.sin(angle) * (rRadius * 0.75); // isometric tilt

      ctx.fillStyle = ring === 3 ? '#E65100' : ring === 2 ? '#F59E0B' : '#FFFDF5';
      ctx.beginPath();
      ctx.ellipse(px, py, 12, 6, angle, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Central Lotus Core
  ctx.fillStyle = '#FF7700';
  ctx.beginPath();
  ctx.ellipse(0, 0, 22, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FDE68A';
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Pandal Fabric Curtains swaying in dawn breeze
  ctx.save();
  const breeze = Math.sin(t * 3.5) * 12;
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.65)';
  ctx.lineWidth = 3;
  ctx.fillStyle = 'rgba(120, 27, 43, 0.55)';

  // Left drapery
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(width * 0.15 + breeze, height * 0.4, 0, height);
  ctx.lineTo(0, 0);
  ctx.fill();
  ctx.stroke();

  // Right drapery
  ctx.beginPath();
  ctx.moveTo(width, 0);
  ctx.quadraticCurveTo(width * 0.85 - breeze, height * 0.4, width, height);
  ctx.lineTo(width, 0);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Scene Caption
  ctx.font = '700 16px "Cinzel Decorative", serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(253, 230, 138, 0.95)';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 8;
  ctx.fillText('THE NEIGHBORHOOD WAKES IN CELEBRATION', cx, height * 0.88);
}

// -----------------------------------------------------------------------------
// SCENE 3 (6–9s): Fast Elegant Festive Montage
// -----------------------------------------------------------------------------
function drawScene3FestivalMontage(ctx, width, height, cx, cy, t) {
  // Vibrant Festive Saffron & Maroon Palette
  ctx.fillStyle = '#3D0A13';
  ctx.fillRect(0, 0, width, height);

  // Sub-montage index (0 to 2 across 3 seconds)
  const subIndex = Math.floor(t);
  const subT = t % 1.0;

  ctx.save();

  if (subIndex === 0) {
    // 6–7s: Fresh Steaming Modaks Prepared
    ctx.translate(cx, cy);
    const mScale = 1.0 + Math.sin(subT * Math.PI) * 0.08;
    ctx.scale(mScale, mScale);

    // Banana leaf platter
    ctx.fillStyle = '#2E7D32';
    ctx.beginPath();
    ctx.ellipse(0, 30, 140, 50, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1B5E20';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 5 Sacred Golden Modaks
    const modakPositions = [
      { x: 0, y: 15, scale: 1.1 },
      { x: -55, y: 22, scale: 0.85 },
      { x: 55, y: 22, scale: 0.85 },
      { x: -30, y: -2, scale: 0.9 },
      { x: 30, y: -2, scale: 0.9 }
    ];

    modakPositions.forEach(mp => {
      drawSingleModak(ctx, mp.x, mp.y, mp.scale);
    });

    // Gentle Steam Wisp
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    for (let s = -1; s <= 1; s++) {
      ctx.beginPath();
      ctx.moveTo(s * 25, -20);
      ctx.bezierCurveTo(
        s * 25 + Math.sin(subT * 8) * 8, -45,
        s * 25 - Math.sin(subT * 8) * 8, -70,
        s * 25, -95
      );
      ctx.stroke();
    }

    ctx.font = '800 16px "Cinzel Decorative", serif';
    ctx.fillStyle = 'var(--marigold-300)';
    ctx.textAlign = 'center';
    ctx.fillText('FRESH SACRED OFFERINGS', 0, 120);

  } else if (subIndex === 1) {
    // 7–8s: Dhols Being Readied
    ctx.translate(cx, cy);
    const dholBeat = Math.sin(subT * Math.PI * 4) * 4;

    // Twin-headed festival Dhol drum
    ctx.fillStyle = '#B45309';
    ctx.beginPath();
    ctx.ellipse(0, 0, 110, 60, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Drum Rim & Lacing
    ctx.strokeStyle = '#FDE68A';
    ctx.lineWidth = 2.5;
    for (let i = -4; i <= 4; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 22, -55);
      ctx.lineTo(i * 22 + (i % 2 === 0 ? 12 : -12), 55);
      ctx.stroke();
    }

    // Festive Red Ribbon
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-110, dholBeat);
    ctx.lineTo(110, -dholBeat);
    ctx.stroke();

    ctx.font = '800 16px "Cinzel Decorative", serif';
    ctx.fillStyle = 'var(--marigold-300)';
    ctx.textAlign = 'center';
    ctx.fillText('THE DHOL AWAITS THE FIRST BEAT', 0, 115);

  } else {
    // 8–9s: Festive Saffron Flags & Lamps Fluttering
    ctx.translate(cx, cy);
    for (let f = -2; f <= 2; f++) {
      const fx = f * 70;
      const wave = Math.sin(subT * 10 + f) * 12;

      // Bamboo staff
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(fx, -60);
      ctx.lineTo(fx, 60);
      ctx.stroke();

      // Saffron pennant flag
      ctx.fillStyle = '#FF7700';
      ctx.beginPath();
      ctx.moveTo(fx, -60);
      ctx.quadraticCurveTo(fx + 35 + wave, -40, fx + 55 + wave, -30);
      ctx.lineTo(fx, -10);
      ctx.closePath();
      ctx.fill();
    }

    ctx.font = '800 16px "Cinzel Decorative", serif';
    ctx.fillStyle = 'var(--marigold-300)';
    ctx.textAlign = 'center';
    ctx.fillText('THE PANDAL SHINES IN EMBERS', 0, 115);
  }

  ctx.restore();
}

function drawSingleModak(ctx, x, y, scale = 1.0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Steamed rice flour / golden saffron dough
  ctx.fillStyle = '#FDE68A';
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(0, -32); // Top pinched finial
  ctx.bezierCurveTo(16, -18, 24, 0, 20, 16);
  ctx.bezierCurveTo(14, 26, -14, 26, -20, 16);
  ctx.bezierCurveTo(-24, 0, -16, -18, 0, -32);
  ctx.fill();
  ctx.stroke();

  // Delicate fold flutes
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 1;
  [-10, 0, 10].forEach(fx => {
    ctx.beginPath();
    ctx.moveTo(0, -28);
    ctx.quadraticCurveTo(fx * 0.7, -5, fx, 20);
    ctx.stroke();
  });

  // Saffron Strand on top
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -32);
  ctx.lineTo(2, -37);
  ctx.stroke();

  ctx.restore();
}

// -----------------------------------------------------------------------------
// SCENE 4 (9–12s): Calm, Respectful Glimpse of Ganesha
// -----------------------------------------------------------------------------
function drawScene4PeacefulGanesha(ctx, width, height, cx, cy, t) {
  // Sacred Golden & Deep Maroon Atmosphere
  const bgGrad = ctx.createRadialGradient(cx, cy * 0.9, 20, cx, cy, Math.max(width, height) * 0.7);
  bgGrad.addColorStop(0, '#57121E');
  bgGrad.addColorStop(0.5, '#3D0A13');
  bgGrad.addColorStop(1, '#1A0408');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.translate(cx, cy * 0.95);

  // Expansive Radiant Golden Prabhavali (Halo)
  const haloR = 120 + Math.sin(t * 3) * 6;
  const halo = ctx.createRadialGradient(0, -20, 10, 0, -20, haloR);
  halo.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
  halo.addColorStop(0.4, 'rgba(245, 158, 11, 0.55)');
  halo.addColorStop(0.8, 'rgba(212, 175, 55, 0.2)');
  halo.addColorStop(1, 'transparent');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, -20, haloR, 0, Math.PI * 2);
  ctx.fill();

  // Prabhavali rays
  ctx.strokeStyle = 'rgba(253, 230, 138, 0.4)';
  ctx.lineWidth = 1.5;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 12) {
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 75, -20 + Math.sin(a) * 75);
    ctx.lineTo(Math.cos(a) * (haloR - 10), -20 + Math.sin(a) * (haloR - 10));
    ctx.stroke();
  }

  // Reverent, Peaceful, Dignified Silhouette
  ctx.fillStyle = '#26050B';
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 2;

  // Crown (Mukut)
  ctx.beginPath();
  ctx.moveTo(0, -95);
  ctx.lineTo(16, -65);
  ctx.lineTo(12, -45);
  ctx.lineTo(-12, -45);
  ctx.lineTo(-16, -65);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Head & Cheeks
  ctx.beginPath();
  ctx.ellipse(0, -32, 28, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Large Peaceful Ears (Supakarna)
  ctx.beginPath();
  ctx.ellipse(-34, -36, 16, 22, -0.3, 0, Math.PI * 2);
  ctx.ellipse(34, -36, 16, 22, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Gentle Trunk (Curving peacefully to the left holding modak)
  ctx.beginPath();
  ctx.moveTo(0, -25);
  ctx.bezierCurveTo(-6, 0, -20, 12, -28, 0);
  ctx.bezierCurveTo(-34, -8, -26, -14, -20, -10);
  ctx.lineWidth = 8;
  ctx.stroke();

  // Sacred Tilak & Trishula Mark on Forehead
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.arc(0, -38, 3, 0, Math.PI * 2);
  ctx.fill();

  // Dignified Seated Torso
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 35, 48, 38, 0, 0, Math.PI);
  ctx.fill();
  ctx.stroke();

  // Sacred Modak in Left Hand
  ctx.fillStyle = '#FBBF24';
  ctx.beginPath();
  ctx.arc(-26, -8, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Serene Caption
  ctx.font = '500 14px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(253, 230, 138, 0.95)';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 6;
  ctx.fillText('AT THE SACRED HEART OF THE FESTIVAL', cx, height * 0.88);
}

// -----------------------------------------------------------------------------
// SCENE 5 (12–15s): The Five Vighnas Emerge into Circular Mandala
// -----------------------------------------------------------------------------
function drawScene5FiveVighnas(ctx, width, height, cx, cy, t) {
  // Sacred Mandala Background
  ctx.fillStyle = '#1F0308';
  ctx.fillRect(0, 0, width, height);

  const mandalaR = Math.min(width, height) * 0.28;
  const vighnas = [
    { title: 'RANGOLI', symbol: '🌸', color: '#EC4899', desc: 'Sacred Art' },
    { title: 'PANDAL', symbol: '🏛️', color: '#F59E0B', desc: 'The Pavilion' },
    { title: 'MODAK', symbol: '🏺', color: '#EAB308', desc: 'Sweet Devotion' },
    { title: 'DHOL', symbol: '🥁', color: '#F97316', desc: 'Rhythmic Pulse' },
    { title: 'VISARJAN', symbol: '🌊', color: '#38BDF8', desc: 'Sacred Immersion' }
  ];

  ctx.save();
  ctx.translate(cx, cy - 20);

  // Rotating golden mandala ring
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, mandalaR, 0, Math.PI * 2);
  ctx.stroke();

  // Five Vighnas positioned evenly in circular mandala (72 deg apart)
  vighnas.forEach((v, idx) => {
    const angle = (idx / 5) * Math.PI * 2 - Math.PI * 0.5;
    const appearTime = idx * 0.45;
    const progress = Math.min(1.0, Math.max(0, (t - appearTime) * 2.0));

    if (progress > 0) {
      const dist = mandalaR * progress;
      const vx = Math.cos(angle) * dist;
      const vy = Math.sin(angle) * dist;

      ctx.save();
      ctx.translate(vx, vy);
      ctx.scale(progress, progress);

      // Emblem glow ring
      ctx.fillStyle = 'rgba(43, 8, 14, 0.85)';
      ctx.strokeStyle = v.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Icon & Name
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(v.symbol, 0, -2);

      ctx.font = '700 11px "Outfit", sans-serif';
      ctx.fillStyle = '#FFF';
      ctx.fillText(v.title, 0, 38);

      ctx.restore();
    }
  });

  ctx.restore();

  // Dramatic Typographic Reveal: "FIVE VIGHNAS" -> pause -> "ONE FESTIVAL"
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '900 24px "Cinzel Decorative", serif';
  ctx.fillStyle = 'var(--marigold-300)';
  ctx.shadowColor = 'rgba(245, 158, 11, 0.8)';
  ctx.shadowBlur = 12;

  if (t < 1.6) {
    ctx.fillText('FIVE VIGHNAS', cx, height * 0.88);
  } else {
    ctx.fillText('FIVE VIGHNAS • ONE FESTIVAL', cx, height * 0.88);
  }
  ctx.restore();
}

// -----------------------------------------------------------------------------
// SCENE 6 (15–18s): Diya Glow Expands & Title Reveal "PANCH VIGHNA"
// -----------------------------------------------------------------------------
function drawScene6TitleReveal(ctx, width, height, cx, cy, t) {
  // Golden Burst Expansion
  const burstProgress = Math.min(1.0, t / 1.5);
  const bgGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(width, height));
  bgGrad.addColorStop(0, '#57121E');
  bgGrad.addColorStop(0.5, '#3D0A13');
  bgGrad.addColorStop(1, '#1A0408');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Expanding Diya Flare
  const flareR = 40 + burstProgress * Math.max(width, height) * 0.7;
  const flare = ctx.createRadialGradient(cx, cy, 5, cx, cy, flareR);
  flare.addColorStop(0, 'rgba(255, 251, 235, 0.95)');
  flare.addColorStop(0.3, 'rgba(251, 191, 36, 0.65)');
  flare.addColorStop(0.7, 'rgba(212, 175, 55, 0.25)');
  flare.addColorStop(1, 'transparent');
  ctx.fillStyle = flare;
  ctx.beginPath();
  ctx.arc(cx, cy, flareR, 0, Math.PI * 2);
  ctx.fill();

  // Title: "PANCH VIGHNA"
  const titleAlpha = Math.min(1.0, (t - 0.4) * 1.5);
  if (titleAlpha > 0) {
    ctx.save();
    ctx.globalAlpha = titleAlpha;
    ctx.textAlign = 'center';

    // Sacred Auspicious Header
    ctx.font = '700 15px "Outfit", sans-serif';
    ctx.fillStyle = 'var(--gold-400)';
    ctx.letterSpacing = '4px';
    ctx.fillText('ॐ ✦ FIVE VIGHNAS • ONE FESTIVAL ✦ ॐ', cx, cy - 50);

    // Grand Illuminated Title
    ctx.font = '900 clamp(2.2rem, 6vw, 4.4rem) "Cinzel Decorative", serif';
    ctx.fillStyle = '#FFFDF5';
    ctx.shadowColor = 'rgba(245, 158, 11, 0.95)';
    ctx.shadowBlur = 24;
    ctx.fillText('PANCH VIGHNA', cx, cy + 15);

    ctx.restore();
  }
}

// -----------------------------------------------------------------------------
// SCENE 7 (18–20s): Subtitle "GANPATI BAPPA MORAYA" & Smooth Transition to Game
// -----------------------------------------------------------------------------
function drawScene7FinalFade(ctx, width, height, cx, cy, t) {
  // Rich Sacred Foundation
  ctx.fillStyle = '#26050B';
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.textAlign = 'center';

  // Title
  ctx.font = '900 clamp(2rem, 5.5vw, 4.2rem) "Cinzel Decorative", serif';
  ctx.fillStyle = '#FFFDF5';
  ctx.shadowColor = 'rgba(245, 158, 11, 0.9)';
  ctx.shadowBlur = 20;
  ctx.fillText('PANCH VIGHNA', cx, cy - 10);

  // Subtitle: "GANPATI BAPPA MORAYA"
  const subAlpha = Math.min(1.0, t * 1.5);
  ctx.globalAlpha = subAlpha;
  ctx.font = '700 clamp(1.1rem, 2.8vw, 1.8rem) "Rozha One", serif';
  ctx.fillStyle = 'var(--marigold-300)';
  ctx.shadowColor = 'rgba(251, 191, 36, 0.9)';
  ctx.shadowBlur = 14;
  ctx.fillText('GANPATI BAPPA MORAYA', cx, cy + 45);

  ctx.font = '500 13px "Outfit", sans-serif';
  ctx.fillStyle = 'var(--gold-400)';
  ctx.fillText('Entering the Sacred Festival...', cx, cy + 90);

  ctx.restore();

  // Final Crossfade to Start Screen
  if (t > 1.2) {
    const fadeOutAlpha = (t - 1.2) / 0.8;
    ctx.fillStyle = `rgba(38, 5, 11, ${fadeOutAlpha})`;
    ctx.fillRect(0, 0, width, height);
  }
}

// Floating Golden Marigold Petals (Environmental Particles)
function drawFloatingParticles(ctx, width, height, t) {
  ctx.save();
  for (let i = 0; i < 18; i++) {
    const seed = i * 137.5;
    const speed = 0.08 + (i % 5) * 0.03;
    const px = (seed + t * speed * 60) % width;
    const py = (seed * 1.5 + Math.sin(t * 2 + i) * 35) % height;
    const alpha = 0.25 + (Math.sin(t * 3 + i) + 1) * 0.2;

    ctx.fillStyle = i % 2 === 0 ? `rgba(245, 158, 11, ${alpha})` : `rgba(253, 230, 138, ${alpha})`;
    ctx.beginPath();
    ctx.ellipse(px, py, 4 + (i % 3), 2.5, (t + i) * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
