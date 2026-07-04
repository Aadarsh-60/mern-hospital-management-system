import express from 'express';
import { getBloodStock, updateBloodStock } from '../controllers/bloodBankController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Everyone can view the blood bank stock
router.get('/', protect, getBloodStock);

// Only admins, receptionists, and nurses can update the stock
router.put('/', protect, authorize('admin', 'receptionist', 'nurse'), updateBloodStock);

export default router;
