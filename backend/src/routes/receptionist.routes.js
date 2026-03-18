const express = require("express");
const router = express.Router();
const {
  registerPatient,
  getAllPatients,
  getTodayPatients,
  createAppointment,
  getAppointments,
} = require("../controllers/receptionist.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const asyncHandler = require("../utils/asyncHandler");

router.post("/patients", protect, authorize("receptionist", "admin"), asyncHandler(registerPatient));
router.get("/patients", protect, authorize("receptionist", "admin"), asyncHandler(getAllPatients));
router.get("/patients/today", protect, authorize("receptionist", "admin"), asyncHandler(getTodayPatients));
router.post("/appointments", protect, authorize("receptionist", "admin"), asyncHandler(createAppointment));
router.get("/appointments", protect, authorize("receptionist", "admin"), asyncHandler(getAppointments));

module.exports = router;
