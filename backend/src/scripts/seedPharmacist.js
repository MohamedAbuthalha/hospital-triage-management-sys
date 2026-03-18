/**
 * Seed script — creates a pharmacist user + sample medicines
 * Run: node src/scripts/seedPharmacist.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Medicine = require("../models/Medicine");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/hospital";

const sampleMedicines = [
  { name: "Paracetamol 500mg", category: "Analgesic", manufacturer: "Cipla", price: 2.5, stock: 500, expiryDate: new Date("2026-12-31"), batchNumber: "B2024001", unit: "tablets", lowStockThreshold: 50 },
  { name: "Amoxicillin 250mg", category: "Antibiotic", manufacturer: "Sun Pharma", price: 8.0, stock: 200, expiryDate: new Date("2026-06-30"), batchNumber: "B2024002", unit: "capsules", lowStockThreshold: 30 },
  { name: "Ibuprofen 400mg", category: "NSAID", manufacturer: "Mankind", price: 3.5, stock: 8, expiryDate: new Date("2025-09-30"), batchNumber: "B2024003", unit: "tablets", lowStockThreshold: 20 },
  { name: "Metformin 500mg", category: "Antidiabetic", manufacturer: "USV", price: 5.0, stock: 300, expiryDate: new Date("2027-01-31"), batchNumber: "B2024004", unit: "tablets", lowStockThreshold: 40 },
  { name: "Atorvastatin 10mg", category: "Statin", manufacturer: "Zydus", price: 12.0, stock: 150, expiryDate: new Date("2026-11-30"), batchNumber: "B2024005", unit: "tablets", lowStockThreshold: 25 },
  { name: "Pantoprazole 40mg", category: "PPI", manufacturer: "Abbott", price: 6.0, stock: 5, expiryDate: new Date("2025-06-01"), batchNumber: "B2024006", unit: "tablets", lowStockThreshold: 20 },
  { name: "Azithromycin 500mg", category: "Antibiotic", manufacturer: "Pfizer", price: 45.0, stock: 80, expiryDate: new Date("2026-08-31"), batchNumber: "B2024007", unit: "tablets", lowStockThreshold: 15 },
  { name: "Insulin Glargine", category: "Antidiabetic", manufacturer: "Sanofi", price: 350.0, stock: 30, expiryDate: new Date("2025-12-31"), batchNumber: "B2024008", unit: "vials", lowStockThreshold: 5 },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("[OK] Connected to MongoDB");

  // Create pharmacist user
  const existing = await User.findOne({ email: "pharmacist@hospital.com" });
  if (!existing) {
    await User.create({
      name: "Raj Pharmacist",
      email: "pharmacist@hospital.com",
      password: "pharma123",
      role: "pharmacist",
      isActive: true,
    });
    console.log("[OK] Pharmacist user created — email: pharmacist@hospital.com | password: pharma123");
  } else {
    // Update password if user exists
    existing.password = "pharma123";
    existing.isActive = true;
    await existing.save();
    console.log("ℹ️  Pharmacist user already exists — password reset to: pharma123");
  }

  // Seed medicines
  const count = await Medicine.countDocuments().exec();
  if (count === 0) {
    await Medicine.insertMany(sampleMedicines);
    console.log(`[OK] ${sampleMedicines.length} sample medicines added`);
  } else {
    console.log(`ℹ️  ${count} medicines already exist — skipping medicine seed`);
  }

  console.log("\n Seed complete!");
  process.exit(0);
}

seed().catch((err) => { console.error("[ERR] Seed failed:", err); process.exit(1); });
