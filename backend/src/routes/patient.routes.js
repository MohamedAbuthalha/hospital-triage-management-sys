const express = require("express");
const router = express.Router();

const {
  createPatientCase,
  getAllPatientCases,
  completePatientCase,
  retryPatientAssignment,
} = require("../controllers/patient.controller");

const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const asyncHandler = require("../utils/asyncHandler");

// Patient case creation (public — patient-facing)
router.post("/", asyncHandler(createPatientCase));

// View all cases (admin + doctor)
router.get("/", protect, authorize("admin", "doctor"), asyncHandler(getAllPatientCases));

// Retry assignment for a waiting case (admin only)
router.post(
  "/:id/retry-assignment",
  protect,
  authorize("admin"),
  asyncHandler(retryPatientAssignment)
);

// Complete a case (doctor only)
router.patch(
  "/:id/complete",
  protect,
  authorize("doctor"),
  asyncHandler(completePatientCase)
);

module.exports = router;
