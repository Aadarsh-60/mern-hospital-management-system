import express from 'express';
import { bookAppointment, getAllAppointments, getAppointmentById, updateAppointmentStatus, cancelAppointment, getAvailableSlots } from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/auth.js';
const router = express.Router();

// Get available slots for a doctor
router.get('/slots/:doctorId', getAvailableSlots);

// Book an appointment
router.post('/', protect, authorize('patient'), bookAppointment);

// Get all appointments
router.get('/', protect, authorize('admin'), getAllAppointments);

// Get a single appointment by ID
router.get('/:id', protect, getAppointmentById);

// Update appointment status
router.put('/:id/status', protect, authorize('doctor', 'admin'), updateAppointmentStatus);

// Cancel an appointment
router.put('/:id/cancel', protect, cancelAppointment);
export default router;
