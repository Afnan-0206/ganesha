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

  // Time bonus
  const timeRatio = Math.max(0, 1 - (timeElapsedSeconds / timeLimit));
  const timeBonus = Math.round(timeRatio * 15);

  // Combo bonus
  const comboBonus = Math.min(10, (comboMax || 0) * 2);

  // Wrong penalty
  const wrongPenalty = wrongCount * 3;

  const rawScore = (completionRatio * 65) + timeBonus + comboBonus - wrongPenalty;
  const roundScore = Math.max(10, Math.min(100, Math.round(rawScore)));

  return {
    roundScore,
    accuracy,
    correctCount,
    wrongCount,
    totalTarget,
    timeBonus,
    status: finalScore >= 65 ? 'VIGHNA_OVERCOME' : 'PARTIALLY_RESTORED'
  };
}
