const User = require("../models/User");

/**
 * @desc    Admin creates staff user
 * @route   POST /api/staff
 * @access  Admin
 */
exports.createStaff = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot create another admin",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    res.status(201).json({
      success: true,
      message: "Staff created successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Create staff error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create staff",
    });
  }
};

/**
 * @desc    Get all staff
 * @route   GET /api/staff
 * @access  Admin
 */
exports.getAllStaff = async (req, res, next) => {
  try {
    const staff = await User.find({ role: { $ne: "admin" } })
      .select("-password");

    res.status(200).json({
      success: true,
      count: staff.length,
      data: staff,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch staff",
    });
  }
};

/**
 * @desc    Activate / Deactivate staff
 * @route   PATCH /api/staff/:id/status
 * @access  Admin
 */
exports.toggleStaffStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || user.role === "admin") {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Staff ${user.isActive ? "activated" : "deactivated"}`,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update status",
    });
  }
};
