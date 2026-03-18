const PatientCase = require("../models/PatientCase");
const NursingNote = require("../models/NursingNote");

const addVitals = async ({ caseId, nurseId, vitals, notes }) => {
  const patientCase = await PatientCase.findById(caseId);

  if (!patientCase) {
    throw new Error("Patient case not found");
  }

  if (patientCase.status === "completed") {
    throw new Error("Cannot add vitals to completed case");
  }

  const nursingNote = await NursingNote.create({
    patientCase: caseId,
    nurse: nurseId,
    vitals,
    notes,
  });

  return nursingNote;
};

const getCaseNotes = async (caseId) => {
  return NursingNote.find({ patientCase: caseId })
    .populate("nurse", "name role")
    .sort({ createdAt: -1 });
};

module.exports = {
  addVitals,
  getCaseNotes,
};
