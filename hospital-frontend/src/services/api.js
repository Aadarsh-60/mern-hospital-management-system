import axios from 'axios';

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const loginAPI = (data) => API.post('/auth/login', data);
export const registerAPI = (data) => API.post('/auth/register', data);
export const resendVerificationAPI = (data) => API.post('/auth/resend-verification', data);
export const getMeAPI = () => API.get('/auth/me');
export const updatePasswordAPI = (data) => API.put('/auth/update-password', data);
export const forgotPasswordAPI = (data) => API.post('/auth/forgot-password', data);
export const verifyEmailAPI = (token) => API.get(`/auth/verify-email/${token}`);
export const resetPasswordAPI = (token, data) => API.put(`/auth/reset-password/${token}`, data);
export const googleAuthAPI = (data) => API.post('/auth/google', data);

// Doctors
export const getDoctorsAPI = (params) => API.get('/doctors', { params });
export const getSpecializationsAPI = () => API.get('/doctors/specializations');
export const getDoctorByIdAPI = (id) => API.get(`/doctors/${id}`);
export const updateDoctorProfileAPI = (data) => API.put('/doctors/profile', data);
export const getDoctorAppointmentsAPI = () => API.get('/doctors/appointments');

// Patients
export const getAllPatientsAPI = (params) => API.get('/patients', { params });
export const getPatientProfileAPI = () => API.get('/patients/profile');
export const updatePatientProfileAPI = (data) => API.put('/patients/profile', data);
export const getPatientAppointmentsAPI = () => API.get('/patients/appointments');
export const getPatientMedicalRecordsAPI = () => API.get('/patients/medical-records');

// Appointments
export const getAvailableSlotsAPI = (doctorId) => API.get(`/appointments/slots/${doctorId}`);
export const bookAppointmentAPI = (data) => API.post('/appointments', data);
export const getAllAppointmentsAPI = (params) => API.get('/appointments', { params });
export const getAppointmentByIdAPI = (id) => API.get(`/appointments/${id}`);
export const updateAppointmentStatusAPI = (id, data) => API.put(`/appointments/${id}/status`, data);
export const cancelAppointmentAPI = (id) => API.put(`/appointments/${id}/cancel`);

// Medical Records
export const createMedicalRecordAPI = (data) => API.post('/medical-records', data);
export const getRecordsByPatientAPI = (patientId) => API.get(`/medical-records/patient/${patientId}`);
export const getMedicalRecordByIdAPI = (id) => API.get(`/medical-records/${id}`);
export const updateMedicalRecordAPI = (id, data) => API.put(`/medical-records/${id}`, data);

// Admin
export const getDashboardStatsAPI = () => API.get('/admin/dashboard');
export const getAllUsersAPI = (params) => API.get('/admin/users', { params });
export const toggleUserStatusAPI = (id) => API.put(`/admin/users/${id}/toggle`);
export const deleteUserAPI = (id) => API.delete(`/admin/users/${id}`);

// Beds
export const getBedSummaryAPI = () => API.get('/beds/summary');
export const getAllWardsAPI = () => API.get('/beds/wards');
export const createWardAPI = (data) => API.post('/beds/wards', data);
export const getAllBedsAPI = () => API.get('/beds');
export const addBedAPI = (data) => API.post('/beds', data);
export const admitPatientAPI = (id, data) => API.put(`/beds/${id}/admit`, data);
export const dischargePatientAPI = (id) => API.put(`/beds/${id}/discharge`);
export const updateBedStatusAPI = (id, data) => API.put(`/beds/${id}/status`, data);

// Ambulance
export const getAllAmbulancesAPI = () => API.get('/ambulance');
export const addAmbulanceAPI = (data) => API.post('/ambulance', data);
export const updateAmbulanceAPI = (id, data) => API.put(`/ambulance/${id}`, data);
export const bookAmbulanceAPI = (data) => API.post('/ambulance/book', data);
export const getAllBookingsAPI = () => API.get('/ambulance/bookings');
export const getMyBookingsAPI = () => API.get('/ambulance/my-bookings');
export const updateBookingStatusAPI = (id, data) => API.put(`/ambulance/bookings/${id}/status`, data);

// Pharmacy
export const getAllMedicinesAPI = () => API.get('/pharmacy/medicines');
export const addMedicineAPI = (data) => API.post('/pharmacy/medicines', data);
export const updateStockAPI = (id, data) => API.put(`/pharmacy/medicines/${id}/stock`, data);
export const getLowStockAlertsAPI = () => API.get('/pharmacy/alerts');
export const dispenseMedicinesAPI = (data) => API.post('/pharmacy/dispense', data);
export const getDispensingHistoryAPI = () => API.get('/pharmacy/dispensing');

// Staff
export const getAllStaffAPI = () => API.get('/staff');
export const addStaffAPI = (data) => API.post('/staff', data);
export const getStaffByIdAPI = (id) => API.get(`/staff/${id}`);
export const updateStaffAPI = (id, data) => API.put(`/staff/${id}`, data);
export const toggleDutyStatusAPI = (id) => API.put(`/staff/${id}/duty`);
export const getDutyRosterAPI = () => API.get('/staff/duty-roster');

// Lab
export const getAllLabTestsAPI = () => API.get('/lab/tests');
export const addLabTestAPI = (data) => API.post('/lab/tests', data);
export const orderLabTestsAPI = (data) => API.post('/lab/reports', data);
export const getLabReportsAPI = () => API.get('/lab/reports');
export const getLabReportByIdAPI = (id) => API.get(`/lab/reports/${id}`);
export const updateLabResultsAPI = (id, data) => API.put(`/lab/reports/${id}/results`, data);
export const updateReportStatusAPI = (id, data) => API.put(`/lab/reports/${id}/status`, data);

// Blood Bank
export const getBloodStockAPI = () => API.get('/bloodbank');
export const updateBloodStockAPI = (data) => API.put('/bloodbank', data);

export default API;
