const express = require("express");
const router = express.Router();
const { getLabRequests, createLabRequest, updateTestStatus } = require("../controllers/lab.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const asyncHandler = require("../utils/asyncHandler");

router.get("/", protect, authorize("lab", "admin"), asyncHandler(getLabRequests));
router.post("/", protect, authorize("lab", "admin", "receptionist"), asyncHandler(createLabRequest));
router.patch("/:id", protect, authorize("lab"), asyncHandler(updateTestStatus));

module.exports = router;
