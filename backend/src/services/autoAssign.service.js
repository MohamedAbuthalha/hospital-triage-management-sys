/**
 * COMPATIBILITY SHIM
 * ──────────────────────────────────────────────────────────────────────────
 * This file is kept for backward compatibility.
 * All logic has moved to: src/autoAssignment/index.js
 *
 * New code should import directly from the autoAssignment module:
 *   const { autoAssign } = require("../autoAssignment");
 * ──────────────────────────────────────────────────────────────────────────
 */

const { autoAssign } = require("../autoAssignment");

/**
 * Legacy wrapper: autoAssignDoctor(patientCase)
 * Accepts an existing PatientCase document and attempts assignment.
 * Returns the doctor object or null.
 */
exports.autoAssignDoctor = async (patientCase) => {
  const result = await autoAssign(patientCase);
  return result.doctor || null;
};
