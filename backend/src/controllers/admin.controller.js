const bcrypt = require("bcryptjs");
const User = require("../models/User");
const DoctorProfile = require("../models/DoctorProfile");

/**
 * @desc    Admin creates a doctor account
 * @route   POST /api/admin/doctors
 * @access  Admin only
 */
exports.createDoctor = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      specialization,
      department,
      experience,
      maxCases,
    } = req.body;

    const specializationInput = (
      specialization || department || ""
    ).toString().trim().toLowerCase();

    // 1️⃣ Validation
    if (
      !name ||
      !email ||
      !password ||
      !specializationInput ||
      experience === undefined ||
      maxCases === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All required fields must be provided: name, email, password, specialization (or department), experience, maxCases",
      });
    }

    const parsedMaxCases = Number(maxCases);
    if (!Number.isInteger(parsedMaxCases) || parsedMaxCases <= 0) {
      return res.status(400).json({
        success: false,
        message: "maxCases must be a positive integer",
      });
    }


    // 2️⃣ Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    // 3️⃣ Create doctor user
    const user = await User.create({
      name,
      email,
      password,
      role: "doctor",
    });

    // Normalize and map (department -> specialization)
    const specializationNormalized = specializationInput;

    // 4️⃣ Create doctor profile
    const doctorProfile = await DoctorProfile.create({
      user: user._id,
      name,
      specialization: specializationNormalized,
      experience,
      maxCases: parsedMaxCases,
    });


    // 5️⃣ Link profile
    user.doctorProfile = doctorProfile._id;
    await user.save();

    return res.status(201).json({
      success: true,
      message: "Doctor account created successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        doctorProfile,
      },
    });
  } catch (error) {
    console.error("Create doctor error:", error);
    return next(err);
  }
};

/**
 * @desc    Bulk create doctors
 * @route   POST /api/admin/doctors/bulk
 * @access  Admin only
 */
exports.createDoctorsBulk = async (req, res, next) => {
  try {
    const { doctors } = req.body;

    if (!Array.isArray(doctors) || doctors.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request must include an array of doctors in req.body.doctors",
      });
    }

    const emailSet = new Set();
    const preparedDoctors = [];
    const errors = [];

    for (let i = 0; i < doctors.length; i++) {
      const doctor = doctors[i] || {};
      const {
        name,
        email,
        password,
        specialization,
        department,
        experience,
        maxCases,
      } = doctor;

      const specializationValue = (
        specialization || department || ""
      ).toString().trim().toLowerCase();

      const parsedMaxCases = Number(maxCases);
      const parsedExperience = Number(experience);

      if (
        !name ||
        !email ||
        !password ||
        !specializationValue ||
        Number.isNaN(parsedExperience) ||
        Number.isNaN(parsedMaxCases)
      ) {
        errors.push({
          index: i,
          message:
            "Required fields missing or invalid (name,email,password,specialization/department,experience,maxCases)",
        });
        continue;
      }

      if (!Number.isInteger(parsedMaxCases) || parsedMaxCases <= 0) {
        errors.push({ index: i, message: "maxCases must be a positive integer" });
        continue;
      }

      const emailLower = email.toString().trim().toLowerCase();
      if (emailSet.has(emailLower)) {
        errors.push({ index: i, message: "Duplicate email in request payload" });
        continue;
      }
      emailSet.add(emailLower);

      preparedDoctors.push({
        name: name.toString().trim(),
        email: emailLower,
        password: password.toString(),
        specialization: specializationValue,
        experience: parsedExperience,
        maxCases: parsedMaxCases,
      });
    }

    if (preparedDoctors.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid doctors to insert",
        errors,
      });
    }

    const existing = await User.find({
      email: { $in: preparedDoctors.map((d) => d.email) },
    }).select("email");

    if (existing.length > 0) {
      const existingEmails = existing.map((u) => u.email);
      return res.status(409).json({
        success: false,
        message: "Duplicate emails detected",
        duplicateEmails: existingEmails,
      });
    }

    const hashedUsers = await Promise.all(
      preparedDoctors.map(async (d) => ({
        name: d.name,
        email: d.email,
        password: await bcrypt.hash(d.password, 12),
        role: "doctor",
      }))
    );

    let insertedUsers;
    try {
      insertedUsers = await User.insertMany(hashedUsers, { ordered: false });
    } catch (insertError) {
      if (insertError.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "Duplicate email found during insertion",
        });
      }
      throw insertError;
    }

    const profileDocs = insertedUsers.map((userDoc, idx) => ({
      user: userDoc._id,
      name: preparedDoctors[idx].name,
      specialization: preparedDoctors[idx].specialization,
      experience: preparedDoctors[idx].experience,
      maxCases: preparedDoctors[idx].maxCases,
      activeCases: 0,
      isOnDuty: true,
    }));

    const insertedProfiles = await DoctorProfile.insertMany(profileDocs, {
      ordered: false,
    });

    await Promise.all(
      insertedProfiles.map((profile) =>
        User.findByIdAndUpdate(profile.user, {
          doctorProfile: profile._id,
        })
      )
    );

    return res.status(201).json({
      success: true,
      message: "Bulk doctor creation completed",
      insertedCount: insertedProfiles.length,
      insertedDoctors: insertedProfiles.map((d) => ({
        id: d._id,
        name: d.name,
        specialization: d.specialization,
        experience: d.experience,
        maxCases: d.maxCases,
      })),
      errors,
    });
  } catch (error) {
    console.error("Bulk doctor insert error:", error);
    return next(err);
  }
};

/**
 * @desc    Create staff (NON-doctor)
 * @route   POST /api/admin/staff
 * @access  Admin only
 */
exports.createStaff = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // 1️⃣ Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 2️⃣ Allowed roles
    const allowedRoles = [
      "nurse",
      "receptionist",
      "lab",
      "ward",
      "pharmacist",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid staff role",
      });
    }

    // 3️⃣ Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    // 4️⃣ Create staff
    const staff = await User.create({
      name,
      email,
      password,
      role,
    });

    return res.status(201).json({
      success: true,
      message: "Staff created successfully",
      staff: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
      },
    });
  } catch (error) {
    console.error("Create staff error:", error);
    return next(err);
  }
};

/**
 * @desc    Get all staff (except admin)
 * @route   GET /api/admin/staff
 * @access  Admin only
 */
exports.getAllStaff = async (req, res, next) => {
  try {
    const staff = await User.find({
      role: { $ne: "admin" },
    }).select("-password");

    return res.status(200).json({
      success: true,
      count: staff.length,
      staff,
    });
  } catch (error) {
    console.error("Get staff error:", error);
    return next(err);
  }
};
