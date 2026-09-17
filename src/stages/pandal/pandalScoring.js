// Pandal Stage: Scoring Engine
// Evaluates placement accuracy for drag-and-drop decoration items

export function evaluatePlacement(item, placedX, placedY) {
  const dx = placedX - item.targetX;
  const dy = placedY - item.targetY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Perfect = within 30% of zone radius, Good = within zone, Partial = within 2x zone
  const zoneR = item.zoneRadius;
  let accuracy, rating;

  if (distance <= zoneR * 0.35) {
    accuracy = 100;
    rating = 'PERFECT';
  } else if (distance <= zoneR) {
    accuracy = Math.round(80 + (1 - distance / zoneR) * 20);
    rating = 'GREAT';
  } else if (distance <= zoneR * 2) {
    accuracy = Math.round(40 + (1 - distance / (zoneR * 2)) * 40);
    rating = 'GOOD';
  } else {
    accuracy = Math.max(10, Math.round(30 * (1 - distance / 0.5)));
    rating = 'MISSED';
  }

  const finalScore = Math.max(20, Math.min(100, Math.round(rawScore)));

  return {
    score: finalScore,
    isSatisfied,
    isOverloaded,
    totalPowerUsed,
    maxCapacity,
    efficiency,
    missingMandatory,
    hasDisabledViolation,
    timeElapsedSeconds: Math.round(timeElapsedSeconds * 10) / 10
  };
}
