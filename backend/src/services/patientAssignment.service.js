/**
 * PATIENT ASSIGNMENT SERVICE
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized service for assigning patients to doctors based on:
 *   1. Symptom-based specialization matching
 *   2. Doctor availability (on-duty status)
 *   3. Doctor capacity (currentCases < maxCases)
 *   4. Workload balancing (least busy doctor first)
 *   5. Experience (tie-breaker)
 *
 * This service wraps the autoAssignment module and provides explicit,
 * debuggable logic for patient-to-doctor assignment.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const DoctorProfile = require("../models/DoctorProfile");
const PatientCase = require("../models/PatientCase");
const { autoAssign, retryAssignment } = require("../autoAssignment");

/**
 * Assign a patient to a doctor based on symptoms and availability.
 *
 * @param {object} patientData - Patient case data
 * @param {string} patientData.name - Patient name
 * @param {number} patientData.age - Patient age
 * @param {string} patientData.gender - Patient gender
 * @param {string} patientData.symptoms - Patient symptoms
 * @param {string} [patientData.description] - Additional description
 *
 * @returns {Promise<{
 *   success: boolean,
 *   caseId?: string,
 *   assigned: boolean,
 *   doctor?: { id, name, specialization, experience },
 *   specialization: string,
 *   severity: string,
 *   status: "assigned" | "waiting",
 *   message: string,
 *   debug?: object
 * }>}
 */
async function assignPatientToDoctor(patientData) {
  try {
    console.log(`[PatientAssignmentService] Starting assignment process:`, {
      name: patientData.name,
      age: patientData.age,
      gender: patientData.gender,
    });

    // ── 1. Validate input ────────────────────────────────────────────────────
    if (!patientData.name || !patientData.age || !patientData.gender || !patientData.symptoms) {
      return {
        success: false,
        assigned: false,
        message: "Missing required patient data: name, age, gender, symptoms",
      };
    }

    // ── 2. Run auto-assignment engine ────────────────────────────────────────
    const assignmentResult = await autoAssign({
      name: patientData.name,
      age: Number(patientData.age),
      gender: patientData.gender,
      symptoms: patientData.symptoms,
      description: patientData.description || "",
    });

    // ── 3. Build response ────────────────────────────────────────────────────
    const response = {
      success: true,
      assigned: assignmentResult.assigned,
      specialization: assignmentResult.selectedSpecialization,
      severity: assignmentResult.severity,
      status: assignmentResult.assigned ? "assigned" : "waiting",
      message: assignmentResult.assigned
        ? `Patient assigned to Dr. ${assignmentResult.doctor.name} (${assignmentResult.selectedSpecialization})`
        : `Patient queued for ${assignmentResult.selectedSpecialization} specialist - no available doctor`,
    };

    if (assignmentResult.doctor) {
      response.doctor = {
        id: assignmentResult.doctor._id,
        name: assignmentResult.doctor.name,
        specialization: assignmentResult.selectedSpecialization,
        experience: assignmentResult.doctor.experience,
        currentCases: assignmentResult.doctor.activeCases + 1, // Just incremented
        maxCases: assignmentResult.doctor.maxCases,
      };
    }

    // Add debug info
    response.debug = {
      selectionReason: assignmentResult.selectionReason,
      candidates: assignmentResult.candidates,
      aiUsed: assignmentResult.aiUsed,
      fallback: assignmentResult.fallback,
    };

    console.log(`[PatientAssignmentService] [OK] Assignment complete:`, {
      assigned: response.assigned,
      specilization: response.specialization,
      doctor: response.doctor?.name || "none",
    });

    return response;
  } catch (error) {
    console.error(`[PatientAssignmentService] [ERR] Assignment failed:`, error.message);
    return {
      success: false,
      assigned: false,
      message: `Assignment error: ${error.message}`,
    };
  }
}

/**
 * Get available doctors for a specialization.
 * Useful for debugging or showing available options.
 *
 * @param {string} specialization - Specialization to search for
 * @returns {Promise<Array<{
 *   id: string,
 *   name: string,
 *   specialization: string,
 *   experience: number,
 *   currentCases: number,
 *   maxCases: number,
 *   availability: "available" | "at-capacity" | "off-duty"
 * }>>}
 */
async function getAvailableDoctors(specialization) {
  try {
    console.log(`[PatientAssignmentService] Fetching available doctors:`, specialization);

    const doctors = await DoctorProfile.find({
      specialization: specialization.toLowerCase().trim(),
    }).lean();

    const result = doctors.map((doctor) => {
      let availability = "available";
      if (!doctor.isOnDuty) {
        availability = "off-duty";
      } else if (doctor.activeCases >= doctor.maxCases) {
        availability = "at-capacity";
      }

      return {
        id: doctor._id,
        name: doctor.name,
        specialization: doctor.specialization,
        experience: doctor.experience,
        currentCases: doctor.activeCases || 0,
        maxCases: doctor.maxCases,
        availability,
        canAccept: availability === "available",
      };
    });

    console.log(`[PatientAssignmentService] Found ${result.length} doctors for ${specialization}`);

    return result;
  } catch (error) {
    console.error(
      `[PatientAssignmentService] Error fetching doctors for ${specialization}:`,
      error.message
    );
    return [];
  }
}

/**
 * Manually retry assignment for a waiting case.
 *
 * @param {string} caseId - PatientCase ID
 * @returns {Promise<{
 *   success: boolean,
 *   assigned: boolean,
 *   message: string,
 *   doctor?: { id, name, specialization },
 * }>}
 */
async function retryAssignmentForCase(caseId) {
  try {
    console.log(`[PatientAssignmentService] Retrying assignment:`, caseId);

    const result = await retryAssignment(caseId);

    return {
      success: true,
      assigned: result.assigned,
      message: result.assigned
        ? `Case reassigned to Dr. ${result.doctor.name}`
        : "Still no available doctor - case remains in waiting queue",
      doctor: result.doctor
        ? {
            id: result.doctor._id,
            name: result.doctor.name,
            specialization: result.selectedSpecialization,
          }
        : null,
    };
  } catch (error) {
    console.error(`[PatientAssignmentService] Retry failed:`, error.message);
    return {
      success: false,
      assigned: false,
      message: `Retry error: ${error.message}`,
    };
  }
}

/**
 * Get assignment statistics for debugging.
 * Shows current capacity and waiting queue status.
 *
 * @returns {Promise<{
 *   totalDoctors: number,
 *   onDuty: number,
 *   offDuty: number,
 *   atCapacity: number,
 *   specs: object,
 *   waitingCases: number,
 *   assignedCases: number,
 * }>}
 */
async function getAssignmentStats() {
  try {
    const doctors = await DoctorProfile.find({}).lean();
    const cases = await PatientCase.find({ status: { $in: ["waiting", "assigned"] } }).lean();

    const stats = {
      totalDoctors: doctors.length,
      onDuty: 0,
      offDuty: 0,
      atCapacity: 0,
      specs: {},
      waitingCases: cases.filter((c) => c.status === "waiting").length,
      assignedCases: cases.filter((c) => c.status === "assigned").length,
      doctorsBySpec: {},
    };

    // Count by status and specialization
    for (const doctor of doctors) {
      const spec = doctor.specialization;

      if (!stats.specs[spec]) {
        stats.specs[spec] = {
          total: 0,
          onDuty: 0,
          available: 0,
        };
      }
      if (!stats.doctorsBySpec[spec]) {
        stats.doctorsBySpec[spec] = [];
      }

      stats.specs[spec].total += 1;
      stats.doctorsBySpec[spec].push({
        name: doctor.name,
        cases: doctor.activeCases,
        maxCases: doctor.maxCases,
        available: doctor.activeCases < doctor.maxCases,
      });

      if (doctor.isOnDuty) {
        stats.onDuty += 1;
        stats.specs[spec].onDuty += 1;

        if (doctor.activeCases < doctor.maxCases) {
          stats.specs[spec].available += 1;
        } else {
          stats.atCapacity += 1;
        }
      } else {
        stats.offDuty += 1;
      }
    }

    console.log(`[PatientAssignmentService] Assignment statistics:`, stats);

    return stats;
  } catch (error) {
    console.error(`[PatientAssignmentService] Error getting stats:`, error.message);
    return {};
  }
}

module.exports = {
  assignPatientToDoctor,
  getAvailableDoctors,
  retryAssignmentForCase,
  getAssignmentStats,
};
