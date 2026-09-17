// Rangoli Memory Grid — Scoring Engine
// Evaluates player's connection attempts against the target pattern

export function evaluateRangoliRound({
  targetConnections,    // Array of [id1, id2] pairs
  playerConnections,    // Array of [id1, id2] pairs player placed
  timeElapsedSeconds,
  attempts = 1
}) {
  if (!visitedPoints || visitedPoints.length < 2) {
    return {
      score: 40,
      accuracy: 40,
      precision: 50,
      timeBonus: 0,
      status: 'INCOMPLETE'
    };
  }

  // 1. Sequence Match Accuracy
  let matchCount = 0;
  const maxMatches = targetSequence.length;

  for (let i = 0; i < Math.min(visitedPoints.length, maxMatches); i++) {
    if (visitedPoints[i] === targetSequence[i]) {
      matchCount += 1;
    }
  }

  const sequenceAccuracy = Math.round((matchCount / maxMatches) * 100);

  // 2. Completion Percentage
  const completionRatio = Math.min(1.0, visitedPoints.length / maxMatches);

  // 3. Time Bonus (Target ~5-8 seconds)
  let timeBonus = 0;
  if (timeElapsedSeconds <= 5.0) timeBonus = 10;
  else if (timeElapsedSeconds <= 8.0) timeBonus = 6;
  else if (timeElapsedSeconds <= 12.0) timeBonus = 2;

  // 4. Attempt Penalty (Soft, encouraging)
  const attemptDeduction = (attempts - 1) * 5;

  // Normalized final score (0–100)
  const rawScore = (sequenceAccuracy * 0.65) + (completionRatio * 25) + timeBonus - attemptDeduction;
  const finalScore = Math.max(25, Math.min(100, Math.round(rawScore)));

  return {
    score: finalScore,
    accuracy: sequenceAccuracy,
    completion: Math.round(completionRatio * 100),
    timeElapsedSeconds: Math.round(timeElapsedSeconds * 10) / 10,
    timeBonus,
    status: finalScore >= 65 ? 'VIGHNA_OVERCOME' : 'PARTIALLY_RESTORED'
  };
}
