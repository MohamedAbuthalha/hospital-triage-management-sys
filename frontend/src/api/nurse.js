import api from './axios';

export const addVitals = async (caseId, vitalsData) => {
  const response = await api.post(`/nurse/cases/${caseId}/vitals`, vitalsData);
  return response.data;
};
