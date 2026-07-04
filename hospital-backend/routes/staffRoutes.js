import express from 'express';
import { addStaff, getAllStaff, getStaffById, updateStaff, toggleDutyStatus, getDutyRoster } from '../controllers/staffController.js';
import { protect, authorize } from '../middleware/auth.js';
const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect, authorize('admin'));

// Get duty roster
router.get('/duty-roster', getDutyRoster);

// Get all staff
router.get('/', getAllStaff);

// Add a new staff member
router.post('/', addStaff);

// Get staff member by ID
router.get('/:id', getStaffById);

// Update staff member
router.put('/:id', updateStaff);

// Toggle duty status
router.put('/:id/duty', toggleDutyStatus);
export default router;
