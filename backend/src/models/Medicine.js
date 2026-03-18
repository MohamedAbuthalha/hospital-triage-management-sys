const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Medicine name is required"], trim: true },
    category: { type: String, trim: true, default: "General" },
    manufacturer: { type: String, trim: true, default: "" },
    price: { type: Number, required: [true, "Price is required"], min: [0, "Price cannot be negative"] },
    stock: { type: Number, required: [true, "Stock quantity is required"], min: [0, "Stock cannot be negative"], default: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    expiryDate: { type: Date, required: [true, "Expiry date is required"] },
    batchNumber: { type: String, trim: true, default: "" },
    unit: { type: String, enum: ["tablets", "capsules", "ml", "vials", "strips", "units", "mg", "g"], default: "tablets" },
    description: { type: String, trim: true, default: "" },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Create indexes for faster queries
medicineSchema.index({ name: 1 });
medicineSchema.index({ category: 1 });
medicineSchema.index({ manufacturer: 1 });
medicineSchema.index({ batchNumber: 1 });
medicineSchema.index({ expiryDate: 1 });
medicineSchema.index({ stock: 1, lowStockThreshold: 1 });
// Compound indexes for common filter combinations
medicineSchema.index({ category: 1, expiryDate: 1 });
medicineSchema.index({ name: "text", manufacturer: "text" }); // Text search index

module.exports = mongoose.model("Medicine", medicineSchema);
