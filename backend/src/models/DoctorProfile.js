const mongoose = require("mongoose");

const doctorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    specialization: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    experience: {
      type: Number,
      min: 0,
      required: true,
    },

    maxCases: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "maxCases must be an integer",
      },
    },

    activeCases: {
      type: Number,
      default: 0,
    },

    isOnDuty: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

doctorProfileSchema.index({ specialization: 1 });

module.exports = mongoose.model("DoctorProfile", doctorProfileSchema);
