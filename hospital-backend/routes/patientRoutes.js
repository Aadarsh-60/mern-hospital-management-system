import express from 'express';
import { getPatientProfile, updatePatientProfile, getPatientAppointments, getPatientMedicalRecords, getAllPatients } from '../controllers/patientController.js';
import { protect, authorize } from '../middleware/auth.js';
const router = express.Router();

// Get all patients
router.get('/', protect, authorize('admin', 'doctor', 'receptionist', 'nurse', 'lab-technician', 'pharmacist'), getAllPatients);

// Get patient profile
router.get('/profile', protect, authorize('patient'), getPatientProfile);

// Update patient profile
router.put('/profile', protect, authorize('patient'), updatePatientProfile);

// Get patient appointments
router.get('/appointments', protect, authorize('patient'), getPatientAppointments);

// Get patient medical records
router.get('/medical-records', protect, authorize('patient'), getPatientMedicalRecords);

export default router;
