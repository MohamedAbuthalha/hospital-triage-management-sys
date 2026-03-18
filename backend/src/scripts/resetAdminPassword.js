const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI);

(async () => {
  try {
    const user = await User.findOne({ email: "admin1@hospital.com" });

    if (!user) {
      console.log("[ERR] Admin user not found in DB");
      process.exit(1);
    }

    user.password = "Admin@123"; // plain password
    await user.save(); // bcrypt runs automatically

    console.log("[OK] Admin password reset successful");
    process.exit(0);
  } catch (err) {
    console.error("[ERR] Error:", err);
    process.exit(1);
  }
})();
