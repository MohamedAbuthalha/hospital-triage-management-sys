const express = require("express");
const router = express.Router();
const { sendMessage, getMessages, markRead } = require("../controllers/message.controller");
const { protect } = require("../middlewares/auth.middleware");

router.post("/send", protect, sendMessage);
router.get("/:userId", protect, getMessages);
router.patch("/mark-read", protect, markRead);

module.exports = router;
