const mongoose = require("mongoose");
const Medicine = require("../models/Medicine");
const Sale = require("../models/Sale");
const Prescription = require("../models/Prescription");

// ─────────────────────────────────────────────
// MEDICINE CONTROLLERS
// ─────────────────────────────────────────────

exports.addMedicine = async (req, res, next) => {
  try {
    const { name, category, manufacturer, price, stock, expiryDate, batchNumber, unit, lowStockThreshold, description } = req.body;

    if (!name || price === undefined || stock === undefined || !expiryDate) {
      return res.status(400).json({ success: false, message: "name, price, stock, and expiryDate are required" });
    }
    if (Number(price) < 0) return res.status(400).json({ success: false, message: "Price cannot be negative" });
    if (Number(stock) < 0) return res.status(400).json({ success: false, message: "Stock cannot be negative" });

    const expiry = new Date(expiryDate);
    if (isNaN(expiry.getTime())) return res.status(400).json({ success: false, message: "Invalid expiry date" });

    const medicine = await Medicine.create({
      name, category, manufacturer, price: Number(price), stock: Number(stock),
      expiryDate: expiry, batchNumber, unit, lowStockThreshold: Number(lowStockThreshold) || 10,
      description, addedBy: req.user._id,
    });

    return res.status(201).json({ success: true, data: medicine, message: "Medicine added successfully" });
  } catch (err) {
    if (err.name === "ValidationError") return res.status(400).json({ success: false, message: err.message });
    return next(err);
  }
};

exports.getMedicines = async (req, res, next) => {
  try {
    const { search, category, lowStock, expired, page = 1, limit = 100 } = req.query;
    const skip = (page - 1) * limit;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { manufacturer: { $regex: search, $options: "i" } },
        { batchNumber: { $regex: search, $options: "i" } },
      ];
    }
    if (category) filter.category = { $regex: category, $options: "i" };
    if (expired === "true") filter.expiryDate = { $lt: new Date() };

    // Build query with pagination
    const query = Medicine.find(filter).sort({ name: 1 }).skip(skip).limit(Number(limit));
    const medicines = await query.exec();
    const total = await Medicine.countDocuments(filter);

    // Handle lowStock filter in-memory only if needed (rare case)
    let result = medicines;
    if (lowStock === "true") {
      result = medicines.filter((m) => m.stock <= m.lowStockThreshold);
    }

    const now = new Date();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    const enriched = result.map((m) => {
      const obj = m.toJSON();
      obj.isExpired = m.expiryDate < now;
      obj.isNearExpiry = !obj.isExpired && (m.expiryDate - now) < thirtyDays;
      obj.isLowStock = m.stock <= m.lowStockThreshold;
      return obj;
    });

    return res.status(200).json({ 
      success: true, 
      data: enriched, 
      count: enriched.length,
      total: total,
      page: page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    return next(err);
  }
};

exports.getMedicineById = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ success: false, message: "Medicine not found" });
    return res.status(200).json({ success: true, data: medicine });
  } catch (err) {
    return next(err);
  }
};

exports.updateMedicine = async (req, res, next) => {
  try {
    const { price, stock } = req.body;
    if (price !== undefined && Number(price) < 0) return res.status(400).json({ success: false, message: "Price cannot be negative" });
    if (stock !== undefined && Number(stock) < 0) return res.status(400).json({ success: false, message: "Stock cannot be negative" });

    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      { ...req.body, addedBy: req.user._id },
      { new: true, runValidators: true }
    );
    if (!medicine) return res.status(404).json({ success: false, message: "Medicine not found" });
    return res.status(200).json({ success: true, data: medicine, message: "Medicine updated successfully" });
  } catch (err) {
    if (err.name === "ValidationError") return res.status(400).json({ success: false, message: err.message });
    return next(err);
  }
};

exports.deleteMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine) return res.status(404).json({ success: false, message: "Medicine not found" });
    return res.status(200).json({ success: true, message: "Medicine deleted successfully" });
  } catch (err) {
    return next(err);
  }
};

// ─────────────────────────────────────────────
// SALES CONTROLLERS
// ─────────────────────────────────────────────

exports.createSale = async (req, res, next) => {
  try {
    const { medicines: saleItems, patientName, patientPhone, paymentMethod, discount, notes } = req.body;

    if (!saleItems || !Array.isArray(saleItems) || saleItems.length === 0) {
      return res.status(400).json({ success: false, message: "At least one medicine is required" });
    }

    const processedItems = [];
    let totalAmount = 0;

    for (const item of saleItems) {
      const { medicineId, quantity } = item;
      if (!medicineId || !quantity || Number(quantity) < 1) {
        return res.status(400).json({ success: false, message: "Each item requires medicineId and quantity >= 1" });
      }

      const medicine = await Medicine.findById(medicineId);
      if (!medicine) return res.status(404).json({ success: false, message: `Medicine ID ${medicineId} not found` });

      if (medicine.expiryDate < new Date()) {
        return res.status(400).json({
          success: false,
          message: `Cannot sell "${medicine.name}" — it has expired (${medicine.expiryDate.toLocaleDateString()})`,
        });
      }

      if (medicine.stock < Number(quantity)) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${medicine.name}" — Available: ${medicine.stock}, Requested: ${quantity}`,
        });
      }

      const subtotal = medicine.price * Number(quantity);
      totalAmount += subtotal;
      processedItems.push({ medicineId: medicine._id, medicineName: medicine.name, quantity: Number(quantity), unitPrice: medicine.price, subtotal });
    }

    const discountPercent = Number(discount) || 0;
    const finalAmount = totalAmount - (totalAmount * discountPercent / 100);

    const sale = await Sale.create({
      medicines: processedItems, totalAmount, discount: discountPercent, finalAmount,
      soldBy: req.user._id, pharmacistName: req.user.name,
      patientName: patientName || "Walk-in Customer", patientPhone: patientPhone || "",
      paymentMethod: paymentMethod || "cash", notes: notes || "",
    });

    // Deduct stock
    for (const item of processedItems) {
      await Medicine.findByIdAndUpdate(item.medicineId, { $inc: { stock: -item.quantity } });
    }

    const populated = await Sale.findById(sale._id).populate("soldBy", "name email");
    return res.status(201).json({ success: true, data: populated, message: "Sale created successfully" });
  } catch (err) {
    return next(err);
  }
};

exports.getSales = async (req, res, next) => {
  try {
    const { date, startDate, endDate, search, page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;
    const filter = {};

    if (date) {
      const d = new Date(date);
      filter.createdAt = {
        $gte: new Date(new Date(d).setHours(0, 0, 0, 0)),
        $lte: new Date(new Date(d).setHours(23, 59, 59, 999)),
      };
    } else if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    }

    if (search) {
      filter.$or = [
        { patientName: { $regex: search, $options: "i" } },
        { invoiceNumber: { $regex: search, $options: "i" } },
      ];
    }

    // Use aggregation for efficient total revenue calculation
    const totalRevenueResult = await Sale.aggregate([
      { $match: filter },
      { $group: { _id: null, totalRevenue: { $sum: "$finalAmount" } } },
    ]).exec();
    const totalRevenue = totalRevenueResult[0]?.totalRevenue || 0;

    const sales = await Sale.find(filter).populate("soldBy", "name").sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
    const total = await Sale.countDocuments(filter);

    return res.status(200).json({ 
      success: true, 
      data: sales, 
      count: sales.length,
      total: total,
      page: page,
      pages: Math.ceil(total / limit),
      totalRevenue 
    });
  } catch (err) {
    return next(err);
  }
};

exports.getSaleById = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id).populate("soldBy", "name email");
    if (!sale) return res.status(404).json({ success: false, message: "Sale not found" });
    return res.status(200).json({ success: true, data: sale });
  } catch (err) {
    return next(err);
  }
};

exports.getDailySalesReport = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const report = await Sale.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } },
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: "$finalAmount" },
          avgBillAmount: { $avg: "$finalAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]).exec();

    return res.status(200).json({ success: true, data: report });
  } catch (err) {
    return next(err);
  }
};

// ─────────────────────────────────────────────
// PRESCRIPTION CONTROLLERS
// ─────────────────────────────────────────────

exports.getPrescriptions = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const prescriptions = await Prescription.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: prescriptions, count: prescriptions.length });
  } catch (err) {
    return next(err);
  }
};

exports.fulfillPrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) return res.status(404).json({ success: false, message: "Prescription not found" });
    if (prescription.status === "dispensed") {
      return res.status(400).json({ success: false, message: "Prescription already fulfilled" });
    }

    prescription.status = "dispensed";
    prescription.dispensedAt = new Date();
    prescription.dispensedBy = req.user._id;
    await prescription.save();

    return res.status(200).json({ success: true, data: prescription, message: "Prescription marked as fulfilled" });
  } catch (err) {
    return next(err);
  }
};

// ─────────────────────────────────────────────
// DASHBOARD STATS
// ─────────────────────────────────────────────

exports.getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

    const [totalMedicines, expiredMedicines, nearExpiryMedicines, pendingPrescriptions, todaySales, allMedicines] = await Promise.all([
      Medicine.countDocuments().exec(),
      Medicine.countDocuments({ expiryDate: { $lt: now } }).exec(),
      Medicine.countDocuments({ expiryDate: { $gte: now, $lte: thirtyDaysLater } }).exec(),
      Prescription.countDocuments({ status: "pending" }).exec(),
      Sale.aggregate([
        { $match: { createdAt: { $gte: todayStart } } },
        { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: "$finalAmount" } } },
      ]).exec(),
      Medicine.find({}, "stock lowStockThreshold"),
    ]);

    const lowStockCount = allMedicines.filter((m) => m.stock <= m.lowStockThreshold).length;

    return res.status(200).json({
      success: true,
      data: {
        totalMedicines, expiredMedicines, nearExpiryMedicines,
        lowStockMedicines: lowStockCount, pendingPrescriptions,
        todaySalesCount: todaySales[0]?.count || 0,
        todayRevenue: todaySales[0]?.revenue || 0,
      },
    });
  } catch (err) {
    return next(err);
  }
};
