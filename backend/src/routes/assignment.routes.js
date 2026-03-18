const express = require("express");
const router = express.Router();

const assignmentController = require("../controllers/assignment.controller");

const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");

router.post(
  "/assign/:caseId",
  protect,
  authorize("admin"),
  assignmentController.assignDoctorManually
);

module.exports = router;
