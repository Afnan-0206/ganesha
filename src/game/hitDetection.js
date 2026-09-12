import { TIMING_WINDOWS } from './gameConfig';

export function evaluateInput(currentAudioTime, activeGlyphs) {
  // Find all unhit glyphs that are within reasonable range
  const candidates = activeGlyphs.filter(g => !g.hit && !g.missed);
  if (candidates.length === 0) return null;

  // Find the glyph closest to the current authoritative audio time
  let closest = null;
  let minDiff = Infinity;

  for (const glyph of candidates) {
    const diff = Math.abs(currentAudioTime - glyph.targetTime);
    if (diff < minDiff) {
      minDiff = diff;
      closest = glyph;
    }
  }

  if (!closest) return null;

  const diffMs = minDiff * 1000;
  const rawDiff = (currentAudioTime - closest.targetTime) * 1000; // negative = early, positive = late

  if (diffMs <= TIMING_WINDOWS.PERFECT_MS) {
    closest.hit = true;
    closest.hitType = 'PERFECT';
    return {
      type: 'PERFECT',
      glyph: closest,
      diffMs,
      rawDiff
    };
  } else if (diffMs <= TIMING_WINDOWS.GOOD_MS) {
    closest.hit = true;
    closest.hitType = 'GOOD';
    return {
      type: 'GOOD',
      glyph: closest,
      diffMs,
      rawDiff
    };
  } else if (diffMs <= TIMING_WINDOWS.MISS_THRESHOLD_MS) {
    closest.missed = true;
    closest.hitType = 'MISS';
    return {
      type: 'MISS',
      glyph: closest,
      diffMs,
      rawDiff
    };
  }

  // If outside threshold, it's an off-beat press (does not trigger note miss immediately, or ghost hit)
  return null;
}

// Check for glyphs that travelled past the target line without player hitting them
export function checkMissedGlyphs(currentAudioTime, activeGlyphs) {
  const missed = [];
  const lateThreshold = TIMING_WINDOWS.GOOD_MS / 1000; // 120ms past target time

  for (const glyph of activeGlyphs) {
    if (!glyph.hit && !glyph.missed) {
      if (currentAudioTime - glyph.targetTime > lateThreshold) {
        glyph.missed = true;
        glyph.hitType = 'MISS';
        missed.push(glyph);
      }
    }
  }

  return missed;
}
