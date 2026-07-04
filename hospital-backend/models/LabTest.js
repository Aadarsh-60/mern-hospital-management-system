import mongoose from 'mongoose';

// creating lab test model
const labTestSchema = new mongoose.Schema({
  // test name
  name: { type: String, required: true, trim: true },
  // test code
  code: { type: String, unique: true, uppercase: true, trim: true },
  // test category
  category: { type: String, enum: ['blood', 'urine', 'imaging', 'biopsy', 'culture', 'cardiac', 'hormonal', 'other'], required: true },
  // test description
  description: String,
  // test price
  price: { type: Number, required: true },
  // test turnaround time
  turnaroundTime: { type: String, default: '24 hours' },
  normalRange: String, unit: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// creating lab report model
const labReportSchema = new mongoose.Schema({
  // patient
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // doctor
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // appointment
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  // tests
  tests: [{ test: { type: mongoose.Schema.Types.ObjectId, ref: 'LabTest' }, result: String, unit: String, normalRange: String, isAbnormal: { type: Boolean, default: false }, notes: String }],
  // status
  status: { type: String, enum: ['ordered', 'sample-collected', 'processing', 'completed', 'cancelled'], default: 'ordered' },
  // ordered at
  orderedAt: { type: Date, default: Date.now }, completedAt: Date,
  reportFile: String,
  technician: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // total amount
  totalAmount: { type: Number, default: 0 },
  // payment status
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  // remarks
  remarks: String,
}, { timestamps: true });
export const LabTest = mongoose.model('LabTest', labTestSchema);
export const LabReport = mongoose.model('LabReport', labReportSchema);
