const PatientCase = require("../models/PatientCase");
const { autoAssign, retryAssignment } = require("../autoAssignment");
const { assignNextWaitingCase } = require("../services/waitingQueue.service");

/**
 * POST /api/patients
 * Create a new patient case and attempt immediate doctor assignment.
 */
exports.createPatientCase = async (req, res, next) => {
  try {
    const { name, age, gender, symptoms, description } = req.body;

    if (!name || !age || !gender || !symptoms) {
      return res.status(400).json({
        success: false,
        message: "name, age, gender, and symptoms are required",
      });
    }

    console.log(`[PatientController] Creating patient case:`, {
      name,
      age,
      gender,
      symptomsLength: symptoms.length,
    });

    // 1. Run auto-assignment engine (analyzes symptoms AND assigns doctor)
    const assignmentResult = await autoAssign({
      name,
      age: Number(age),
      gender,
      symptoms,
      description: description || "",
    });

    // 2. Create patient case with resolved fields from assignment
    const patientCase = await PatientCase.create({
      name,
      age: Number(age),
      gender,
      symptoms,
      description: description || "",
      severity: assignmentResult.severity,
      specialization: assignmentResult.selectedSpecialization,
      assignedDoctor: assignmentResult.doctor ? assignmentResult.doctor._id : null,
      status: assignmentResult.assigned ? "assigned" : "waiting",
    });

    // 3. If a doctor was already found via autoAssign, attach case ref to doctor result
    // (autoAssign without a doc persists to the profile via findByIdAndUpdate above)

    console.log(`[PatientController] [OK] Patient case created:`, {
      caseId: patientCase._id,
      status: patientCase.status,
      assigned: assignmentResult.assigned,
      doctorId: assignmentResult.doctor ? assignmentResult.doctor._id : null,
      specialization: assignmentResult.selectedSpecialization,
    });

    res.status(201).json({
      success: true,
      message: assignmentResult.assigned
        ? "Patient case created and doctor assigned"
        : "Patient case created — added to waiting queue (no available doctor)",
      data: {
        case: patientCase,
        assignment: {
          assigned: assignmentResult.assigned,
          doctor: assignmentResult.doctor
            ? {
                id: assignmentResult.doctor._id,
                name: assignmentResult.doctor.name,
                specialization: assignmentResult.selectedSpecialization,
                experience: assignmentResult.doctor.experience,
              }
            : null,
          severity: assignmentResult.severity,
          specialization: assignmentResult.selectedSpecialization,
          candidates: assignmentResult.candidates,
          selectionReason: assignmentResult.selectionReason,
          aiUsed: assignmentResult.aiUsed,
          fallback: assignmentResult.fallback,
        },
      },
    });
  } catch (error) {
    console.error("[PatientController] [ERR] Create patient case error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * POST /api/patients/:id/retry-assignment
 * Manually retry doctor assignment for a waiting case.
 */
exports.retryPatientAssignment = async (req, res, next) => {
  try {
    const result = await retryAssignment(req.params.id);

    res.status(200).json({
      success: true,
      message: result.assigned
        ? "Doctor successfully assigned on retry"
        : "Still no available doctor — case remains in waiting queue",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/patients
 */
exports.getAllPatientCases = async (req, res, next) => {
  try {
    const cases = await PatientCase.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: cases.length,
      data: cases,
    });
  } catch (error) {
    console.error("Fetch patient cases error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const completeCase = require("../services/completeCase.service");

exports.completePatientCase = async (req, res, next) => {
  try {
    const patientCase = await completeCase({
      caseId: req.params.id,
      doctorUserId: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: "Case completed successfully",
      caseId: patientCase._id,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
