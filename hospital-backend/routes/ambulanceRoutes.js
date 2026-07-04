import express from 'express';
import { addAmbulance, getAllAmbulances, updateAmbulance, bookAmbulance, updateBookingStatus, getAllBookings, getMyBookings } from '../controllers/ambulanceController.js';
import { protect, authorize } from '../middleware/auth.js';
const router = express.Router();

// Get all ambulances
router.get('/', protect, getAllAmbulances);

// Add a new ambulance (admin only)
router.post('/', protect, authorize('admin'), addAmbulance);

// Update an ambulance (admin only)
router.put('/:id', protect, authorize('admin'), updateAmbulance);

// Book an ambulance
router.post('/book', protect, bookAmbulance);

// Get all bookings (admin only)
router.get('/bookings', protect, authorize('admin'), getAllBookings);

// Get my bookings (patient only)
router.get('/my-bookings', protect, getMyBookings);

// Update booking status (admin only)
router.put('/bookings/:id/status', protect, authorize('admin'), updateBookingStatus);
export default router;
