const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    medicineName: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    quantity: { type: Number, required: true, default: 0 },
    unit: { type: String, default: "tablets" },
    minStock: { type: Number, default: 10 },
    expiryDate: { type: Date },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inventory", inventorySchema);
