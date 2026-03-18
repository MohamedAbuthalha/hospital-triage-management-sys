const Patient = require("../models/Patient");

exports.getAssignedPatients = async (req, res, next) => {
  try {
    const patients = await Patient.find({ assignedNurse: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: patients });
  } catch (err) {
    return next(err);
  }
};

exports.getAllPatientsForNurse = async (req, res, next) => {
  try {
    const patients = await Patient.find({ status: { $nin: ["discharged"] } }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: patients });
  } catch (err) {
    return next(err);
  }
};

exports.updateVitals = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { bp, temperature, pulse } = req.body;
    const patient = await Patient.findByIdAndUpdate(
      id,
      { vitals: { bp, temperature, pulse, updatedAt: new Date(), updatedBy: req.user._id }, assignedNurse: req.user._id },
      { new: true }
    );
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });
    return res.status(200).json({ success: true, data: patient });
  } catch (err) {
    return next(err);
  }
};

exports.updateCareStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { careStatus, status } = req.body;
    const update = {};
    if (careStatus) update.careStatus = careStatus;
    if (status) update.status = status;
    const patient = await Patient.findByIdAndUpdate(id, update, { new: true });
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });
    return res.status(200).json({ success: true, data: patient });
  } catch (err) {
    return next(err);
  }
};
