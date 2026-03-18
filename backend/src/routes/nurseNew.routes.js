const express = require("express");
const router = express.Router();
const {
  getAssignedPatients,
  getAllPatientsForNurse,
  updateVitals,
  updateCareStatus,
} = require("../controllers/nurseNew.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");

router.get("/my-patients", protect, authorize("nurse"), getAssignedPatients);
router.get("/all-patients", protect, authorize("nurse", "admin"), getAllPatientsForNurse);
router.patch("/patients/:id/vitals", protect, authorize("nurse"), updateVitals);
router.patch("/patients/:id/care-status", protect, authorize("nurse"), updateCareStatus);

module.exports = router;
