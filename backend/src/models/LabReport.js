const mongoose = require("mongoose");

const labReportSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    patientName: { type: String, required: true },
    testName: { type: String, required: true, trim: true },
    requestedBy: { type: String, trim: true },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
    reportUrl: { type: String, trim: true },
    notes: { type: String, trim: true },
    completedAt: { type: Date },
    handledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LabReport", labReportSchema);
