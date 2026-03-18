const PatientCase = require("../models/PatientCase");
const { autoAssignDoctor } = require("./autoAssign.service");
const { calculatePriority } = require("../utils/priority.util");

const assignNextWaitingCase = async (doctorProfile) => {
  if (!doctorProfile) return null;

  // Capacity check
  if (doctorProfile.activeCases >= doctorProfile.maxCases) {
    return null;
  }

  // Fetch waiting cases
  const waitingCases = await PatientCase.find({
    status: "waiting",
    specialization: doctorProfile.specialization,
  });

  if (!waitingCases.length) return null;

  // Sort by priority (your logic stays!)
  waitingCases.sort(
    (a, b) => calculatePriority(b) - calculatePriority(a)
  );

  // Reuse auto-assign logic
  return await autoAssignDoctor(waitingCases[0]);
};

module.exports = { assignNextWaitingCase };
