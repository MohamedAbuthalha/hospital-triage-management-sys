const LabReport = require("../models/LabReport");
const Patient = require("../models/Patient");

exports.getLabRequests = async (req, res, next) => {
  try {
    const reports = await LabReport.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: reports });
  } catch (err) {
    return next(err);
  }
};

exports.createLabRequest = async (req, res, next) => {
  try {
    const { patientId, testName, requestedBy } = req.body;
    if (!patientId || !testName) {
      return res.status(400).json({ success: false, message: "patientId and testName required" });
    }
    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });
    const report = await LabReport.create({ patientId, patientName: patient.name, testName, requestedBy });
    return res.status(201).json({ success: true, data: report });
  } catch (err) {
    return next(err);
  }
};

exports.updateTestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes, reportUrl } = req.body;
    const update = { status, notes, handledBy: req.user._id };
    if (status === "completed") update.completedAt = new Date();
    if (reportUrl) update.reportUrl = reportUrl;
    const report = await LabReport.findByIdAndUpdate(id, update, { new: true });
    if (!report) return res.status(404).json({ success: false, message: "Report not found" });
    return res.status(200).json({ success: true, data: report });
  } catch (err) {
    return next(err);
  }
};
