// Visarjan Stage Scoring Engine

export function evaluateVisarjanRun({
  selectedRoute,
  adaptedDetour,
  timeElapsedSeconds
}) {
  let baseScore = 75;

  if (selectedRoute.id === 'promenade') baseScore = 88;
  else if (selectedRoute.id === 'gardens') baseScore = 82;
  else baseScore = 78;

  // Adaptation bonus
  let adaptBonus = adaptedDetour ? 10 : 5;

  const rawScore = baseScore + adaptBonus;
  const finalScore = Math.max(50, Math.min(100, Math.round(rawScore)));

  return {
    score: finalScore,
    routeEfficiency: Math.min(100, finalScore + 2),
    selectedRouteName: selectedRoute.name,
    adaptedDetour,
    timeElapsedSeconds: Math.round(timeElapsedSeconds * 10) / 10
  };
}
