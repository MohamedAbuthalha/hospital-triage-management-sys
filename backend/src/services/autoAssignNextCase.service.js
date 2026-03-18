const PatientCase = require("../models/PatientCase");

/**
 * Assign next waiting case to a doctor if possible
 */
const autoAssignNextCase = async (doctorProfile) => {
  if (!doctorProfile) return null;

  // Only assign if doctor is on duty & has capacity
  if (
    !doctorProfile.isOnDuty ||
    doctorProfile.activeCases >= doctorProfile.maxCases
  ) {
    return null;
  }

  // Find waiting cases for same specialization
  const waitingCase = await PatientCase.findOne({
    status: "waiting",
    specialization: doctorProfile.specialization,
  }).sort({ createdAt: 1 }); // FIFO (oldest first)

  if (!waitingCase) return null;

  // Assign case
  waitingCase.assignedDoctor = doctorProfile._id;
  waitingCase.status = "assigned";
  await waitingCase.save();

  // Update doctor load
  doctorProfile.activeCases += 1;
  await doctorProfile.save();

  return waitingCase;
};

module.exports = autoAssignNextCase;
