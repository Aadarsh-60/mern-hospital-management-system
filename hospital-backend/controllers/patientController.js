import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import MedicalRecord from '../models/MedicalRecord.js';
import { LabReport } from '../models/LabTest.js';

// Controller for getting patient profile (Updated for nodemon restart)
export const getPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id }).populate('user', 'name email phone avatar');
    if (!patient) return res.status(404).json({ success: false, message: 'Patient profile not found' });
    res.json({ success: true, patient });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// controller for updating patient profile
export const updatePatientProfile = async (req, res) => {
  try {
    const { age, gender, bloodGroup, address, emergencyContact, allergies } = req.body;
    const patient = await Patient.findOneAndUpdate({ user: req.user._id }, { age, gender, bloodGroup, address, emergencyContact, allergies }, { new: true, runValidators: true }).populate('user', 'name email phone');
    if (!patient) return res.status(404).json({ success: false, message: 'Patient profile not found' });
    if (req.body.name || req.body.phone) await User.findByIdAndUpdate(req.user._id, { ...(req.body.name && { name: req.body.name }), ...(req.body.phone && { phone: req.body.phone }) });
    res.json({ success: true, message: 'Profile updated', patient });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// controller for getting patient appointments
export const getPatientAppointments = async (req, res) => {
  try {
    const { status } = req.query;
    let query = { patient: req.user._id };
    if (status) query.status = status;
    const appointments = await Appointment.find(query).populate('doctor', 'name email phone').sort({ appointmentDate: -1 });
    res.json({ success: true, count: appointments.length, appointments });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// controller for getting patient medical records
export const getPatientMedicalRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find({ patient: req.user._id }).populate('doctor', 'name').sort({ createdAt: -1 });
    res.json({ success: true, count: records.length, records });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// controller for getting all patients
export const getAllPatients = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    let patients = await Patient.find().populate('user', 'name email phone').limit(limit * 1).skip((page - 1) * limit).sort({ createdAt: -1 });
    if (search) patients = patients.filter((p) => p.user.name.toLowerCase().includes(search.toLowerCase()));
    const total = await Patient.countDocuments();
    res.json({ success: true, count: patients.length, total, currentPage: Number(page), totalPages: Math.ceil(total / limit), patients });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
