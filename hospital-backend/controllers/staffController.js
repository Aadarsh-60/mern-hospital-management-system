import User from '../models/User.js';
import Staff from '../models/Staff.js';


// controller for adding staff
export const addStaff = async (req, res) => {
  try {
    const { name, email, password, phone, designation, department, ward, shift, shiftTiming, salary, qualifications } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ success: false, message: 'Email already registered' });
    const user = await User.create({ name, email, password: password || 'staff123', role: designation === 'receptionist' ? 'receptionist' : designation === 'nurse' ? 'nurse' : 'admin', phone, isEmailVerified: true });
    const staff = await Staff.create({ user: user._id, designation, department, ward, shift, shiftTiming, salary, qualifications });
    const populated = await staff.populate('user', 'name email phone');
    res.status(201).json({ success: true, message: `Staff added. Default password: ${password || 'staff123'}`, staff: populated });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// controller for getting all staff
export const getAllStaff = async (req, res) => {
  try {
    const { designation, ward, shift, isOnDuty } = req.query;
    let query = { isActive: true };
    if (designation) query.designation = designation; if (ward) query.ward = ward;
    if (shift) query.shift = shift; if (isOnDuty !== undefined) query.isOnDuty = isOnDuty === 'true';
    const staff = await Staff.find(query).populate('user', 'name email phone').populate('ward', 'name type').sort({ createdAt: -1 });
    res.json({ success: true, count: staff.length, staff });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// controller for getting staff by id
export const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id).populate('user', 'name email phone').populate('ward', 'name type');
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });
    res.json({ success: true, staff });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// controller for updating staff
export const updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('user', 'name email phone').populate('ward', 'name');
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });
    res.json({ success: true, staff });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// controller for toggling duty status
export const toggleDutyStatus = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });
    staff.isOnDuty = !staff.isOnDuty;
    await staff.save();
    res.json({ success: true, message: `Staff is ${staff.isOnDuty ? 'ON' : 'OFF'} duty`, staff });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// controller for getting duty roster
export const getDutyRoster = async (req, res) => {
  try {
    const [onDuty, offDuty, byDesignation] = await Promise.all([
      Staff.countDocuments({ isOnDuty: true, isActive: true }), Staff.countDocuments({ isOnDuty: false, isActive: true }),
      Staff.aggregate([{ $match: { isActive: true } }, { $group: { _id: '$designation', total: { $sum: 1 }, onDuty: { $sum: { $cond: ['$isOnDuty', 1, 0] } } } }, { $sort: { _id: 1 } }]),
    ]);
    res.json({ success: true, roster: { onDuty, offDuty, total: onDuty + offDuty, byDesignation } });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
