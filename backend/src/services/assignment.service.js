const Doctor = require("../models/Doctor");
const PatientCase = require("../models/PatientCase");

async function assignDoctorToCase(caseId) {
  const patientCase = await PatientCase.findById(caseId);

  if (!patientCase) {
    throw new Error("Patient case not found");
  }

  if (patientCase.status !== "waiting") {
    throw new Error("Patient case is already assigned or completed");
  }

  // [OK] Use triage-decided specialization
  const requiredSpecialization = patientCase.specialization;

  const doctor = await Doctor.findOne({
    specialization: requiredSpecialization,
    available: true,
    $expr: { $lt: ["$currentPatients", "$maxPatients"] },
  }).sort({ currentPatients: 1 });

  if (!doctor) {
    throw new Error("No available doctor found for this specialization");
  }

  patientCase.status = "assigned";
  patientCase.assignedDoctor = doctor._id;

  doctor.currentPatients += 1;

  if (doctor.currentPatients >= doctor.maxPatients) {
    doctor.available = false;
  }

  await Promise.all([patientCase.save(), doctor.save()]);

  return {
    message: "Doctor assigned successfully",
    doctor: {
      id: doctor._id,
      name: doctor.name,
      specialization: doctor.specialization,
    },
  };
}

module.exports = { assignDoctorToCase };
