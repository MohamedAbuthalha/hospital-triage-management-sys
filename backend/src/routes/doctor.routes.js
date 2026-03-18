const express = require("express");
const router = express.Router();

const {
  toggleDuty,
  getMyAssignedCases,
  updateCaseStatus,
  getDoctorDashboard,
  completeCase,
} = require("../controllers/doctor.controller");

const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const asyncHandler = require("../utils/asyncHandler");

// Dashboard
router.get(
  "/dashboard",
  protect,
  authorize("doctor"),
  getDoctorDashboard
);

// My cases
router.get(
  "/cases/my",
  protect,
  authorize("doctor"),
  getMyAssignedCases
);

// Update case status
router.patch(
  "/cases/:caseId/status",
  protect,
  authorize("doctor"),
  updateCaseStatus
);

// Complete patient case
router.patch(
  "/cases/:caseId/complete",
  protect,
  authorize("doctor"),
  completeCase
);

// Toggle duty status [OK] FIXED
router.patch(
  "/duty",
  protect,
  authorize("doctor"),
  toggleDuty
);

module.exports = router;
console.log("DOCTOR CONTROLLER:", require("../controllers/doctor.controller"));
