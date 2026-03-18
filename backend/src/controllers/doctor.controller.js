const PatientCase = require("../models/PatientCase");
const DoctorProfile = require("../models/DoctorProfile");
const autoAssignNextCase = require("../services/autoAssignNextCase.service");


/**
 * PATCH /api/doctors/duty
 * Toggle doctor on/off duty
 */
exports.toggleDuty = async (req, res, next) => {
  try {
    const doctorProfile = await DoctorProfile.findOne({
      user: req.user.id,
    });

    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    doctorProfile.isOnDuty = !doctorProfile.isOnDuty;
    await doctorProfile.save();

    res.status(200).json({
      success: true,
      message: `Doctor is now ${doctorProfile.isOnDuty ? "ON" : "OFF"} duty`,
      isOnDuty: doctorProfile.isOnDuty,
    });
  } catch (error) {
    console.error("Toggle duty error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update duty status",
    });
  }
};


/**
 * GET /api/doctors/cases/my
 */
exports.getMyAssignedCases = async (req, res, next) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const doctorProfile = await DoctorProfile.findOne({
      user: req.user.id,
    });

    if (!doctorProfile) {
      return res.status(400).json({
        success: false,
        message: "Doctor profile not linked",
      });
    }

    const cases = await PatientCase.find({
      assignedDoctor: doctorProfile._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: cases.length,
      data: cases,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch assigned cases",
    });
  }
};


/**
 * PATCH /api/doctors/cases/:caseId/status
 */
exports.updateCaseStatus = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const { status } = req.body;

    if (!["in-treatment", "completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const doctorProfile = await DoctorProfile.findOne({
      user: req.user.id,
    });

    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const patientCase = await PatientCase.findById(caseId);

    if (!patientCase) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    if (patientCase.assignedDoctor.toString() !== doctorProfile._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    patientCase.status = status;
    await patientCase.save();

    if (status === "completed") {
  // Prevent negative values
  doctorProfile.activeCases = Math.max(
    doctorProfile.activeCases - 1,
    0
  );
  await doctorProfile.save();

  // 🔥 Auto assign next waiting case
  await autoAssignNextCase(doctorProfile);
}

    res.status(200).json({
      success: true,
      message: "Case status updated",
      data: patientCase,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update status",
    });
  }
};


/**
 * GET /api/doctors/dashboard
 */
exports.getDoctorDashboard = async (req, res, next) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const doctorProfile = await DoctorProfile.findOne({
      user: req.user.id,
    });

    if (!doctorProfile) {
      return res.status(400).json({
        success: false,
        message: "Doctor profile not linked",
      });
    }

    const cases = await PatientCase.find({
      assignedDoctor: doctorProfile._id,
    }).sort({ createdAt: -1 });

    const stats = {
      total: cases.length,
      active: cases.filter(c => c.status !== "completed").length,
      completed: cases.filter(c => c.status === "completed").length,
      critical: cases.filter(c => c.severity === "critical").length,
    };

    res.status(200).json({
      success: true,
      stats,
      cases,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
    });
  }
};

/**
 * PATCH /api/doctors/cases/:caseId/complete
 */
exports.completeCase = async (req, res, next) => {
  try {
    const { caseId } = req.params;

    const doctorProfile = await DoctorProfile.findOne({
      user: req.user.id,
    });

    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const patientCase = await PatientCase.findById(caseId);

    if (!patientCase) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    if (patientCase.assignedDoctor.toString() !== doctorProfile._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    patientCase.status = "completed";
    await patientCase.save();

    doctorProfile.activeCases -= 1;
    await doctorProfile.save();

    res.status(200).json({
      success: true,
      message: "Case completed successfully",
      data: patientCase,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to complete case",
    });
  }
};
