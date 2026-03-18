/**
 * AUTO-ASSIGNMENT ORCHESTRATOR
 * ─────────────────────────────────────────────────────────────────────────────
 * Public API for the auto-assignment module.
 *
 * Responsibilities:
 *   1. Run specializationEngine to determine the best specialization(s)
 *   2. Run doctorSelector to pick the best available doctor
 *   3. Persist changes to PatientCase and DoctorProfile atomically
 *   4. Return a structured result the controller can respond with
 *
 * This is the ONLY file that touches PatientCase and DoctorProfile
 * within this module — keeping persistence concerns out of the engine
 * and selector layers.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const mongoose = require("mongoose");
const PatientCase   = require("../models/PatientCase");
const DoctorProfile = require("../models/DoctorProfile");
const { analyzeCase }  = require("./specializationEngine");
const { selectDoctor } = require("./doctorSelector");

/**
 * Analyse a patient case, assign a doctor, and persist changes.
 *
 * Can be called with either:
 *   a) A raw input object (before the PatientCase document exists), or
 *   b) An existing PatientCase Mongoose document.
 *
 * @param {object|import('mongoose').Document} input
 *   Raw fields: { name, age, gender, symptoms, description? }
 *   OR an existing PatientCase document.
 *
 * @returns {Promise<AssignmentResult>}
 */
async function autoAssign(input) {
  try {
    // ── Determine if we received a plain object or an existing document ──────
    const isDocument =
      input instanceof mongoose.Model ||
      (input && typeof input.save === "function");

    const caseData = isDocument ? input : null;

    const symptoms = (isDocument ? input.symptoms : input.symptoms) || "";
    const description = (isDocument ? input.description : input.description) || "";
    const age = (isDocument ? input.age : input.age) || 0;
    const gender = (isDocument ? input.gender : input.gender) || "";

    console.log(`[AutoAssign] Processing case:`, {
      name: isDocument ? input.name : input.name,
      symptoms: symptoms.substring(0, 50) + "...",
      age,
      gender,
    });

    // ── 1. Analyse symptoms → specialization candidates ──────────────────────
    const engineResult = await analyzeCase({
      symptoms,
      description,
      age,
      gender,
    });

    const {
      severity,
      topSpecialization,
      candidates,
      aiUsed,
      fallback,
    } = engineResult;

    console.log(`[AutoAssign] Specialization analysis:`, {
      severity,
      topSpecialization,
      candidates,
      aiUsed,
      fallback,
    });

    // ── 2. Select best available doctor ──────────────────────────────────────
    const { doctor, selectedSpecialization, selectionReason } = await selectDoctor(
      candidates,
      { fallback }
    );

    // ── 3. Persist ────────────────────────────────────────────────────────────
    if (doctor) {
      // [OK] Doctor found - assign to case and increment workload
      if (caseData) {
        caseData.specialization = selectedSpecialization;
        caseData.severity = severity;
        caseData.assignedDoctor = doctor._id;
        caseData.status = "assigned";
        await caseData.save();

        console.log(`[AutoAssign] [OK] Case assigned:`, {
          caseId: caseData._id,
          doctorId: doctor._id,
          doctorName: doctor.name,
          specialization: selectedSpecialization,
        });
      }

      // Increment doctor workload
      const updatedDoctor = await DoctorProfile.findByIdAndUpdate(
        doctor._id,
        { $inc: { activeCases: 1 } },
        { new: true }
      );

      console.log(`[AutoAssign] Doctor workload updated:`, {
        doctorId: doctor._id,
        newActiveCases: updatedDoctor.activeCases,
        maxCases: updatedDoctor.maxCases,
      });
    } else {
      // [ERR] No doctor found - case goes to waiting queue
      if (caseData) {
        caseData.specialization = topSpecialization;
        caseData.severity = severity;
        caseData.status = "waiting";
        await caseData.save();

        console.warn(`[AutoAssign] [WARN] Case added to waiting queue (no available doctor):`, {
          caseId: caseData._id,
          specialization: topSpecialization,
          reason: selectionReason,
        });
      }
    }

    // ── 4. Return structured result ───────────────────────────────────────────
    return {
      assigned: !!doctor,
      doctor: doctor || null,
      selectedSpecialization,
      severity,
      candidates,
      selectionReason,
      aiUsed,
      fallback,
    };
  } catch (error) {
    console.error(`[AutoAssign] [ERR] Fatal error during assignment:`, error);
    throw error;
  }
}

/**
 * Re-run assignment on an existing waiting case.
 * Useful for a cron job or manual retry endpoint.
 *
 * @param {string} caseId - PatientCase._id
 */
async function retryAssignment(caseId) {
  try {
    console.log(`[RetryAssignment] Attempting to reassign case:`, caseId);

    const patientCase = await PatientCase.findById(caseId);

    if (!patientCase) {
      const error = new Error(`PatientCase ${caseId} not found`);
      console.error(`[RetryAssignment] [ERR]`, error.message);
      throw error;
    }

    if (patientCase.status !== "waiting") {
      const error = new Error(
        `Case ${caseId} is not in waiting status (current: ${patientCase.status})`
      );
      console.warn(`[RetryAssignment] [WARN]`, error.message);
      throw error;
    }

    console.log(`[RetryAssignment] Running autoAssign for case:`, caseId);
    const result = await autoAssign(patientCase);

    if (result.assigned) {
      console.log(`[RetryAssignment] [OK] Reassignment successful:`, {
        caseId,
        doctorId: result.doctor._id,
        doctorName: result.doctor.name,
      });
    } else {
      console.warn(`[RetryAssignment] [WARN] Still no available doctor after retry:`, caseId);
    }

    return result;
  } catch (error) {
    console.error(`[RetryAssignment] [ERR] Retry failed:`, error.message);
    throw error;
  }
}

module.exports = { autoAssign, retryAssignment };
