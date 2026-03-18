const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    bloodGroup: { type: String, trim: true },
    department: { type: String, trim: true },
    status: {
      type: String,
      enum: ["waiting", "assigned", "in-progress", "completed", "discharged"],
      default: "waiting",
    },
    registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    vitals: {
      bp: { type: String },
      temperature: { type: String },
      pulse: { type: String },
      updatedAt: { type: Date },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    assignedNurse: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    careStatus: {
      type: String,
      enum: ["pending", "in-care", "stable", "critical"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);
