// Modak Stage — Scoring Engine

export function evaluateModakSession({
  totalCorrectCatches,
  totalWrongCatches,
  totalBadCatches,
  modaksCompleted,
  perfectSteams,
  totalModaks,
  comboMax,
  timeElapsedSeconds,
  scoreMultiplier = 1.0,
}) {
  const totalCatches = totalCorrectCatches + totalWrongCatches + totalBadCatches;
  const catchAccuracy = totalCatches > 0
    ? Math.round((totalCorrectCatches / totalCatches) * 100)
    : 0;

  // Completion ratio
  const completionRatio = Math.min(1.0, modaksCompleted / Math.max(1, totalModaks));

  // Steam bonus
  const steamBonus = perfectSteams * 3;

  // Combo bonus
  const comboBonus = Math.min(10, (comboMax || 0) * 2);

  // Penalty for bad catches
  const badPenalty = totalBadCatches * 2;

  // Time bonus
  let timeBonus = 0;
  if (timeElapsedSeconds <= 40) timeBonus = 10;
  else if (timeElapsedSeconds <= 60) timeBonus = 5;

  const rawScore = ((completionRatio * 55) + (catchAccuracy * 0.2) + steamBonus + comboBonus + timeBonus - badPenalty) * scoreMultiplier;
  const finalScore = Math.max(20, Math.min(100, Math.round(rawScore)));

  return {
    score: finalScore,
    catchAccuracy,
    totalCorrectCatches,
    totalWrongCatches,
    totalBadCatches,
    modaksCompleted,
    perfectSteams,
    comboMax,
    steamAccuracy: modaksCompleted > 0 ? Math.round((perfectSteams / modaksCompleted) * 100) : 0,
    timeElapsedSeconds: Math.round(timeElapsedSeconds * 10) / 10,
    status: finalScore >= 65 ? 'VIGHNA_OVERCOME' : 'PARTIALLY_RESTORED',
  };
}
