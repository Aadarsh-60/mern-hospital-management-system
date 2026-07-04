import express from 'express';
import { createMedicalRecord, getMedicalRecordById, updateMedicalRecord, getRecordsByPatient } from '../controllers/medicalRecordController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Create a new medical record
router.post('/', protect, authorize('doctor'), createMedicalRecord);

// Get medical records for a specific patient
router.get('/patient/:patientId', protect, authorize('doctor', 'admin'), getRecordsByPatient);

// Get a single medical record by ID
router.get('/:id', protect, getMedicalRecordById);

// Update a medical record
router.put('/:id', protect, authorize('doctor'), updateMedicalRecord);

export default router;
