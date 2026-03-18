const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "hospital_management_system",
    });

    console.log(`[DB] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("[DB] MongoDB connection failed");
    console.error(error.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;

