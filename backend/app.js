console.log("APP FILE LOADED ✅");
const express = require("express");
const connectDB = require("./config/db");

const app = express();

// Connect DB
connectDB();

// Middleware
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Hospital Management Backend Running [OK]");
});

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/patient", require("./routes/patient.routes"));
app.use("/api/doctor", require("./routes/doctor.routes"));

module.exports = app;
