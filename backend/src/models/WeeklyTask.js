const mongoose = require("mongoose");

const weeklyTaskSchema = new mongoose.Schema(
  {
    taskName: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    weekNumber: { type: Number, required: true },
    year: { type: Number, required: true },
    completedAt: { type: Date, default: null },
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    weekClosed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WeeklyTask", weeklyTaskSchema);
