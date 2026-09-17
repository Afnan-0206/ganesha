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

  const score = Math.round((accuracy / 100) * item.points);

  return { accuracy, rating, score, distance, maxPoints: item.points };
}

export function evaluatePandalStage(placements, totalTimeSeconds) {
  if (!placements || placements.length === 0) {
    return { score: 25, accuracy: 0, status: 'INCOMPLETE' };
  }

  const totalMaxPoints = placements.reduce((sum, p) => sum + p.maxPoints, 0);
  const totalEarned = placements.reduce((sum, p) => sum + p.score, 0);
  const avgAccuracy = Math.round(placements.reduce((sum, p) => sum + p.accuracy, 0) / placements.length);

  // Perfect count bonus
  const perfectCount = placements.filter(p => p.rating === 'PERFECT').length;
  const perfBonus = perfectCount * 2;

  // Time bonus
  let timeBonus = 0;
  if (totalTimeSeconds <= 30) timeBonus = 10;
  else if (totalTimeSeconds <= 45) timeBonus = 5;

  const rawScore = Math.round((totalEarned / Math.max(1, totalMaxPoints)) * 80) + perfBonus + timeBonus;
  const finalScore = Math.max(20, Math.min(100, rawScore));

  return {
    score: finalScore,
    accuracy: avgAccuracy,
    totalEarned,
    totalMaxPoints,
    perfectCount,
    totalItems: placements.length,
    timeBonus,
    placements,
    status: finalScore >= 65 ? 'VIGHNA_OVERCOME' : 'PARTIALLY_RESTORED',
  };
}
