import api from './axios';

export const createDoctor = async (doctorData) => {
  const response = await api.post('/admin/doctors', doctorData);
  return response.data;
};

export const createNurse = async (nurseData) => {
  const response = await api.post('/admin/staff', {
    ...nurseData,
    role: 'nurse',
  });
  return response.data;
};

export const createStaff = async (staffData) => {
  const response = await api.post('/admin/staff', staffData);
  return response.data;
};

export const getAllStaff = async () => {
  const response = await api.get('/admin/staff');
  return response.data;
};
