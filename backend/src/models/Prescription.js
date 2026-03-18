const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    patientName: { type: String, required: true },
    medicines: [
      {
        name: { type: String, required: true },
        dosage: { type: String },
        frequency: { type: String },
        duration: { type: String },
      },
    ],
    prescribedBy: { type: String, trim: true },
    status: {
      type: String,
      enum: ["pending", "dispensed", "partially-dispensed"],
      default: "pending",
    },
    dispensedAt: { type: Date },
    dispensedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prescription", prescriptionSchema);
