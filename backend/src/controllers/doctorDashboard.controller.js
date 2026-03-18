const PatientCase = require("../models/PatientCase");

/**
 * GET /api/doctor/dashboard
 * Doctor views all assigned patient cases
 */
exports.getDoctorDashboard = async (req, res, next) => {
  try {
    // Safety check
    if (!req.user.doctorProfile) {
      return res.status(403).json({
        success: false,
        message: "Doctor profile not linked to user",
      });
    }

    const cases = await PatientCase.find({
      assignedDoctor: req.user.doctorProfile,
    })
      .sort({ createdAt: -1 })
      .select("-__v")
      .lean();

    // Group cases by status (dashboard friendly)
    const dashboard = {
      assigned: [],
      inTreatment: [],
      completed: [],
    };

    cases.forEach((patientCase) => {
      if (patientCase.status === "assigned") {
        dashboard.assigned.push(patientCase);
      } else if (patientCase.status === "in-treatment") {
        dashboard.inTreatment.push(patientCase);
      } else if (patientCase.status === "completed") {
        dashboard.completed.push(patientCase);
      }
    });

    return res.status(200).json({
      success: true,
      totalCases: cases.length,
      dashboard,
    });
  } catch (error) {
    console.error("Doctor dashboard error:", error);

    return next(err);
  }
};


const PatientCase = require("../models/PatientCase");

/**
 * PATCH /api/doctor/case/:caseId/status
 * Doctor updates case status
 */
exports.updateCaseStatus = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const { status } = req.body;

    if (!["in-treatment", "completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status update",
      });
    }

    const patientCase = await PatientCase.findOne({
      _id: caseId,
      assignedDoctor: req.user.doctorProfile,
    });

    if (!patientCase) {
      return res.status(404).json({
        success: false,
        message: "Patient case not found or access denied",
      });
    }

    // Enforce lifecycle
    if (patientCase.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Case already completed",
      });
    }

    if (
      patientCase.status === "assigned" &&
      status !== "in-treatment"
    ) {
      return res.status(400).json({
        success: false,
        message: "Case must move to in-treatment first",
      });
    }

    if (
      patientCase.status === "in-treatment" &&
      status !== "completed"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid status transition",
      });
    }

    patientCase.status = status;
    await patientCase.save();

    return res.status(200).json({
      success: true,
      message: "Case status updated",
      status: patientCase.status,
    });
  } catch (error) {
    console.error("Case status update error:", error);

    return next(err);
  }
};

const express = require("express");
const router = express.Router();

const {
  getDoctorDashboard,
} = require("../controllers/doctorDashboard.controller");

const {
  updateCaseStatus,
} = require("../controllers/doctorCase.controller");

const {
  protect,
  authorize,
} = require("../middlewares/auth.middleware");

// Doctor dashboard
router.get(
  "/dashboard",
  protect,
  authorize("doctor"),
  getDoctorDashboard
);

// Update case status
router.patch(
  "/case/:caseId/status",
  protect,
  authorize("doctor"),
  updateCaseStatus
);

module.exports = router;
