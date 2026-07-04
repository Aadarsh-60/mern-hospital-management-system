import express from 'express';
import { addMedicine, getAllMedicines, updateStock, getLowStockAlerts, dispenseMedicines, getDispensingHistory } from '../controllers/pharmacyController.js';
import { protect, authorize } from '../middleware/auth.js';
const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Get all medicines
router.get('/medicines', getAllMedicines);

// Add a new medicine (admin only)
router.post('/medicines', authorize('admin'), addMedicine);

// Update medicine stock (admin only)
router.put('/medicines/:id/stock', authorize('admin'), updateStock);

// Get low stock alerts (admin only)
router.get('/alerts', authorize('admin'), getLowStockAlerts);

// Dispense medicines (admin only)
router.post('/dispense', authorize('admin'), dispenseMedicines);

// Get dispensing history (admin only)
router.get('/dispensing', authorize('admin'), getDispensingHistory);

export default router;
