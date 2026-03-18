import api from './axios';

export const createPatientCase = async (patientData) => {
  const response = await api.post('/patients', patientData);
  return response.data;
};
