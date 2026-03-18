/**
 * cleanliness.controller.js
 * ─────────────────────────
 * Controllers for the Hospital Cleanliness Monitoring feature.
 *
 * WHY (req, res, next)?
 *   Express middleware signature always receives these three arguments:
 *     req  → the incoming HTTP request (body, params, user, etc.)
 *     res  → the outgoing HTTP response (send JSON back to client)
 *     next → a function that passes control to the NEXT middleware/handler
 *
 *   `next` is critical because:
 *   1. If we call next(error), Express skips all remaining route handlers
 *      and jumps directly to the global error-handling middleware
 *      (the one with 4 params: err, req, res, next in app.js).
 *   2. Without next, an uncaught async error would crash the server or
 *      hang the request with no response.
 *
 * PATTERN USED: Manual try/catch in every async controller.
 *   Alternative: wrap with asyncHandler util (shown at bottom of file).
 *   Both are equally safe — we use manual here for clarity.
 */

const CleanReport = require("../models/CleanReport");

// ── Helper: consistent success envelope ───────────────────────────────────────
const ok = (res, data, message, status = 200) =>
  res.status(status).json({ success: true, message, data });

// ── Helper: consistent error envelope ─────────────────────────────────────────
const fail = (res, message, status = 500) =>
  res.status(status).json({ success: false, message });

// =============================================================================
//  createReport  —  POST /api/cleanliness/report
//  Called by: Warden (after filling the cleanliness form)
// =============================================================================
exports.createReport = async (req, res, next) => {
  /*
   * WHY next here?
   *   If something unexpected throws (DB connection lost, Mongoose bug, etc.)
   *   and we DON'T have a catch, next(error) routes the error to the global
   *   error handler instead of crashing Node or hanging the request.
   *   In the catch block we call next(err) so the global handler can log
   *   and respond uniformly.
   */
  try {
    // ── 1. Extract payload ───────────────────────────────────────────────────
    const { departments } = req.body;
    // req.user is attached by the protect middleware (JWT verification)
    const wardenId = req.user._id;

    // ── 2. Input validation ──────────────────────────────────────────────────
    if (!departments || !Array.isArray(departments) || departments.length === 0) {
      return fail(res, "departments array is required and must not be empty", 400);
    }

    // Every department MUST have a non-empty status
    for (let i = 0; i < departments.length; i++) {
      const dept = departments[i];
      if (!dept.name || !dept.name.trim()) {
        return fail(res, `Department at index ${i} is missing a name`, 400);
      }
      if (!dept.status) {
        return fail(res, `Department "${dept.name}" is missing a status`, 400);
      }
      if (!["Clean", "Not Clean"].includes(dept.status)) {
        return fail(
          res,
          `Department "${dept.name}" has invalid status "${dept.status}". Use "Clean" or "Not Clean"`,
          400
        );
      }
    }

    // ── 3. Compute overallStatus ─────────────────────────────────────────────
    /*
     * LOGIC:
     *   IF every department.status === "Clean"  → overallStatus = "Clean"
     *   ELSE (even one is "Not Clean")          → overallStatus = "Attention Required"
     *
     * Array.every() returns true only when ALL elements satisfy the predicate.
     * It short-circuits on the first failure — efficient for large arrays.
     */
    const allClean = departments.every((d) => d.status === "Clean");
    const overallStatus = allClean ? "Clean" : "Attention Required";

    // ── 4. Build notification message ────────────────────────────────────────
    /*
     * Simple version: message is embedded in the API response.
     *
     * HOW TO UPGRADE TO SOCKET.IO LATER:
     *   1. npm install socket.io
     *   2. In server.js: const io = require("socket.io")(httpServer, { cors: {...} });
     *   3. Attach io to app: app.set("io", io);
     *   4. In this controller: const io = req.app.get("io");
     *   5. Emit: io.to("admin-room").emit("new-report", { overallStatus, wardenId });
     *   6. Frontend Admin: socket.on("new-report", handler) — real-time alert appears.
     *   No polling needed. The message below stays as fallback for HTTP clients.
     */
    const notificationMessage =
      overallStatus === "Clean"
        ? "Hospital is clean and well maintained [OK]"
        : "Cleaning required in some departments [WARN]";

    // ── 5. Save to DB ────────────────────────────────────────────────────────
    const report = await CleanReport.create({
      wardenId,
      departments,          // Mongoose validates enum + required inside each sub-doc
      overallStatus,
    });

    // ── 6. Respond ───────────────────────────────────────────────────────────
    return ok(
      res,
      { report, notification: notificationMessage },
      "Report submitted successfully",
      201
    );
  } catch (err) {
    /*
     * Mongoose ValidationError has err.name === "ValidationError".
     * We can return a 400 with the specific message instead of a generic 500.
     */
    if (err.name === "ValidationError") {
      return fail(res, err.message, 400);
    }
    // For all other unexpected errors: forward to global error handler.
    // next(err) triggers the 4-param middleware: errorHandler(err, req, res, next)
    next(err);
  }
};

// =============================================================================
//  getReports  —  GET /api/cleanliness/reports
//  Called by: Admin (to view all submitted reports)
// =============================================================================
exports.getReports = async (req, res, next) => {
  try {
    // ── Optional query filters ───────────────────────────────────────────────
    const { status, limit = 50, page = 1 } = req.query;
    const filter = {};
    if (status) filter.overallStatus = status;       // e.g. ?status=Attention+Required

    const skip = (Number(page) - 1) * Number(limit);

    // ── Fetch reports ────────────────────────────────────────────────────────
    /*
     * .populate("wardenId", "name email role")
     *   Replaces the wardenId ObjectId with the actual User document fields.
     *   Admin sees "Submitted by: John Doe" instead of a raw ObjectId.
     *   "name email role" is the projection — only these fields come through,
     *   keeping the response lean and not leaking passwords.
     *
     * .sort({ createdAt: -1 })
     *   -1 = descending order → latest reports first (most recent at top).
     */
    const [reports, total] = await Promise.all([
      CleanReport.find(filter)
        .populate("wardenId", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),                                     // .lean() returns plain JS objects, faster

      CleanReport.countDocuments(filter),
    ]);

    return ok(res, {
      reports,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    }, "Reports fetched successfully");
  } catch (err) {
    next(err);
  }
};

// =============================================================================
//  getReportById  —  GET /api/cleanliness/reports/:id
//  Called by: Admin (to view single report detail + department breakdown)
// =============================================================================
exports.getReportById = async (req, res, next) => {
  try {
    const report = await CleanReport.findById(req.params.id)
      .populate("wardenId", "name email")
      .lean();

    if (!report) {
      return fail(res, "Report not found", 404);
    }

    return ok(res, report, "Report fetched");
  } catch (err) {
    next(err);
  }
};

// =============================================================================
//  asyncHandler utility (BEST PRACTICE — optional wrapper pattern)
// =============================================================================
/*
 * Instead of writing try/catch in every single controller, you can wrap:
 *
 *   const asyncHandler = (fn) => (req, res, next) =>
 *     Promise.resolve(fn(req, res, next)).catch(next);
 *
 * Then export controllers like:
 *   exports.createReport = asyncHandler(async (req, res, next) => { ... });
 *
 * Any thrown error is automatically forwarded to next(err).
 * This avoids repetitive boilerplate while keeping controllers clean.
 *
 * We kept manual try/catch above for teaching clarity — both are valid.
 */
