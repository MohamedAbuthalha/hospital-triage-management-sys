/**
 * TRIAGE SERVICE (v2)
 * ─────────────────────────────────────────────────────────────────────────────
 * Thin wrapper kept for backward compatibility with any code that still calls
 * `analyzeSymptoms()`. Internally delegates to the new specializationEngine
 * so there is a single source of truth for all symptom-mapping logic.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { detectSeverity } = require("../autoAssignment/specializationEngine");
const { SPECIALIZATION_RULES } = require("../autoAssignment/knowledgeBase");

/**
 * Synchronous symptom analysis — used by legacy callers that cannot await.
 * For new code, prefer the async `autoAssign()` from the autoAssignment module.
 *
 * @param {string} symptoms
 * @param {object} [opts]
 * @param {string} [opts.description]
 * @param {number} [opts.age]
 * @param {string} [opts.gender]
 *
 * @returns {{ severity: string, specialization: string, score: number, emergency: boolean }}
 */
function analyzeSymptoms(symptoms = "", opts = {}) {
  const text = `${symptoms} ${opts.description || ""}`.toLowerCase();
  const severity = detectSeverity(text);

  let topScore = 0;
  let topSpecialization = "general";

  for (const rule of SPECIALIZATION_RULES) {
    let score = 0;
    for (const sym of rule.symptoms) {
      if (text.includes(sym)) score += rule.weight;
    }
    for (const kw of rule.keywords) {
      if (text.includes(kw)) score += rule.weight * 0.5;
    }
    if (score > topScore) {
      topScore = score;
      topSpecialization = rule.specialization;
    }
  }

  const severityScores = { critical: 40, high: 25, medium: 15, low: 5 };

  return {
    severity,
    specialization: topSpecialization,
    score: severityScores[severity] || 5,
    emergency: severity === "critical",
  };
}

module.exports = { analyzeSymptoms };
