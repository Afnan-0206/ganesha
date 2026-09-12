// Pandal Scoring & Circuit Validation

export function evaluatePandalCircuit({
  connectedNodeIds,
  nodes,
  vighna,
  timeElapsedSeconds
}) {
  const maxCapacity = vighna?.maxCapacity || 100;
  const mandatory = vighna?.mandatoryIds || ['lights', 'diyas'];
  const disabled = vighna?.disabledIds || [];

  let totalPowerUsed = 0;
  let missingMandatory = 0;
  let hasDisabledViolation = false;

  connectedNodeIds.forEach(id => {
    if (disabled.includes(id)) hasDisabledViolation = true;
    const node = nodes.find(n => n.id === id);
    if (node && node.type === 'load') {
      totalPowerUsed += node.powerCost;
    }
  });

  mandatory.forEach(mId => {
    if (!connectedNodeIds.includes(mId)) {
      missingMandatory += 1;
    }
  });

  // Circuit status
  const isOverloaded = totalPowerUsed > maxCapacity;
  const isSatisfied = !isOverloaded && missingMandatory === 0 && !hasDisabledViolation;

  // Power efficiency percentage
  const efficiency = isOverloaded
    ? Math.max(0, 100 - (totalPowerUsed - maxCapacity) * 4)
    : Math.round((totalPowerUsed / maxCapacity) * 100);

  // Time bonus (Target 15-25s)
  let timeBonus = 0;
  if (timeElapsedSeconds <= 15) timeBonus = 10;
  else if (timeElapsedSeconds <= 25) timeBonus = 5;

  let rawScore = 30;
  if (isSatisfied) {
    rawScore = 70 + Math.min(20, Math.floor(efficiency * 0.2)) + timeBonus;
  } else if (!isOverloaded) {
    rawScore = 45 + Math.min(20, (mandatory.length - missingMandatory) * 15);
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
