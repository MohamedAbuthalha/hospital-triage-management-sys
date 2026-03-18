exports.calculatePriority = (caseItem) => {
  let score = 0;

  // Severity weight
  if (caseItem.severity === "critical") score += 100;
  else if (caseItem.severity === "medium") score += 50;

  // Waiting time weight (max 60)
  const waitTimeMinutes =
    (Date.now() - new Date(caseItem.createdAt)) / 60000;

  score += Math.min(waitTimeMinutes, 60);

  return score;
};
