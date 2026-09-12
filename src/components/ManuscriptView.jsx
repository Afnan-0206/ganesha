import React, { useRef, useEffect } from 'react';

export default function ManuscriptView({
  activeGlyphs,
  flow,
  disorders,
  inscribedStrokes,
  activeStrokeAnimation,
  hitFeedbacks,
  currentAudioTime,
  isPaused,
  cantoIndex,
  combo,
  completionPercent
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const render = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      // High-DPI handling for crisp calligraphy
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // 1. Draw Ancient Handcrafted Birch-Bark (Bhojpatra) Folium Surface
      drawManuscriptFolium(ctx, width, height, flow);

      // 2. Dimensions & Margins
      const margins = getManuscriptMargins(width, height);
      drawManuscriptMargins(ctx, width, height, margins, flow, cantoIndex, completionPercent);

      // 3. Ruling Lines across the page
      const lines = getManuscriptLines(height, margins);
      drawRulingLines(ctx, margins, lines, flow);

      // 4. Calculate active writing line and character position
      const strokeCount = inscribedStrokes ? inscribedStrokes.length : 0;
      const charsPerLine = width < 600 ? 5 : 7;
      const activeLineIdx = Math.floor(strokeCount / charsPerLine) % lines.length;
      const activeCharIdx = strokeCount % charsPerLine;
      const activeLineY = lines[activeLineIdx];

      const xSpacing = (margins.right - margins.left - 60) / (charsPerLine - 1);
      const targetX = margins.left + 40 + (activeCharIdx * xSpacing);

      // 5. Draw Inscribed Permanent Calligraphy Strokes on the Page
      drawInscribedStrokes(ctx, margins, lines, inscribedStrokes, charsPerLine, xSpacing, flow);

      // 6. Draw Subtle Manuscript Disorders on Misses
      drawManuscriptDisorders(ctx, width, height, disorders, flow);

      // 7. Draw The Living Active Writing Baseline & Scribe's Golden Nib
      drawActiveWritingLine(ctx, margins, activeLineY, targetX, currentAudioTime, flow);

      // 8. Draw Approaching Calligraphic Glyphs along the golden thread
      drawCalligraphicGlyphStream(ctx, margins, activeLineY, targetX, activeGlyphs, currentAudioTime, flow);

      // 9. Draw Ink Absorption & Wet-to-Dry Stroke Animation on Current Hit
      if (activeStrokeAnimation) {
        drawActiveStrokeHit(ctx, targetX, activeLineY, activeStrokeAnimation);
      }

      // 10. Draw Hit Feedback Typography
      drawHitFeedbacks(ctx, width, height, hitFeedbacks);

      ctx.restore();

      if (!isPaused) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [activeGlyphs, flow, disorders, inscribedStrokes, activeStrokeAnimation, hitFeedbacks, currentAudioTime, isPaused, cantoIndex, combo, completionPercent]);

  return (
    <div className="manuscript-viewport">
      <canvas ref={canvasRef} className="manuscript-canvas" />
    </div>
  );
}

// Layout Dimensions Helper
function getManuscriptMargins(width, height) {
  const isMobile = width < 600;
  return {
    left: isMobile ? 32 : 56,
    right: isMobile ? width - 20 : width - 44,
    top: isMobile ? 32 : 44,
    bottom: height - 16
  };
}

function getManuscriptLines(height, margins) {
  const lineCount = 5;
  const availableH = margins.bottom - margins.top - 20;
  const spacing = availableH / (lineCount - 1);
  const lines = [];
  for (let i = 0; i < lineCount; i++) {
    lines.push(margins.top + 20 + i * spacing);
  }
  return lines;
}

// 1. Handcrafted Birch-Bark Folium Background
function drawManuscriptFolium(ctx, width, height, flow) {
  const grad = ctx.createLinearGradient(0, 0, width, height);
  if (flow >= 80) {
    // Pure Flow: warm golden radiant illumination
    grad.addColorStop(0, '#FFFDF5');
    grad.addColorStop(0.3, '#FAF2DB');
    grad.addColorStop(0.8, '#F4E7C4');
    grad.addColorStop(1, '#ECE0B4');
  } else if (flow >= 35) {
    // Steady: natural aged birch-bark
    grad.addColorStop(0, '#FAF5E8');
    grad.addColorStop(0.5, '#F3EBD4');
    grad.addColorStop(1, '#E6D7B4');
  } else {
    // Broken: darkened distressed birch bark
    grad.addColorStop(0, '#EAE1CE');
    grad.addColorStop(0.5, '#DECFA7');
    grad.addColorStop(1, '#D0BD8E');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Organic birch-bark fiber striations
  ctx.save();
  ctx.strokeStyle = 'rgba(146, 64, 14, 0.04)';
  ctx.lineWidth = 1;
  for (let y = 8; y < height; y += 13) {
    ctx.beginPath();
    ctx.moveTo(8, y);
    ctx.lineTo(width - 8, y);
    ctx.stroke();
  }
  ctx.restore();
}

// 2. Classical Hashiya Borders & Folio Margins
function drawManuscriptMargins(ctx, width, height, margins, flow, cantoIndex, completionPercent) {
  ctx.save();

  // Vermillion red (Sindoor) margin rule on the left
  ctx.strokeStyle = 'rgba(185, 28, 28, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(margins.left - 12, margins.top);
  ctx.lineTo(margins.left - 12, margins.bottom);
  ctx.stroke();

  // Secondary gold margin rule
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(margins.left - 8, margins.top);
  ctx.lineTo(margins.left - 8, margins.bottom);
  ctx.stroke();

  // Sacred Folio Header
  ctx.font = '700 11px "Outfit", sans-serif';
  ctx.fillStyle = '#854D0E';
  ctx.textAlign = 'left';
  ctx.fillText(`॥ FOLIO ${cantoIndex + 1} • EKADANTA-SAMHITA ॥`, margins.left, margins.top - 12);

  // Inscribed Percentage Badge
  ctx.textAlign = 'right';
  ctx.font = '800 11px "Outfit", sans-serif';
  ctx.fillStyle = flow >= 80 ? '#059669' : '#B45309';
  ctx.fillText(`MANUSCRIPT: ${completionPercent}% INSCRIBED`, margins.right, margins.top - 12);

  // Subtle Header Rule
  ctx.strokeStyle = 'rgba(184, 142, 27, 0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(margins.left, margins.top - 4);
  ctx.lineTo(margins.right, margins.top - 4);
  ctx.stroke();

  // Corner Filigree knots
  ctx.strokeStyle = flow >= 80 ? '#D4AF37' : '#B88E1B';
  ctx.lineWidth = 1.5;
  const cSize = 14;
  ctx.strokeRect(6, 6, cSize, cSize);
  ctx.strokeRect(width - 6 - cSize, 6, cSize, cSize);
  ctx.strokeRect(6, height - 6 - cSize, cSize, cSize);
  ctx.strokeRect(width - 6 - cSize, height - 6 - cSize, cSize, cSize);

  ctx.restore();
}

// 3. Manuscript Calligraphy Ruling Lines
function drawRulingLines(ctx, margins, lines, flow) {
  ctx.save();
  lines.forEach((lineY) => {
    ctx.strokeStyle = flow < 35 ? 'rgba(185, 28, 28, 0.25)' : 'rgba(146, 64, 14, 0.18)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.moveTo(margins.left, lineY);
    ctx.lineTo(margins.right, lineY);
    ctx.stroke();
    ctx.setLineDash([]);
  });
  ctx.restore();
}

// 4. Inscribed Permanent Calligraphy Strokes
function drawInscribedStrokes(ctx, margins, lines, inscribedStrokes, charsPerLine, xSpacing, flow) {
  if (!inscribedStrokes || inscribedStrokes.length === 0) return;

  const now = Date.now();
  const maxFolioStrokes = charsPerLine * lines.length;

  // Render recent folio strokes (loops if long play)
  const visibleStrokes = inscribedStrokes.slice(-maxFolioStrokes);

  // Group strokes by line for connected ligature bar (shirorekha)
  const strokesByLine = {};
  visibleStrokes.forEach((stroke, idx) => {
    const lineIdx = Math.floor(idx / charsPerLine) % lines.length;
    const charIdx = idx % charsPerLine;
    const sx = margins.left + 40 + (charIdx * xSpacing);
    const sy = lines[lineIdx];

    if (!strokesByLine[lineIdx]) strokesByLine[lineIdx] = [];
    strokesByLine[lineIdx].push({ ...stroke, sx, sy });
  });

  // Draw connected horizontal ligature header
  ctx.save();
  ctx.strokeStyle = flow >= 80 ? 'rgba(180, 83, 9, 0.85)' : 'rgba(32, 27, 29, 0.85)';
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';

  Object.values(strokesByLine).forEach(lineGroup => {
    if (lineGroup.length > 1) {
      const first = lineGroup[0];
      const last = lineGroup[lineGroup.length - 1];
      const topY = first.sy - 11;
      ctx.beginPath();
      ctx.moveTo(first.sx - 12, topY);
      ctx.lineTo(last.sx + 12, topY);
      ctx.stroke();
    }
  });

  // Draw each completed stroke
  visibleStrokes.forEach((stroke, idx) => {
    const lineIdx = Math.floor(idx / charsPerLine) % lines.length;
    const charIdx = idx % charsPerLine;
    const sx = margins.left + 40 + (charIdx * xSpacing);
    const sy = lines[lineIdx];

    const age = (now - stroke.time) / 1000;
    const isWet = age < 0.7;

    let inkColor = '#201B1D';
    if (isWet) {
      inkColor = stroke.isPerfect ? '#D97706' : '#92400E';
    } else if (flow >= 80) {
      inkColor = '#3B2F2F';
    }

    if (stroke.glyphData && typeof stroke.glyphData.drawCalligraphy === 'function') {
      stroke.glyphData.drawCalligraphy(ctx, sx, sy, 22, inkColor, isWet);
    }
  });

  ctx.restore();
}

// 5. Elegant Manuscript Disorders (Translucent smudges, broken line segments)
function drawManuscriptDisorders(ctx, width, height, disorders, flow) {
  if (!disorders || disorders.length === 0) return;

  ctx.save();
  disorders.forEach(d => {
    const dx = d.x * width;
    const dy = d.y * height;

    if (d.type === 'smear') {
      const smearGrad = ctx.createLinearGradient(dx - d.width * 0.5, dy, dx + d.width * 0.5, dy);
      smearGrad.addColorStop(0, 'rgba(74, 59, 50, 0)');
      smearGrad.addColorStop(0.5, `rgba(74, 59, 50, ${d.alpha})`);
      smearGrad.addColorStop(1, 'rgba(74, 59, 50, 0)');

      ctx.fillStyle = smearGrad;
      ctx.beginPath();
      ctx.ellipse(dx, dy, d.width * 0.5, d.height, d.angle || 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (d.type === 'broken_stroke') {
      ctx.strokeStyle = `rgba(185, 28, 28, ${d.alpha * 1.2})`;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(dx - 10, dy - 5);
      ctx.lineTo(dx + 8, dy + 6);
      ctx.stroke();
    } else {
      ctx.fillStyle = `rgba(32, 27, 29, ${d.alpha})`;
      ctx.beginPath();
      ctx.arc(dx, dy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  ctx.restore();
}

// 6. The Living Calligraphic Baseline & Scribe's Golden Nib
function drawActiveWritingLine(ctx, margins, lineY, targetX, currentAudioTime, flow) {
  ctx.save();

  // Fine golden guideline leading directly into the nib
  const guideGrad = ctx.createLinearGradient(targetX, lineY, margins.right, lineY);
  guideGrad.addColorStop(0, 'rgba(212, 175, 55, 0.95)');
  guideGrad.addColorStop(0.2, 'rgba(212, 175, 55, 0.5)');
  guideGrad.addColorStop(1, 'rgba(212, 175, 55, 0.12)');

  ctx.strokeStyle = guideGrad;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(targetX, lineY);
  ctx.lineTo(margins.right, lineY);
  ctx.stroke();

  // Beat pulse ring at the writing nib
  const beatPulse = (Math.sin(currentAudioTime * Math.PI * 3.5) + 1) * 0.5;
  const pulseR = 13 + beatPulse * 4;

  ctx.strokeStyle = flow >= 80 ? 'rgba(16, 185, 129, 0.75)' : 'rgba(212, 175, 55, 0.65)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(targetX, lineY, pulseR, 0, Math.PI * 2);
  ctx.stroke();

  // Scribe's Stylus Nib poised right on the baseline
  ctx.fillStyle = '#D4AF37';
  ctx.strokeStyle = '#92400E';
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(targetX, lineY - 15);
  ctx.lineTo(targetX + 7, lineY + 9);
  ctx.lineTo(targetX, lineY + 3);
  ctx.lineTo(targetX - 7, lineY + 9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Glistening Nib Tip
  ctx.fillStyle = flow >= 80 ? '#34D399' : '#FFFBEB';
  ctx.beginPath();
  ctx.arc(targetX, lineY, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// 7. Approaching Calligraphic Glyphs along the Golden Thread
function drawCalligraphicGlyphStream(ctx, margins, lineY, targetX, activeGlyphs, currentAudioTime, flow) {
  if (!activeGlyphs) return;

  activeGlyphs.forEach(glyph => {
    if (glyph.hit || (glyph.missed && currentAudioTime - glyph.targetTime > 0.4)) return;

    const timeRemaining = glyph.targetTime - currentAudioTime;
    const progress = 1.0 - (timeRemaining / glyph.travelDuration); // 0.0 to 1.0

    if (progress < 0 || progress > 1.25) return;

    const startX = margins.right;
    const currentX = startX - progress * (startX - targetX);
    
    // Wave motion for dynamic grace
    const waveY = lineY + Math.sin(progress * Math.PI * 2) * 3;

    let alpha = Math.min(1.0, progress * 3.5);
    if (glyph.missed) alpha = Math.max(0, 1.0 - (currentAudioTime - glyph.targetTime) * 3);

    ctx.save();
    ctx.globalAlpha = alpha;

    // Subtle golden halo guide (No heavy circular blobs!)
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(currentX, waveY, 16, 0, Math.PI * 2);
    ctx.stroke();

    // Render Calligraphic Shape
    const glyphColor = glyph.missed ? '#DC2626' : (flow >= 80 ? '#92400E' : '#201B1D');
    if (glyph.glyphData && typeof glyph.glyphData.drawCalligraphy === 'function') {
      glyph.glyphData.drawCalligraphy(ctx, currentX, waveY, 24, glyphColor, true);
    }

    ctx.restore();
  });
}

// 8. Active Stroke Animation (Golden Quill Flare on Hit)
function drawActiveStrokeHit(ctx, targetX, activeLineY, anim) {
  const age = (Date.now() - anim.time) / 1000;
  if (age > 0.35) return;

  const alpha = Math.max(0, 1.0 - age * 2.8);
  ctx.save();
  ctx.globalAlpha = alpha;

  const radius = 8 + age * 45;
  const bloomGrad = ctx.createRadialGradient(targetX, activeLineY, 2, targetX, activeLineY, radius);
  bloomGrad.addColorStop(0, 'rgba(253, 230, 138, 0.85)');
  bloomGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.4)');
  bloomGrad.addColorStop(1, 'rgba(212, 175, 55, 0)');

  ctx.fillStyle = bloomGrad;
  ctx.beginPath();
  ctx.arc(targetX, activeLineY, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// 9. Hit Feedback Typography
function drawHitFeedbacks(ctx, width, height, feedbacks) {
  if (!feedbacks || feedbacks.length === 0) return;

  feedbacks.forEach(fb => {
    const elapsed = (Date.now() - fb.time) / 1000;
    if (elapsed > 0.65) return;

    const alpha = Math.max(0, 1.0 - elapsed * 1.5);
    const y = height * 0.18 - (elapsed * 20);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = '800 16px "Cinzel Decorative", serif';
    ctx.textAlign = 'center';

    if (fb.type === 'PERFECT') {
      ctx.fillStyle = '#D97706';
      ctx.shadowColor = 'rgba(245, 158, 11, 0.8)';
      ctx.shadowBlur = 10;
      ctx.fillText('✦ PERFECT ✦', width * 0.5, y);
    } else if (fb.type === 'GOOD') {
      ctx.fillStyle = '#059669';
      ctx.shadowColor = 'rgba(16, 185, 129, 0.6)';
      ctx.shadowBlur = 8;
      ctx.fillText('GOOD', width * 0.5, y);
    } else if (fb.type === 'MISS') {
      ctx.fillStyle = '#DC2626';
      ctx.font = '700 13px "Outfit", sans-serif';
      ctx.fillText('INK FLOW UNSTABLE', width * 0.5, y);
    } else if (fb.type === 'FLOW RESTORED' || fb.type === 'UNSTOPPABLE FLOW') {
      ctx.fillStyle = '#B45309';
      ctx.shadowColor = 'rgba(251, 191, 36, 0.9)';
      ctx.shadowBlur = 14;
      ctx.fillText(`✦ ${fb.type} ✦`, width * 0.5, y);
    }

    ctx.restore();
  });
}
