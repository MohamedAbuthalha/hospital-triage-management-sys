import api from "./axios";

// MESSAGES
export const sendMessage = (data) => api.post("/messages/send", data).then((r) => r.data);
export const getMyMessages = (userId) => api.get(`/messages/${userId}`).then((r) => r.data);
export const markMessagesRead = () => api.patch("/messages/mark-read").then((r) => r.data);

// RECEPTIONIST
export const registerPatient = (data) => api.post("/reception/patients", data).then((r) => r.data);
export const getAllPatients = () => api.get("/reception/patients").then((r) => r.data);
export const getTodayPatients = () => api.get("/reception/patients/today").then((r) => r.data);
export const createAppointment = (data) => api.post("/reception/appointments", data).then((r) => r.data);
export const getAppointments = () => api.get("/reception/appointments").then((r) => r.data);

// NURSE CARE
export const getNursePatients = () => api.get("/nurse-care/all-patients").then((r) => r.data);
export const updateVitals = (id, data) => api.patch(`/nurse-care/patients/${id}/vitals`, data).then((r) => r.data);
export const updateCareStatus = (id, data) => api.patch(`/nurse-care/patients/${id}/care-status`, data).then((r) => r.data);

// LAB
export const getLabRequests = () => api.get("/lab").then((r) => r.data);
export const updateTestStatus = (id, data) => api.patch(`/lab/${id}`, data).then((r) => r.data);

// PHARMACY
export const getPrescriptions = () => api.get("/pharmacy/prescriptions").then((r) => r.data);
export const dispensePrescription = (id) => api.patch(`/pharmacy/prescriptions/${id}/dispense`).then((r) => r.data);
export const getInventory = () => api.get("/pharmacy/inventory").then((r) => r.data);
export const addInventoryItem = (data) => api.post("/pharmacy/inventory", data).then((r) => r.data);
export const updateInventoryItem = (id, data) => api.patch(`/pharmacy/inventory/${id}`, data).then((r) => r.data);

// WARD
export const getBeds = () => api.get("/ward/beds").then((r) => r.data);
export const addBed = (data) => api.post("/ward/beds", data).then((r) => r.data);
export const assignBed = (id, data) => api.patch(`/ward/beds/${id}/assign`, data).then((r) => r.data);
export const releaseBed = (id) => api.patch(`/ward/beds/${id}/release`).then((r) => r.data);
export const getWeeklyTasks = () => api.get("/ward/tasks").then((r) => r.data);
export const completeTask = (id) => api.patch(`/ward/tasks/${id}/complete`).then((r) => r.data);
export const closeWeek = () => api.post("/ward/tasks/close-week").then((r) => r.data);

// ADMIN OVERVIEW
export const getDoctorOverview = () => api.get("/admin/doctors/overview").then((r) => r.data);
export const getDoctorDetail = (id) => api.get(`/admin/doctors/${id}/detail`).then((r) => r.data);
export const adminSendMessage = (data) => api.post("/admin/send-message", data).then((r) => r.data);
export const getAllStaffForMessage = () => api.get("/admin/staff").then((r) => r.data);

// CLEANLINESS
export const submitCleanReport = (data) => api.post("/cleanliness/report", data).then((r) => r.data);
export const getCleanReports = (params = {}) => api.get("/cleanliness/reports", { params }).then((r) => r.data);
export const getCleanReportById = (id) => api.get(`/cleanliness/reports/${id}`).then((r) => r.data);
