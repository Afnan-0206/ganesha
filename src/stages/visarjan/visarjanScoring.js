// Visarjan Stage — Scoring Engine

export function evaluateVisarjanRun({
  collectiblesGathered,
  totalCollectibles,
  obstaclesHit,
  totalObstacles,
  healthRemaining,
  distanceTraveled,
  maxDistance,
  timeElapsedSeconds,
}) {
  const reachedGhat = distanceTraveled >= maxDistance * 0.95;

  // Collection ratio
  const collectRatio = totalCollectibles > 0
    ? collectiblesGathered / totalCollectibles
    : 0;

  // Dodge ratio
  const dodgeRatio = totalObstacles > 0
    ? 1 - (obstaclesHit / totalObstacles)
    : 1;

  // Health bonus
  const healthBonus = Math.round(healthRemaining * 0.15);

  // Collection bonus
  const collectBonus = Math.round(collectRatio * 25);

  // Dodge score
  const dodgeScore = Math.round(dodgeRatio * 35);

  // Arrival bonus
  const arrivalBonus = reachedGhat ? 20 : 0;

  const rawScore = dodgeScore + collectBonus + healthBonus + arrivalBonus;
  const finalScore = Math.max(20, Math.min(100, Math.round(rawScore)));

  return {
    score: finalScore,
    routeEfficiency: Math.round(dodgeRatio * 100),
    collectiblesGathered,
    totalCollectibles,
    obstaclesHit,
    healthRemaining: Math.round(healthRemaining),
    reachedGhat,
    distanceTraveled: Math.round(distanceTraveled * 100) / 100,
    timeElapsedSeconds: Math.round(timeElapsedSeconds * 10) / 10,
    status: finalScore >= 65 ? 'VIGHNA_OVERCOME' : 'PARTIALLY_RESTORED',
  };
}
