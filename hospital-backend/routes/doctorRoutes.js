import express from 'express';
import { getAllDoctors, getDoctorById, updateDoctorProfile, getDoctorAppointments, getSpecializations } from '../controllers/doctorController.js';
import { protect, authorize } from '../middleware/auth.js';
const router = express.Router();

// Get all doctors
router.get('/', getAllDoctors);

// Get list of specializations
router.get('/specializations', getSpecializations);

// Get doctor's appointments (protected)
router.get('/appointments', protect, authorize('doctor'), getDoctorAppointments);

// Get doctor by ID
router.get('/:id', getDoctorById);

// Update doctor profile (protected)
router.put('/profile', protect, authorize('doctor'), updateDoctorProfile);
export default router;
