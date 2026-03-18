const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/auth.middleware");

router.get("/protected", protect, (req, res) => {
  res.json({
    success: true,
    message: "Token is valid",
    user: {
      id: req.user._id,
      role: req.user.role,
    },
  });
});

module.exports = router;
