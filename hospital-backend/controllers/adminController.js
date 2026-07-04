import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';


// controller for dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    // total counts of doctors, patients, appointments, etc.
    const [totalDoctors, totalPatients, totalAppointments, pendingAppointments, completedAppointments, cancelledAppointments] = await Promise.all([
      User.countDocuments({ role: 'doctor' }), User.countDocuments({ role: 'patient' }), Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'pending' }), Appointment.countDocuments({ status: 'completed' }), Appointment.countDocuments({ status: 'cancelled' }),
    ]);
    // today's appointments count
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const todayAppointments = await Appointment.countDocuments({ appointmentDate: { $gte: today, $lt: tomorrow } });
    const recentAppointments = await Appointment.find().populate('patient', 'name').populate('doctor', 'name').sort({ createdAt: -1 }).limit(5);
    const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // monthly data
    const monthlyData = await Appointment.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
    res.json({ success: true, stats: { totalDoctors, totalPatients, totalAppointments, pendingAppointments, completedAppointments, cancelledAppointments, todayAppointments }, recentAppointments, monthlyData });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// controller for getting all users

export const getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    let query = {};
    if (role) query.role = role;
    const users = await User.find(query).select('-password').limit(limit * 1).skip((page - 1) * limit).sort({ createdAt: -1 });
    const total = await User.countDocuments(query);
    res.json({ success: true, count: users.length, total, currentPage: Number(page), totalPages: Math.ceil(total / limit), users });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};



// controller for toggling user status
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user._id.toString() === req.user._id.toString()) return res.status(400).json({ success: false, message: 'Cannot change your own status' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};



// controller for deleting user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user._id.toString() === req.user._id.toString()) return res.status(400).json({ success: false, message: 'Cannot delete yourself' });
    await User.findByIdAndDelete(req.params.id);
    if (user.role === 'doctor') await Doctor.findOneAndDelete({ user: user._id });
    if (user.role === 'patient') await Patient.findOneAndDelete({ user: user._id });
    res.json({ success: true, message: 'User deleted' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
