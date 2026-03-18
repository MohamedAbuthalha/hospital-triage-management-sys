const express = require("express");
const router = express.Router();

const {
  getMyAssignedCases,
  updateCaseStatus,
} = require("../controllers/doctor.controller");

const {
  protect,
  authorize,
} = require("../middlewares/auth.middleware");

const asyncHandler = require("../utils/asyncHandler");

router.get(
  "/dashboard",
  protect,
  authorize("doctor"),
  asyncHandler(getMyAssignedCases)
);

router.patch(
  "/case/:caseId/status",
  protect,
  authorize("doctor"),
  asyncHandler(updateCaseStatus)
);

module.exports = router;
