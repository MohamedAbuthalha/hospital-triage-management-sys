const express = require("express");
const router = express.Router();
const { getDoctorOverview, getDoctorDetail } = require("../controllers/adminOverview.controller");
const { sendMessage } = require("../controllers/message.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const asyncHandler = require("../utils/asyncHandler");

router.get("/doctors/overview", protect, authorize("admin"), asyncHandler(getDoctorOverview));
router.get("/doctors/:id/detail", protect, authorize("admin"), asyncHandler(getDoctorDetail));
router.post("/send-message", protect, authorize("admin"), asyncHandler(sendMessage));

module.exports = router;
