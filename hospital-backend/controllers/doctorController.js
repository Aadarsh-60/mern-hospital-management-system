import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';

// controller for getting all doctors
export const getAllDoctors = async (req, res) => {
  try {
    const { specialization, search, page = 1, limit = 10 } = req.query;
    let query = {};
    if (specialization) query.specialization = new RegExp(specialization, 'i');
    let doctors = await Doctor.find(query).populate('user', 'name email phone avatar').limit(limit * 1).skip((page - 1) * limit).sort({ rating: -1 });
    if (search) doctors = doctors.filter((d) => d.user.name.toLowerCase().includes(search.toLowerCase()));
    const total = await Doctor.countDocuments(query);
    res.json({ success: true, count: doctors.length, total, currentPage: Number(page), totalPages: Math.ceil(total / limit), doctors });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// controller for getting doctor by ID
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('user', 'name email phone avatar');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, doctor });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// controller for updating doctor profile
export const updateDoctorProfile = async (req, res) => {
  try {
    const { specialization, qualification, experience, consultationFee, availableSlots, department, bio } = req.body;
    const doctor = await Doctor.findOneAndUpdate({ user: req.user._id }, { specialization, qualification, experience, consultationFee, availableSlots, department, bio }, { new: true, runValidators: true }).populate('user', 'name email phone');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    if (req.body.name || req.body.phone) await User.findByIdAndUpdate(req.user._id, { ...(req.body.name && { name: req.body.name }), ...(req.body.phone && { phone: req.body.phone }) });
    res.json({ success: true, message: 'Profile updated', doctor });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// controller for getting doctor appointments
export const getDoctorAppointments = async (req, res) => {
  try {
    const { status, date } = req.query;
    let query = { doctor: req.user._id };
    if (status) query.status = status;
    if (date) { const start = new Date(date); const end = new Date(date); end.setDate(end.getDate() + 1); query.appointmentDate = { $gte: start, $lt: end }; }
    const appointments = await Appointment.find(query).populate('patient', 'name email phone').sort({ appointmentDate: 1 });
    res.json({ success: true, count: appointments.length, appointments });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// controllers for getting specializations 
export const getSpecializations = async (req, res) => {
  try {
    const specs = await Doctor.distinct('specialization');
    res.json({ success: true, specializations: specs });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
