/**
 * cleanliness.routes.js
 * ─────────────────────
 * Defines HTTP routes for the cleanliness monitoring feature.
 *
 * ROUTING FLOW (step by step):
 *
 *  Browser/Axios
 *      │
 *      ▼
 *  Express app.use("/api/cleanliness", cleanlinessRouter)   ← registered in src/app.js
 *      │
 *      ▼
 *  protect middleware    ← verifies JWT, attaches req.user
 *      │
 *      ▼
 *  authorizeRoles(...)   ← checks req.user.role against allowed roles
 *      │
 *      ▼
 *  Controller function   ← does the actual work (DB read/write + response)
 *      │
 *      ▼
 *  (if error) next(err)  ← skips to global errorHandler in app.js
 *
 * Route definitions:
 *   POST /api/cleanliness/report    → Warden submits inspection
 *   GET  /api/cleanliness/reports   → Admin views all reports
 *   GET  /api/cleanliness/reports/:id → Admin views one report detail
 */

const express = require("express");
const router = express.Router();

const {
  createReport,
  getReports,
  getReportById,
} = require("../controllers/cleanliness.controller");

const { protect, authorizeRoles } = require("../middlewares/auth.middleware");

// ── Warden submits a new cleanliness report ────────────────────────────────────
/*
 * protect     → must be logged in (valid JWT)
 * authorizeRoles("ward", "admin") → only warden or admin can POST
 *
 * WHY protect BEFORE authorizeRoles?
 *   authorizeRoles reads req.user.role — but req.user is only available
 *   AFTER protect has run and decoded the JWT. Order matters in Express.
 */
router.post(
  "/report",
  protect,
  authorizeRoles("ward", "admin"),
  createReport
);

// ── Admin fetches all submitted reports ───────────────────────────────────────
router.get(
  "/reports",
  protect,
  authorizeRoles("admin"),
  getReports
);

// ── Admin fetches single report detail ────────────────────────────────────────
router.get(
  "/reports/:id",
  protect,
  authorizeRoles("admin"),
  getReportById
);

module.exports = router;
