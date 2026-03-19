const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth.routes");
const patientRoutes = require("./routes/patient.routes");
const doctorRoutes = require("./routes/doctor.routes");
const triageRoutes = require("./routes/triage.routes");
const assignmentRoutes = require("./routes/assignment.routes");
const adminRoutes = require("./routes/admin.routes");
const { errorHandler } = require("./middlewares/error.middleware");

const app = express();

/* -------------------- MIDDLEWARE -------------------- */
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 200,
    message: {
      success: false,
      message: "Too many requests from this IP, please try again later.",
    },
  })
);

/* -------------------- HEALTH CHECK & ROOT -------------------- */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hospital Management System API",
    version: "1.0.0",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Hospital Management Backend is running",
    timestamp: new Date().toISOString(),
  });
});

/* -------------------- ORIGINAL API ROUTES (UNCHANGED) -------------------- */
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/triage", triageRoutes);
app.use("/api/assign", assignmentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/staff", require("./routes/staff.routes"));
app.use("/api/nurse", require("./routes/nurse.routes"));

/* -------------------- NEW FEATURE ROUTES -------------------- */
app.use("/api/admin", require("./routes/adminOverview.routes"));
app.use("/api/messages", require("./routes/message.routes"));
app.use("/api/reception", require("./routes/receptionist.routes"));
app.use("/api/nurse-care", require("./routes/nurseNew.routes"));
app.use("/api/lab", require("./routes/lab.routes"));
app.use("/api/pharmacy", require("./routes/pharmacist.routes"));
app.use("/api/ward", require("./routes/warden.routes"));
app.use("/api/cleanliness", require("./routes/cleanliness.routes"));

if (process.env.NODE_ENV !== "production") {
  app.use("/api/test", require("./routes/test.routes"));
}

/* -------------------- 404 HANDLER -------------------- */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

/* -------------------- GLOBAL ERROR HANDLER -------------------- */
app.use(errorHandler);

module.exports = app;
