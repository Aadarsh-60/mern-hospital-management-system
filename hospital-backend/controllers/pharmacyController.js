import { Medicine, Dispensing } from '../models/Medicine.js';

// controller for adding medicine
export const addMedicine = async (req, res) => {
  try { const medicine = await Medicine.create(req.body); res.status(201).json({ success: true, medicine }); }
  catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// controller for getting all medicines
export const getAllMedicines = async (req, res) => {
  try {
    const { category, search, lowStock, expired } = req.query;
    let query = { isActive: true };
    if (category) query.category = category;
    if (search) query.name = new RegExp(search, 'i');
    let medicines = await Medicine.find(query).sort({ name: 1 });
    if (lowStock === 'true') medicines = medicines.filter((m) => m.isLowStock);
    if (expired === 'true') medicines = medicines.filter((m) => m.isExpired);
    res.json({ success: true, count: medicines.length, medicines });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// controller for updating stock
export const updateStock = async (req, res) => {
  try {
    const { quantity, operation } = req.body;
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });
    medicine.stock = operation === 'add' ? medicine.stock + quantity : quantity;
    await medicine.save();
    res.json({ success: true, message: `Stock updated. Current: ${medicine.stock}`, medicine });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// controller for getting low stock alerts
export const getLowStockAlerts = async (req, res) => {
  try {
    const medicines = await Medicine.find({ isActive: true });
    const lowStock = medicines.filter((m) => m.isLowStock);
    const expired = medicines.filter((m) => m.isExpired);
    const expiringSoon = medicines.filter((m) => { if (!m.expiryDate) return false; const d = Math.ceil((m.expiryDate - new Date()) / 86400000); return d > 0 && d <= 30; });
    res.json({ success: true, alerts: { lowStockCount: lowStock.length, expiredCount: expired.length, expiringSoonCount: expiringSoon.length }, lowStock, expired, expiringSoon });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// controller for dispensing medicines
export const dispenseMedicines = async (req, res) => {
  try {
    const { patientId, doctorId, appointmentId, medicines: medicineList, notes } = req.body;
    let totalAmount = 0;
    const processed = [];
    for (const item of medicineList) {
      const medicine = await Medicine.findById(item.medicineId);
      if (!medicine) return res.status(404).json({ success: false, message: `Medicine not found` });
      if (medicine.stock < item.quantity) return res.status(400).json({ success: false, message: `Insufficient stock for ${medicine.name}` });
      const itemTotal = medicine.pricePerUnit * item.quantity;
      totalAmount += itemTotal;
      processed.push({ medicine: medicine._id, quantity: item.quantity, pricePerUnit: medicine.pricePerUnit, totalPrice: itemTotal });
      medicine.stock -= item.quantity;
      await medicine.save();
    }
    const dispensing = await Dispensing.create({ patient: patientId, doctor: doctorId, appointment: appointmentId, medicines: processed, totalAmount, dispensedBy: req.user._id, status: 'dispensed', notes });
    const populated = await Dispensing.findById(dispensing._id).populate('patient', 'name').populate('medicines.medicine', 'name category');
    res.status(201).json({ success: true, message: 'Medicines dispensed', dispensing: populated });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// controller for getting dispensing history
export const getDispensingHistory = async (req, res) => {
  try {
    const { patientId, page = 1, limit = 10 } = req.query;
    let query = {};
    if (patientId) query.patient = patientId;
    const records = await Dispensing.find(query).populate('patient', 'name email').populate('doctor', 'name').populate('medicines.medicine', 'name category').limit(limit * 1).skip((page - 1) * limit).sort({ createdAt: -1 });
    const total = await Dispensing.countDocuments(query);
    res.json({ success: true, count: records.length, total, records });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
