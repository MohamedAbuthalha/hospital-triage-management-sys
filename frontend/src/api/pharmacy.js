import api from "./axios";

// ── Dashboard ─────────────────────────────────────────────
export const getPharmacyStats = () => api.get("/pharmacy/stats").then((r) => r.data);

// ── Medicines ─────────────────────────────────────────────
export const getMedicines = (params = {}) =>
  api.get("/pharmacy/medicines", { params }).then((r) => r.data);

export const getMedicineById = (id) =>
  api.get(`/pharmacy/medicines/${id}`).then((r) => r.data);

export const addMedicine = (data) =>
  api.post("/pharmacy/medicines", data).then((r) => r.data);

export const updateMedicine = (id, data) =>
  api.put(`/pharmacy/medicines/${id}`, data).then((r) => r.data);

export const deleteMedicine = (id) =>
  api.delete(`/pharmacy/medicines/${id}`).then((r) => r.data);

// ── Sales ─────────────────────────────────────────────────
export const createSale = (data) =>
  api.post("/pharmacy/sales", data).then((r) => r.data);

export const getSales = (params = {}) =>
  api.get("/pharmacy/sales", { params }).then((r) => r.data);

export const getSaleById = (id) =>
  api.get(`/pharmacy/sales/${id}`).then((r) => r.data);

export const getDailySalesReport = (days = 7) =>
  api.get("/pharmacy/sales/report/daily", { params: { days } }).then((r) => r.data);

// ── Prescriptions ─────────────────────────────────────────
export const getPrescriptions = (params = {}) =>
  api.get("/pharmacy/prescriptions", { params }).then((r) => r.data);

export const fulfillPrescription = (id) =>
  api.put(`/pharmacy/prescriptions/${id}/fulfill`).then((r) => r.data);
