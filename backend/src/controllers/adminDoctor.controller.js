const Doctor = require("../models/Doctor");

// ADMIN: get all doctors
exports.getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find();
    res.status(200).json({ success: true, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ADMIN: get doctors by specialization
exports.getDoctorsBySpecialization = async (req, res, next) => {
  try {
    const { specialization } = req.params;
    const doctors = await Doctor.find({ specialization });
    res.status(200).json({ success: true, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ADMIN: create doctor
exports.createDoctor = async (req, res, next) => {
  try {
    const {
      name,
      specialization,
      department,
      experience,
      maxCases,
      activeCases,
      user,
    } = req.body;

    const specializationInput = (specialization || department || "").toString().trim().toLowerCase();
    if (!name || !specializationInput || experience === undefined || maxCases === undefined || !user) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, specialization (or department), experience, maxCases, user",
      });
    }

    const parsedMaxCases = Number(maxCases);
    if (!Number.isInteger(parsedMaxCases) || parsedMaxCases <= 0) {
      return res.status(400).json({
        success: false,
        message: "maxCases must be a positive integer",
      });
    }

    const doctor = await Doctor.create({
      name,
      specialization: specializationInput,
      experience,
      maxCases: parsedMaxCases,
      activeCases: Number(activeCases) || 0,
      user,
    });
    res.status(201).json({ success: true, data: doctor });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
