const express = require("express");
const router = express.Router();
const {
  addMedicine, getMedicines, getMedicineById, updateMedicine, deleteMedicine,
  createSale, getSales, getSaleById, getDailySalesReport,
  getPrescriptions, fulfillPrescription,
  getDashboardStats,
} = require("../controllers/pharmacist.controller");
const { protect, authorizeRoles } = require("../middlewares/auth.middleware");
const asyncHandler = require("../utils/asyncHandler");

const pharmacistOrAdmin = [protect, authorizeRoles("pharmacist", "admin")];
const pharmacistOnly = [protect, authorizeRoles("pharmacist")];

// ── Dashboard stats ──────────────────────────────
router.get("/stats", ...pharmacistOrAdmin, asyncHandler(getDashboardStats));

// ── Medicine routes ──────────────────────────────
router.post("/medicines", ...pharmacistOnly, asyncHandler(addMedicine));
router.get("/medicines", ...pharmacistOrAdmin, asyncHandler(getMedicines));
router.get("/medicines/:id", ...pharmacistOrAdmin, asyncHandler(getMedicineById));
router.put("/medicines/:id", ...pharmacistOnly, asyncHandler(updateMedicine));
router.delete("/medicines/:id", ...pharmacistOnly, asyncHandler(deleteMedicine));

// ── Sales / Billing routes ───────────────────────
router.post("/sales", ...pharmacistOnly, asyncHandler(createSale));
router.get("/sales/report/daily", ...pharmacistOrAdmin, asyncHandler(getDailySalesReport));
router.get("/sales", ...pharmacistOrAdmin, asyncHandler(getSales));
router.get("/sales/:id", ...pharmacistOrAdmin, asyncHandler(getSaleById));

// ── Prescription routes ──────────────────────────
router.get("/prescriptions", ...pharmacistOrAdmin, asyncHandler(getPrescriptions));
router.put("/prescriptions/:id/fulfill", ...pharmacistOnly, asyncHandler(fulfillPrescription));

// ── Legacy compatibility (existing routes) ───────
router.get("/inventory", ...pharmacistOrAdmin, asyncHandler(getMedicines));
router.post("/inventory", ...pharmacistOnly, asyncHandler(addMedicine));
router.patch("/inventory/:id", ...pharmacistOnly, asyncHandler(updateMedicine));
router.patch("/prescriptions/:id/dispense", ...pharmacistOnly, asyncHandler(fulfillPrescription));

module.exports = router;
