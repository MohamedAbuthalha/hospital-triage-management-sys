const express = require("express");
const router = express.Router();

const nurseController = require("../controllers/nurse.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const asyncHandler = require("../utils/asyncHandler");

// Auth
router.use(protect);

// Role
router.use(authorize("nurse"));

// Add vitals
router.post("/cases/:caseId/vitals", asyncHandler(nurseController.addVitals));

module.exports = router;
