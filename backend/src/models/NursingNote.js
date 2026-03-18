const mongoose = require("mongoose");

const nursingNoteSchema = new mongoose.Schema(
  {
    patientCase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PatientCase",
      required: true,
    },

    nurse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    vitals: {
      bloodPressure: String,
      heartRate: Number,
      temperature: Number,
      oxygenLevel: Number,
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("NursingNote", nursingNoteSchema);
