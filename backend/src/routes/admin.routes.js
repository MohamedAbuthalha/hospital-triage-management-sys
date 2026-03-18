const express = require("express");
const router = express.Router();

const {
  createDoctor,
  createDoctorsBulk,
  createStaff,
  getAllStaff,
} = require("../controllers/admin.controller");

const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const asyncHandler = require("../utils/asyncHandler");


router.post("/doctors/bulk", protect, authorize("admin"), asyncHandler(createDoctorsBulk));
router.post("/doctors", protect, authorize("admin"), asyncHandler(createDoctor));
router.post("/staff", protect, authorize("admin"), asyncHandler(createStaff));
router.get("/staff", protect, authorize("admin"), asyncHandler(getAllStaff));

module.exports = router;
