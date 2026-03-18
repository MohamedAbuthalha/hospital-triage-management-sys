const PatientCase = require("../models/PatientCase");

// GET cases for nurse
exports.getCasesForVitals = async (req, res, next) => {
  const cases = await PatientCase.find({
    status: { $in: ["waiting", "assigned"] },
  });

  res.json({
    success: true,
    count: cases.length,
    cases,
  });
};

// ADD vitals
exports.addVitals = async (req, res, next) => {
  const { caseId } = req.params;
  const {
    bloodPressure,
    heartRate,
    temperature,
    oxygenLevel,
    notes,
  } = req.body;

  const patientCase = await PatientCase.findById(caseId);

  if (!patientCase) {
    return res.status(404).json({ message: "Case not found" });
  }

  patientCase.vitals = {
    bloodPressure,
    heartRate,
    temperature,
    oxygenLevel,
    notes,
    recordedBy: req.user._id,
    recordedAt: new Date(),
  };

  await patientCase.save();

  res.json({
    success: true,
    message: "Vitals recorded successfully",
    vitals: patientCase.vitals,
  });
};
