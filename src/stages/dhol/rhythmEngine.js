// Dhol Call-and-Response Rhythm Patterns & Evaluation

export const DHOL_ROUNDS = [
  {
    round: 1,
    title: 'The Awakening Pulse',
    pattern: [
      { sound: 'dhol', label: 'DHA', delay: 0 },
      { sound: 'dhol', label: 'DHA', delay: 650 }
    ]
  },
  {
    round: 2,
    title: 'Tasha Entry',
    pattern: [
      { sound: 'dhol', label: 'DHA', delay: 0 },
      { sound: 'tasha', label: 'TAK', delay: 550 },
      { sound: 'dhol', label: 'DHA', delay: 1100 }
    ]
  },
  {
    round: 3,
    title: 'Procession March',
    pattern: [
      { sound: 'dhol', label: 'DHA', delay: 0 },
      { sound: 'tasha', label: 'TAK', delay: 450 },
      { sound: 'tasha', label: 'TAK', delay: 900 },
      { sound: 'dhol', label: 'DHUM', delay: 1350 }
    ]
  },
  {
    round: 4,
    title: 'Manjira Chime Syncopation',
    pattern: [
      { sound: 'dhol', label: 'DHA', delay: 0 },
      { sound: 'dhol', label: 'DHA', delay: 400 },
      { sound: 'tasha', label: 'TAK', delay: 800 },
      { sound: 'manjira', label: 'CHIME', delay: 1200 },
      { sound: 'dhol', label: 'DHA', delay: 1600 }
    ]
  },
  {
    round: 5,
    title: 'Grand Procession Crescendo',
    pattern: [
      { sound: 'dhol', label: 'DHA', delay: 0 },
      { sound: 'tasha', label: 'TAK', delay: 350 },
      { sound: 'dhol', label: 'DHA', delay: 700 },
      { sound: 'tasha', label: 'TAK', delay: 1050 },
      { sound: 'manjira', label: 'CHIME', delay: 1400 },
      { sound: 'dhol', label: 'DHUM', delay: 1750 }
    ]
  }
];

export function evaluateDholRound({
  expectedPattern,
  playerTaps // [{ time }]
}) {
  if (!playerTaps || playerTaps.length === 0) {
    return { accuracy: 30, streakMatch: false };
  }

  const expectedCount = expectedPattern.length;
  const countMatch = Math.min(expectedCount, playerTaps.length) / expectedCount;

  // Evaluate timing delta intervals
  let timingScore = 80;
  if (playerTaps.length > 1 && expectedPattern.length > 1) {
    let totalError = 0;
    for (let i = 1; i < Math.min(playerTaps.length, expectedPattern.length); i++) {
      const expectedInterval = expectedPattern[i].delay - expectedPattern[i - 1].delay;
      const actualInterval = playerTaps[i].time - playerTaps[i - 1].time;
      const diff = Math.abs(expectedInterval - actualInterval);
      totalError += diff;
    }
    const avgError = totalError / (playerTaps.length - 1);
    timingScore = Math.max(40, 100 - (avgError / 10));
  }

  const accuracy = Math.round((countMatch * 50) + (timingScore * 0.5));
  return {
    accuracy,
    streakMatch: accuracy >= 65
  };
}
