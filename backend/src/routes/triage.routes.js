/**
 * TRIAGE ROUTES
 * -------------
 * Exposes endpoints for symptom-based triage analysis
 */

const express = require("express");
const router = express.Router();

const triageController = require("../controllers/triage.controller");
const asyncHandler = require("../utils/asyncHandler");

// POST /api/triage/analyze
router.post("/analyze", asyncHandler(triageController.analyzeTriage));

module.exports = router;
