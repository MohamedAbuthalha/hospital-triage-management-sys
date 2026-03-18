const PatientCase = require("../models/PatientCase");
const DoctorProfile = require("../models/DoctorProfile");

const assignDoctorManually = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const { doctorId } = req.body;

    const patientCase = await PatientCase.findById(caseId);
    if (!patientCase) {
      return res.status(404).json({ message: "Case not found" });
    }

    patientCase.assignedDoctor = doctorId;
    patientCase.status = "assigned";
    await patientCase.save();

    await DoctorProfile.findByIdAndUpdate(doctorId, {
      $inc: { activeCases: 1 },
    });

    res.json({ success: true, patientCase });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  assignDoctorManually,
};
