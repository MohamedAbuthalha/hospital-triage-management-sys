const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");

exports.registerPatient = async (req, res, next) => {
  try {
    const { name, age, gender, phone, address, bloodGroup, department } = req.body;
    if (!name || !age || !gender) {
      return res.status(400).json({ success: false, message: "name, age, gender are required" });
    }
    const patient = await Patient.create({
      name, age, gender, phone, address, bloodGroup, department,
      registeredBy: req.user._id,
    });
    return res.status(201).json({ success: true, data: patient });
  } catch (err) {
    return next(err);
  }
};

exports.getAllPatients = async (req, res, next) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: patients });
  } catch (err) {
    return next(err);
  }
};

exports.getTodayPatients = async (req, res, next) => {
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setHours(23, 59, 59, 999);
    const patients = await Patient.find({ createdAt: { $gte: start, $lte: end } }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: patients });
  } catch (err) {
    return next(err);
  }
};

exports.createAppointment = async (req, res, next) => {
  try {
    const { patientId, department, appointmentDate, reason } = req.body;
    if (!patientId || !department || !appointmentDate) {
      return res.status(400).json({ success: false, message: "patientId, department, appointmentDate required" });
    }
    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });
    const appt = await Appointment.create({
      patientId, patientName: patient.name, department, appointmentDate, reason, createdBy: req.user._id,
    });
    return res.status(201).json({ success: true, data: appt });
  } catch (err) {
    return next(err);
  }
};

exports.getAppointments = async (req, res, next) => {
  try {
    const appts = await Appointment.find().sort({ appointmentDate: -1 });
    return res.status(200).json({ success: true, data: appts });
  } catch (err) {
    return next(err);
  }
};
