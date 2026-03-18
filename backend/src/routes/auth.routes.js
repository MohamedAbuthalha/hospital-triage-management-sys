const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const asyncHandler = require("../utils/asyncHandler");

router.post("/register", asyncHandler(authController.register));
router.post("/login", asyncHandler(authController.login));

module.exports = router;
