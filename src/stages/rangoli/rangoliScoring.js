// Rangoli Memory Grid — Scoring Engine
// Evaluates player's connection attempts against the target pattern

export function evaluateRangoliRound({
  targetConnections,    // Array of [id1, id2] pairs
  playerConnections,    // Array of [id1, id2] pairs player placed
  timeElapsedSeconds,
  timeLimit,
  comboMax,
}) {
  // Normalize connections for comparison (sort each pair)
  const normalize = (conn) => {
    const a = Math.min(conn[0], conn[1]);
    const b = Math.max(conn[0], conn[1]);
    return `${a}-${b}`;
  };

  const targetSet = new Set(targetConnections.map(normalize));
  const playerSet = new Set(playerConnections.map(normalize));

  let correctCount = 0;
  let wrongCount = 0;

  for (const pc of playerSet) {
    if (targetSet.has(pc)) {
      correctCount++;
    } else {
      wrongCount++;
    }
  }

  const totalTarget = targetSet.size;
  const accuracy = totalTarget > 0 ? Math.round((correctCount / totalTarget) * 100) : 0;
  const completionRatio = Math.min(1.0, correctCount / Math.max(1, totalTarget));

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
