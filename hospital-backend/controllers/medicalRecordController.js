import MedicalRecord from '../models/MedicalRecord.js';
import User from '../models/User.js';

// controller for creating medical record
export const createMedicalRecord = async (req, res) => {
  try {
    const { patientId, appointmentId, diagnosis, symptoms, prescription, tests, notes, followUpDate } = req.body;
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') return res.status(404).json({ success: false, message: 'Patient not found' });
    const record = await MedicalRecord.create({ patient: patientId, doctor: req.user._id, appointment: appointmentId, diagnosis, symptoms, prescription, tests, notes, followUpDate });
    const populated = await record.populate([{ path: 'patient', select: 'name email' }, { path: 'doctor', select: 'name email' }]);
    res.status(201).json({ success: true, message: 'Medical record created', record: populated });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// controller for getting medical record by id
export const getMedicalRecordById = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id).populate('patient', 'name email phone').populate('doctor', 'name email').populate('appointment');
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    const userId = req.user._id.toString();
    if (record.patient._id.toString() !== userId && record.doctor._id.toString() !== userId && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Not authorized' });
    res.json({ success: true, record });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// controller for updating medical record
export const updateMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    if (record.doctor.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });
    const updated = await MedicalRecord.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('patient doctor', 'name email');
    res.json({ success: true, message: 'Record updated', record: updated });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// controller for getting records by patient
export const getRecordsByPatient = async (req, res) => {
  try {
    const records = await MedicalRecord.find({ patient: req.params.patientId }).populate('doctor', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, count: records.length, records });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
