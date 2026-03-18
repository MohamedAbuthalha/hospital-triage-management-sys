const mongoose = require("mongoose");

const saleItemSchema = new mongoose.Schema({
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
  medicineName: { type: String, required: true },
  quantity: { type: Number, required: true, min: [1, "Quantity must be at least 1"] },
  unitPrice: { type: Number, required: true, min: [0, "Price cannot be negative"] },
  subtotal: { type: Number, required: true },
}, { _id: false });

const saleSchema = new mongoose.Schema({
  invoiceNumber: { type: String, unique: true },
  medicines: { type: [saleItemSchema], validate: { validator: (arr) => arr.length > 0, message: "At least one medicine required" } },
  totalAmount: { type: Number, required: true, min: [0, "Total cannot be negative"] },
  discount: { type: Number, default: 0, min: 0, max: 100 },
  finalAmount: { type: Number, required: true },
  soldBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  pharmacistName: { type: String },
  patientName: { type: String, trim: true, default: "Walk-in Customer" },
  patientPhone: { type: String, trim: true, default: "" },
  paymentMethod: { type: String, enum: ["cash", "card", "insurance", "online"], default: "cash" },
  notes: { type: String, trim: true, default: "" },
}, { timestamps: true });

saleSchema.pre("save", async function () {
  if (!this.invoiceNumber) {
    const count = await this.constructor.countDocuments().exec();
    const d = new Date();
    const ds = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
    this.invoiceNumber = `INV-${ds}-${String(count + 1).padStart(4, "0")}`;
  }
});

// Create indexes for faster queries
saleSchema.index({ createdAt: -1 }); // For sorting recent sales
saleSchema.index({ patientName: 1 }); // For searching by patient
// invoiceNumber index is already created by unique: true constraint
saleSchema.index({ soldBy: 1 }); // For filtering by pharmacist
saleSchema.index({ createdAt: -1, soldBy: 1 }); // Compound index for common query

module.exports = mongoose.model("Sale", saleSchema);
