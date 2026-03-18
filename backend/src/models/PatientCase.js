const mongoose = require("mongoose");

const patientCaseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    symptoms: { type: String, required: true },

    description: {
      type: String,
      default: "",
      trim: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: true,
    },

    specialization: {
      type: String,
      required: true,
      lowercase: true,
    },

    vitals: {
  bloodPressure: String,
  heartRate: Number,
  temperature: Number,
  oxygenLevel: Number,
  notes: String,
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  recordedAt: Date,
},


   assignedDoctor: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "DoctorProfile",
  default: null,
},


    status: {
      type: String,
      enum: ["waiting", "assigned", "in-treatment", "completed"],
      default: "waiting",
    },
  },
  { timestamps: true }
);

// Indexes
patientCaseSchema.index({ status: 1 });
patientCaseSchema.index({ specialization: 1 });
patientCaseSchema.index({ assignedDoctor: 1 });

module.exports = mongoose.model("PatientCase", patientCaseSchema);


