/**
 * SPECIALIZATION ENGINE
 * ─────────────────────────────────────────────────────────────────────────────
 * Scores all specialization rules against the patient case and returns an
 * ordered list of candidates.
 *
 * AI / NLP PLUG-IN POINT:
 *   Set process.env.AI_ASSIGNMENT_ENABLED=true and implement the
 *   `analyzeWithAI()` function (or inject it via the options param).
 *   When active, rule-based scoring is used only as a fallback / tie-breaker.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { SPECIALIZATION_RULES, SEVERITY_RULES } = require("./knowledgeBase");

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Returns true if the needle (term) appears as a substring in haystack.
 * Both are already lowercased before calling this.
 */
function termMatches(haystack, term) {
  return haystack.includes(term);
}

/**
 * Score a single rule against a normalised text blob + patient metadata.
 * Returns a non-negative number (0 = no match).
 */
function scoreRule(rule, text, age, gender) {
  let textScore = 0;

  // 1. Symptom matches
  for (const symptom of rule.symptoms) {
    if (termMatches(text, symptom)) {
      textScore += rule.weight;
    }
  }

  // 2. Keyword matches (half weight to avoid over-signalling on description)
  for (const keyword of rule.keywords) {
    if (termMatches(text, keyword)) {
      textScore += rule.weight * 0.5;
    }
  }

  // 3. Context clue modifiers
  // Only context clues with a HIGH bonusWeight (>= 10) are allowed to create
  // a score from zero — these are strong demographic overrides (e.g. pediatrics
  // age gate). All other context bonuses only amplify an existing text match.
  let contextScore = 0;

  for (const clue of rule.contextClues) {
    const ageOk =
      (clue.minAge === undefined || age >= clue.minAge) &&
      (clue.maxAge === undefined || age <= clue.maxAge);

    const genderOk =
      clue.gender === undefined ||
      clue.gender === gender;

    if (ageOk && genderOk) {
      const bonus = clue.bonusWeight || 0;
      const isOverride = bonus >= 10;
      if (textScore > 0 || isOverride) {
        contextScore += bonus;
      }
    }
  }

  return textScore + contextScore;
}

// ─── severity detection ──────────────────────────────────────────────────────

/**
 * Determines case severity from the combined text.
 * Returns: "critical" | "high" | "medium" | "low"
 */
function detectSeverity(text) {
  for (const [level, terms] of Object.entries(SEVERITY_RULES)) {
    for (const term of terms) {
      if (termMatches(text, term)) {
        return level;
      }
    }
  }
  return "low";
}

// ─── AI hook (stub — replace with real implementation when ready) ────────────

/**
 * FUTURE ML/NLP PLUG-IN
 *
 * Signature must return:
 *   { specialization: string, confidence: number (0-1) } | null
 *
 * When this returns a confident result (confidence >= AI_CONFIDENCE_THRESHOLD),
 * the rule-based scores are blended in only as a tie-breaker.
 *
 * To activate:
 *   1. Set process.env.AI_ASSIGNMENT_ENABLED=true
 *   2. Implement the body (call your ML service / model here)
 */
async function analyzeWithAI(/* patientCaseData */) {
  // Example stub — replace with actual HTTP call to your NLP service:
  //
  // const response = await fetch(process.env.NLP_SERVICE_URL, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ text: patientCaseData.combinedText }),
  // });
  // const { specialization, confidence } = await response.json();
  // return { specialization, confidence };

  return null; // stub: disabled
}

// ─── main export ─────────────────────────────────────────────────────────────

const AI_CONFIDENCE_THRESHOLD = parseFloat(
  process.env.AI_CONFIDENCE_THRESHOLD || "0.75"
);

/**
 * Analyses a patient case and returns scored specialization candidates.
 *
 * @param {object} params
 * @param {string} params.symptoms    - patient's symptom string
 * @param {string} [params.description] - free text description (optional)
 * @param {number} [params.age]       - patient age
 * @param {string} [params.gender]    - "male" | "female" | "other"
 *
 * @returns {Promise<{
 *   severity:         string,
 *   topSpecialization: string,
 *   candidates:       Array<{ specialization: string, score: number }>,
 *   aiUsed:           boolean,
 *   fallback:         boolean,   // true when no rule matched (defaulted to "general")
 * }>}
 */
async function analyzeCase({ symptoms = "", description = "", age = 0, gender = "" }) {
  const combinedText = `${symptoms} ${description}`.toLowerCase().trim();
  const normalisedGender = gender.toLowerCase();

  console.log(`[SpecEngine] Analyzing symptoms:`, {
    symptoms: symptoms.substring(0, 60) + "...",
    age,
    gender,
  });

  // ── 1. Attempt AI analysis ──────────────────────────────────────────────
  let aiUsed = false;

  if (process.env.AI_ASSIGNMENT_ENABLED === "true") {
    try {
      const aiResult = await analyzeWithAI({
        combinedText,
        age,
        gender: normalisedGender,
      });

      if (aiResult && aiResult.confidence >= AI_CONFIDENCE_THRESHOLD) {
        // Still run rule scoring so the caller has full candidate context,
        // but mark aiUsed = true so the doctor-selector knows the top pick is AI-driven.
        aiUsed = true;

        const ruleCandidates = scoredCandidates(combinedText, age, normalisedGender);

        console.log(`[SpecEngine] AI analysis successful:`, {
          specialization: aiResult.specialization,
          confidence: aiResult.confidence,
          candidates: ruleCandidates,
        });

        return {
          severity: detectSeverity(combinedText),
          topSpecialization: aiResult.specialization.toLowerCase(),
          candidates: ruleCandidates,
          aiUsed: true,
          fallback: false,
        };
      }
    } catch (err) {
      // AI service failed — fall through to rule-based gracefully
      console.error(
        "[SpecEngine] AI analysis failed, falling back to rules:",
        err.message
      );
    }
  }

  // ── 2. Rule-based scoring ────────────────────────────────────────────────
  const candidates = scoredCandidates(combinedText, age, normalisedGender);
  const severity = detectSeverity(combinedText);

  console.log(`[SpecEngine] Rule-based scoring complete:`, {
    severity,
    candidateCount: candidates.length,
    topSpecialization: candidates.length > 0 ? candidates[0].specialization : "general",
    candidates: candidates.slice(0, 3), // Log top 3
  });

  if (candidates.length === 0 || candidates[0].score === 0) {
    console.warn(
      `[SpecEngine] [WARN] No matching specialization - falling back to 'general'`
    );
    return {
      severity,
      topSpecialization: "general",
      candidates: [{ specialization: "general", score: 0 }],
      aiUsed,
      fallback: true,
    };
  }

  return {
    severity,
    topSpecialization: candidates[0].specialization,
    candidates,
    aiUsed,
    fallback: false,
  };
}

/**
 * Internal: runs all rules and returns sorted array of non-zero candidates.
 */
function scoredCandidates(text, age, gender) {
  const results = SPECIALIZATION_RULES
    .map((rule) => ({
      specialization: rule.specialization,
      score: scoreRule(rule, text, age, gender),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  return results;
}

module.exports = { analyzeCase, detectSeverity };
