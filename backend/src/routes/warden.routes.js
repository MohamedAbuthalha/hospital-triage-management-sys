const express = require("express");
const router = express.Router();
const {
  getBeds, addBed, assignBed, releaseBed,
  getWeeklyTasks, completeTask, closeWeek,
} = require("../controllers/warden.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");

router.get("/beds", protect, authorize("ward", "admin"), getBeds);
router.post("/beds", protect, authorize("ward"), addBed);
router.patch("/beds/:id/assign", protect, authorize("ward"), assignBed);
router.patch("/beds/:id/release", protect, authorize("ward"), releaseBed);

router.get("/tasks", protect, authorize("ward"), getWeeklyTasks);
router.patch("/tasks/:id/complete", protect, authorize("ward"), completeTask);
router.post("/tasks/close-week", protect, authorize("ward"), closeWeek);

module.exports = router;
