const WardBed = require("../models/WardBed");
const WeeklyTask = require("../models/WeeklyTask");
const Patient = require("../models/Patient");

const getWeekNumber = (date = new Date()) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return { week: Math.ceil((((d - yearStart) / 86400000) + 1) / 7), year: d.getUTCFullYear() };
};

const DEFAULT_TASKS = ["Bed Inspection", "Cleanliness Check", "Equipment Check", "Patient Occupancy Verification"];

// BEDS
exports.getBeds = async (req, res, next) => {
  try {
    const beds = await WardBed.find().sort({ ward: 1, bedNumber: 1 });
    return res.status(200).json({ success: true, data: beds });
  } catch (err) {
    return next(err);
  }
};

exports.addBed = async (req, res, next) => {
  try {
    const { bedNumber, ward } = req.body;
    if (!bedNumber || !ward) return res.status(400).json({ success: false, message: "bedNumber and ward required" });
    const bed = await WardBed.create({ bedNumber, ward, assignedBy: req.user._id });
    return res.status(201).json({ success: true, data: bed });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ success: false, message: "Bed number already exists" });
    return next(err);
  }
};

exports.assignBed = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { patientId } = req.body;
    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });
    const bed = await WardBed.findByIdAndUpdate(
      id,
      { status: "occupied", patientId, patientName: patient.name, admittedAt: new Date(), assignedBy: req.user._id },
      { new: true }
    );
    if (!bed) return res.status(404).json({ success: false, message: "Bed not found" });
    await Patient.findByIdAndUpdate(patientId, { status: "in-progress" });
    return res.status(200).json({ success: true, data: bed });
  } catch (err) {
    return next(err);
  }
};

exports.releaseBed = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bed = await WardBed.findByIdAndUpdate(
      id,
      { status: "available", patientId: null, patientName: null, admittedAt: null },
      { new: true }
    );
    if (!bed) return res.status(404).json({ success: false, message: "Bed not found" });
    return res.status(200).json({ success: true, data: bed });
  } catch (err) {
    return next(err);
  }
};

// WEEKLY TASKS
exports.getWeeklyTasks = async (req, res, next) => {
  try {
    const { week, year } = getWeekNumber();
    let tasks = await WeeklyTask.find({ weekNumber: week, year });
    if (tasks.length === 0) {
      tasks = await WeeklyTask.insertMany(
        DEFAULT_TASKS.map((t) => ({ taskName: t, weekNumber: week, year, status: "pending" }))
      );
    }
    return res.status(200).json({ success: true, data: tasks, week, year });
  } catch (err) {
    return next(err);
  }
};

exports.completeTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await WeeklyTask.findByIdAndUpdate(
      id,
      { status: "completed", completedAt: new Date(), completedBy: req.user._id },
      { new: true }
    );
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });
    return res.status(200).json({ success: true, data: task });
  } catch (err) {
    return next(err);
  }
};

exports.closeWeek = async (req, res, next) => {
  try {
    const { week, year } = getWeekNumber();
    const pendingTasks = await WeeklyTask.find({ weekNumber: week, year, status: "pending" });
    if (pendingTasks.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot close week. ${pendingTasks.length} task(s) still pending.`,
        pendingTasks: pendingTasks.map((t) => t.taskName),
      });
    }
    await WeeklyTask.updateMany({ weekNumber: week, year }, { weekClosed: true });
    return res.status(200).json({ success: true, message: "Week closed successfully" });
  } catch (err) {
    return next(err);
  }
};
