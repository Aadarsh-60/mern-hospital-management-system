import express from 'express';
import { getDashboardStats, getAllUsers, toggleUserStatus, deleteUser } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';
const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Get dashboard stats (admin, receptionist, doctor)
router.get('/dashboard', authorize('admin', 'receptionist'), getDashboardStats);

// Get all users
router.get('/users', authorize('admin'), getAllUsers);

// Toggle user status
router.put('/users/:id/toggle', authorize('admin'), toggleUserStatus);

// Delete user
router.delete('/users/:id', authorize('admin'), deleteUser);
export default router;
