const DoctorProfile = require("../models/DoctorProfile");
const PatientCase = require("../models/PatientCase");
const User = require("../models/User");

exports.getDoctorOverview = async (req, res, next) => {
  try {
    const doctors = await DoctorProfile.find().populate("user", "name email isActive");
    const overview = doctors.map((d) => {
      let loadStatus = "Available";
      if (d.activeCases === 0) loadStatus = "No Patients";
      else if (d.activeCases >= d.maxCases) loadStatus = "Busy";
      else if (d.activeCases >= d.maxCases * 0.8) loadStatus = "High Load";
      return {
        id: d._id,
        userId: d.user?._id,
        name: d.name,
        specialization: d.specialization,
        currentCases: d.activeCases,
        maxCases: d.maxCases,
        experience: d.experience,
        isOnDuty: d.isOnDuty,
        loadStatus,
      };
    });
    return res.status(200).json({ success: true, data: overview });
  } catch (err) {
    return next(err);
  }
};

exports.getDoctorDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doctor = await DoctorProfile.findById(id).populate("user", "name email");
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

    const cases = await PatientCase.find({ assignedDoctor: doctor.user?._id })
      .select("patientName status priority createdAt triageData")
      .sort({ createdAt: -1 });

    const summary = {
      total: cases.length,
      waiting: cases.filter((c) => c.status === "waiting").length,
      assigned: cases.filter((c) => c.status === "assigned").length,
      inProgress: cases.filter((c) => c.status === "in-progress").length,
      completed: cases.filter((c) => c.status === "completed").length,
    };

    return res.status(200).json({
      success: true,
      data: {
        doctor: {
          id: doctor._id,
          name: doctor.name,
          specialization: doctor.specialization,
          experience: doctor.experience,
          maxCases: doctor.maxCases,
          activeCases: doctor.activeCases,
          isOnDuty: doctor.isOnDuty,
        },
        cases,
        summary,
      },
    });
  } catch (err) {
    return next(err);
  }
};
