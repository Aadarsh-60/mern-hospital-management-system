import mongoose from 'mongoose';

// creating staff schema
const staffSchema = new mongoose.Schema({

  // creating user(staff)
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeeId: { type: String, unique: true, trim: true },
  designation: { type: String, enum: ['nurse', 'pharmacist', 'lab-technician', 'receptionist', 'ward-boy', 'cleaner', 'security', 'other'], required: true },
  department: { type: String, trim: true },
  ward: { type: mongoose.Schema.Types.ObjectId, ref: 'Ward', default: null },
  shift: { type: String, enum: ['morning', 'evening', 'night', 'rotational'], default: 'morning' },
  shiftTiming: { start: { type: String, default: '08:00' }, end: { type: String, default: '16:00' } },
  joiningDate: { type: Date, default: Date.now },
  salary: Number,
  qualifications: [String],
  emergencyContact: { name: String, phone: String, relation: String },
  isOnDuty: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// creating employee id automatically
staffSchema.pre('save', async function (next) {
  if (!this.employeeId) {
    const count = await mongoose.model('Staff').countDocuments();
    this.employeeId = `EMP${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// exporting staff model
const Staff = mongoose.model('Staff', staffSchema);
export default Staff;
