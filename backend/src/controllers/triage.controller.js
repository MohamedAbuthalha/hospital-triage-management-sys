/**
 * TRIAGE CONTROLLER
 * -----------------
 * Handles incoming triage requests and returns
 * severity analysis based on symptoms.
 */

const { analyzeSymptoms } = require("../services/triage.service");

// POST /api/triage/analyze
exports.analyzeTriage = async (req, res, next) => {
  try {
    const { symptoms, age } = req.body;

    if (!symptoms || symptoms.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: "Symptoms description is required",
      });
    }

    const triageResult = analyzeSymptoms(symptoms, age);

    return res.status(200).json({
      success: true,
      message: "Triage analysis completed",
      data: {
        input: {
          symptoms,
          age: age || null,
        },
        triage: triageResult,
      },
    });
  } catch (error) {
    console.error("Triage error:", error);

    return next(err);
  }
};
