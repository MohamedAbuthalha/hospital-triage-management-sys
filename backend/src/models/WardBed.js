const mongoose = require("mongoose");

const wardBedSchema = new mongoose.Schema(
  {
    bedNumber: { type: String, required: true, unique: true, trim: true },
    ward: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["available", "occupied", "maintenance"],
      default: "available",
    },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", default: null },
    patientName: { type: String, default: null },
    admittedAt: { type: Date, default: null },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WardBed", wardBedSchema);
