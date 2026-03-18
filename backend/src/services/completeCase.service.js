const PatientCase = require("../models/PatientCase");
const DoctorProfile = require("../models/DoctorProfile");
const { assignNextWaitingCase } = require("./waitingQueue.service");

module.exports = async ({ caseId, doctorUserId }) => {
  // 1️⃣ Fetch case
  const patientCase = await PatientCase.findById(caseId);
  if (!patientCase) {
    throw new Error("Patient case not found");
  }

  if (patientCase.status === "completed") {
    throw new Error("Case already completed");
  }

  // 2️⃣ Fetch doctor profile
  const doctorProfile = await DoctorProfile.findOne({ user: doctorUserId });
  if (!doctorProfile) {
    throw new Error("Doctor profile not found");
  }

  // 3️⃣ Ownership check
  if (patientCase.assignedDoctor.toString() !== doctorProfile._id.toString()) {
    throw new Error("You are not assigned to this case");
  }

  // 4️⃣ Complete case
  patientCase.status = "completed";
  await patientCase.save();

  // 5️⃣ Decrease workload
  doctorProfile.activeCases -= 1;
  await doctorProfile.save();

  // [OK] PHASE 7 – STEP 2 (THIS IS THE KEY LINE)
  await assignNextWaitingCase(doctorProfile);

  return patientCase;
};
