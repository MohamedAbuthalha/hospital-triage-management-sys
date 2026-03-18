import api from './axios';

export const getMyCases = async () => {
  const response = await api.get('/doctors/cases/my');
  return response.data;
};

export const getDashboard = async () => {
  const response = await api.get('/doctors/dashboard');
  return response.data;
};

export const completeCase = async (caseId) => {
  const response = await api.patch(`/doctors/cases/${caseId}/complete`);
  return response.data;
};

export const updateCaseStatus = async (caseId, status) => {
  const response = await api.patch(`/doctors/cases/${caseId}/status`, { status });
  return response.data;
};
