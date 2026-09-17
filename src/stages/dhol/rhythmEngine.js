// Dhol Rhythm Highway — Beat Maps & Engine
// 3-lane rhythm game with scrolling beats

export const LANES = [
  { id: 'dha', label: 'DHA', key: 'KeyD', color: '#F59E0B', sound: 'dhol' },
  { id: 'tak', label: 'TAK', key: 'KeyF', color: '#EC4899', sound: 'tasha' },
  { id: 'chime', label: 'CHIME', key: 'KeyJ', color: '#38BDF8', sound: 'manjira' },
];

// Beat maps: array of { lane: 0|1|2, time: seconds from round start }
export const DHOL_ROUNDS = [
  {
    round: 1,
    title: 'The Awakening Pulse',
    bpm: 90,
    beats: [
      { lane: 0, time: 1.0 },
      { lane: 0, time: 2.0 },
      { lane: 1, time: 3.0 },
      { lane: 0, time: 4.0 },
      { lane: 0, time: 5.0 },
      { lane: 1, time: 6.0 },
      { lane: 0, time: 7.0 },
      { lane: 0, time: 7.5 },
    ],
  },
  {
    round: 2,
    title: 'Tasha Entry',
    bpm: 100,
    beats: [
      { lane: 0, time: 0.8 },
      { lane: 1, time: 1.4 },
      { lane: 0, time: 2.0 },
      { lane: 1, time: 2.6 },
      { lane: 0, time: 3.2 },
      { lane: 0, time: 3.8 },
      { lane: 1, time: 4.4 },
      { lane: 2, time: 5.0 },
      { lane: 0, time: 5.6 },
      { lane: 1, time: 6.2 },
    ],
  },
  {
    round: 3,
    title: 'Procession March',
    bpm: 120,
    beats: [
      { lane: 0, time: 0.6 },
      { lane: 1, time: 1.0 },
      { lane: 1, time: 1.4 },
      { lane: 0, time: 1.8 },
      { lane: 2, time: 2.2 },
      { lane: 0, time: 2.6 },
      { lane: 1, time: 3.0 },
      { lane: 0, time: 3.4 },
      { lane: 1, time: 3.8 },
      { lane: 2, time: 4.2 },
      { lane: 0, time: 4.6 },
      { lane: 0, time: 5.0 },
    ],
  },
  {
    round: 4,
    title: 'Manjira Syncopation',
    bpm: 130,
    beats: [
      { lane: 0, time: 0.5 },
      { lane: 0, time: 0.9 },
      { lane: 1, time: 1.3 },
      { lane: 2, time: 1.7 },
      { lane: 0, time: 2.1 },
      { lane: 2, time: 2.3 },
      { lane: 1, time: 2.7 },
      { lane: 0, time: 3.1 },
      { lane: 1, time: 3.5 },
      { lane: 2, time: 3.7 },
      { lane: 0, time: 4.1 },
      { lane: 0, time: 4.5 },
      { lane: 1, time: 4.9 },
      { lane: 2, time: 5.3 },
    ],
  },
  {
    round: 5,
    title: 'Grand Procession Crescendo',
    bpm: 150,
    beats: [
      { lane: 0, time: 0.4 },
      { lane: 1, time: 0.7 },
      { lane: 0, time: 1.0 },
      { lane: 1, time: 1.3 },
      { lane: 2, time: 1.6 },
      { lane: 0, time: 1.9 },
      { lane: 2, time: 2.1 },
      { lane: 1, time: 2.4 },
      { lane: 0, time: 2.7 },
      { lane: 1, time: 3.0 },
      { lane: 0, time: 3.3 },
      { lane: 2, time: 3.5 },
      { lane: 0, time: 3.8 },
      { lane: 1, time: 4.1 },
      { lane: 0, time: 4.4 },
      { lane: 2, time: 4.6 },
      { lane: 0, time: 4.9 },
      { lane: 0, time: 5.2 },
    ],
  },
];

// Timing windows
export const TIMING = {
  PERFECT: 0.08,  // ±80ms
  GOOD: 0.15,     // ±150ms
  MISS_WINDOW: 0.25, // After this, beat is missed
};

export const SCROLL_SPEED = 0.30; // Normalized units per second (how fast beats scroll)
export const STRIKE_ZONE_Y = 0.82; // Where the strike line sits

export function evaluateDholStage(roundResults) {
  if (!roundResults || roundResults.length === 0) {
    return { score: 30, accuracy: 0, status: 'INCOMPLETE' };
  }

  const totalHits = roundResults.reduce((s, r) => s + r.perfects + r.goods, 0);
  const totalMisses = roundResults.reduce((s, r) => s + r.misses, 0);
  const totalBeats = totalHits + totalMisses;
  const accuracy = totalBeats > 0 ? Math.round((totalHits / totalBeats) * 100) : 0;

  const perfectRatio = roundResults.reduce((s, r) => s + r.perfects, 0) / Math.max(1, totalBeats);
  const maxCombo = Math.max(...roundResults.map(r => r.maxCombo));

  const rawScore = (accuracy * 0.6) + (perfectRatio * 25) + Math.min(15, maxCombo * 1.5);
  const finalScore = Math.max(25, Math.min(100, Math.round(rawScore)));

  return {
    score: finalScore,
    accuracy,
    totalHits,
    totalMisses,
    maxCombo,
    rounds: roundResults,
    status: finalScore >= 65 ? 'VIGHNA_OVERCOME' : 'PARTIALLY_RESTORED',
  };
}
