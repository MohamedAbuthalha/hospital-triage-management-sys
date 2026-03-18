/**
 * CleanReport Model
 * -----------------
 * Stores one cleanliness inspection report per warden submission.
 *
 * WHY array of objects for `departments`?
 *   A single report inspects MULTIPLE departments at once.
 *   Each entry is a self-contained unit: name + status + notes.
 *   Using an embedded array lets us store, query, and validate all
 *   departments within one atomic document — no extra collection needed.
 *
 * WHY enum for `status`?
 *   Enum restricts values to exactly "Clean" or "Not Clean".
 *   This prevents typos like "clean", "CLEAN", "dirty" from polluting the DB.
 *   Mongoose throws a ValidationError automatically if an invalid value is sent.
 */

const mongoose = require("mongoose");

// ── Sub-schema: one department entry ──────────────────────────────────────────
const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Department name is required"],
      trim: true,
    },

    status: {
      type: String,
      enum: {
        values: ["Clean", "Not Clean"],             // Only these two values allowed
        message: 'Status must be "Clean" or "Not Clean"',
      },
      required: [true, "Status is required for every department"],
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false }  // No separate _id per department sub-doc — keeps it lean
);

// ── Main schema ────────────────────────────────────────────────────────────────
const cleanReportSchema = new mongoose.Schema(
  {
    wardenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",                                  // .populate("wardenId", "name") works here
      required: [true, "wardenId is required"],
    },

    departments: {
      type: [departmentSchema],
      validate: {
        validator: (arr) => arr.length > 0,         // At least one department required
        message: "At least one department must be reported",
      },
    },

    /**
     * overallStatus is DERIVED, not entered by user.
     * Computed in the controller before saving.
     *   "Clean"              → all departments are clean
     *   "Attention Required" → at least one is "Not Clean"
     */
    overallStatus: {
      type: String,
      enum: ["Clean", "Attention Required"],
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,                            // Automatically set on insert
    },
  },
  {
    timestamps: false,   // We manage createdAt manually above
    versionKey: false,   // Removes __v field from documents
  }
);

// Index: fetch latest reports fast (Admin dashboard sorts by -createdAt)
cleanReportSchema.index({ createdAt: -1 });
cleanReportSchema.index({ wardenId: 1 });

module.exports = mongoose.model("CleanReport", cleanReportSchema);
