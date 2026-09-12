// Modak Stage Scoring Engine (Normalized 0 to 100)

export function evaluateModakSession({
  completedModaks,
  perfectSteams,
  highestStreak,
  timeElapsedSeconds,
  targetCount = 8
}) {
  const completionRatio = Math.min(1.0, completedModaks / targetCount);
  const steamAccuracy = completedModaks > 0 ? Math.round((perfectSteams / completedModaks) * 100) : 60;

  // Streak bonus
  const streakBonus = Math.min(15, highestStreak * 3);

  // Time bonus
  let timeBonus = 0;
  if (timeElapsedSeconds <= 20) timeBonus = 10;
  else if (timeElapsedSeconds <= 30) timeBonus = 5;

  const rawScore = (completionRatio * 60) + (steamAccuracy * 0.2) + streakBonus + timeBonus;
  const finalScore = Math.max(30, Math.min(100, Math.round(rawScore)));

  return {
    score: finalScore,
    completedModaks,
    perfectSteams,
    steamAccuracy,
    highestStreak,
    timeElapsedSeconds: Math.round(timeElapsedSeconds * 10) / 10
  };
}
