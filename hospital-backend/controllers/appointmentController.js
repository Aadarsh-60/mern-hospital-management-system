import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';

// all slots for appointment
const ALL_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00',
  '14:30', '15:00', '15:30', '16:00', '16:30'];


// controller for booking appointment
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, timeSlot, reason } = req.body;
    const doctorUser = await User.findById(doctorId);

    if (!doctorUser || doctorUser.role !== 'doctor') return res.status(404).json({ success: false, message: 'Doctor not found' });
    const doctorProfile = await Doctor.findOne({ user: doctorId });

    const existing = await Appointment.findOne({ doctor: doctorId, appointmentDate: new Date(appointmentDate), timeSlot, status: { $in: ['pending', 'confirmed'] } });
    if (existing) return res.status(400).json({ success: false, message: 'This time slot is already booked' });

    const appointment = await Appointment.create({ patient: req.user._id, doctor: doctorId, appointmentDate: new Date(appointmentDate), timeSlot, reason, consultationFee: doctorProfile?.consultationFee || 0 });
    const populated = await appointment.populate([{ path: 'patient', select: 'name email phone' }, { path: 'doctor', select: 'name email phone' }]);

    res.status(201).json({ success: true, message: 'Appointment booked successfully', appointment: populated });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};


// controller for getting all appointments
export const getAllAppointments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    let query = {};
    if (status) query.status = status;

    const appointments = await Appointment.find(query).populate('patient', 'name email phone').populate('doctor', 'name email phone').limit(limit * 1).skip((page - 1) * limit).sort({ appointmentDate: -1 });
    const total = await Appointment.countDocuments(query);

    res.json({ success: true, count: appointments.length, total, currentPage: Number(page), totalPages: Math.ceil(total / limit), appointments });

  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// controller for getting appointment by ID
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate('patient', 'name email phone').populate('doctor', 'name email phone');

    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    const userId = req.user._id.toString();

    if (appointment.patient._id.toString() !== userId && appointment.doctor._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });

    }
    res.json({ success: true, appointment });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};


// controller for updating appointment status
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, notes, prescription } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    if (req.user.role === 'doctor' && appointment.doctor.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });
    appointment.status = status || appointment.status;

    if (notes) appointment.notes = notes;
    if (prescription) appointment.prescription = prescription;

    await appointment.save();
    const updated = await Appointment.findById(appointment._id).populate('patient', 'name email phone').populate('doctor', 'name email phone');

    res.json({ success: true, message: 'Appointment updated', appointment: updated });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// controller for cancelling appointment
export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    if (appointment.patient.toString() !== req.user._id.toString() && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Not authorized' });
    if (appointment.status === 'completed') return res.status(400).json({ success: false, message: 'Cannot cancel a completed appointment' });

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ success: true, message: 'Appointment cancelled' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// controller for getting available slots
export const getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;
    const { doctorId } = req.params;

    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);

    const booked = await Appointment.find({ doctor: doctorId, appointmentDate: { $gte: start, $lt: end }, status: { $in: ['pending', 'confirmed'] } }).select('timeSlot');

    const bookedSlots = booked.map((a) => a.timeSlot);

    const availableSlots = ALL_SLOTS.filter((s) => !bookedSlots.includes(s));

    res.json({ success: true, date, availableSlots, bookedSlots });

  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
