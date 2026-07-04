import express from 'express';
import { createWard, getAllWards, addBed, getAllBeds, getBedSummary, admitPatient, dischargePatient, updateBedStatus } from '../controllers/bedController.js';
import { protect, authorize } from '../middleware/auth.js';
const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Get bed summary
router.get('/summary', getBedSummary);

// Get all wards
router.get('/wards', getAllWards);

// Create a new ward (admin only)
router.post('/wards', authorize('admin'), createWard);

// Get all beds
router.get('/', getAllBeds);

// Add a new bed (admin only)
router.post('/', authorize('admin'), addBed);

// Admit a patient to a bed (admin or doctor)
router.put('/:id/admit', authorize('admin', 'doctor'), admitPatient);

// Discharge a patient from a bed (admin or doctor)
router.put('/:id/discharge', authorize('admin', 'doctor'), dischargePatient);

// Update bed status (admin only)
router.put('/:id/status', authorize('admin'), updateBedStatus);

export default router;
