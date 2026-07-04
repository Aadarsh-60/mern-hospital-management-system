import mongoose from 'mongoose';
// creating medicine schema
const medicineSchema = new mongoose.Schema({
  // medicine name
  name: { type: String, required: true, trim: true },
  // generic name
  genericName: { type: String, trim: true },
  // medicine category
  category: { type: String, enum: ['tablet', 'capsule', 'syrup', 'injection', 'ointment', 'drops', 'inhaler', 'other'], required: true },
  // medicine manufacturer
  manufacturer: String, description: String,
  // medicine stock
  stock: { type: Number, required: true, default: 0, min: 0 },
  // medicine unit
  unit: { type: String, enum: ['strip', 'bottle', 'vial', 'tube', 'piece'], default: 'strip' },
  // medicine price per unit
  pricePerUnit: { type: Number, required: true },
  // medicine reorder level
  reorderLevel: { type: Number, default: 10 },
  // medicine expiry date
  expiryDate: Date,
  // medicine batch number
  batchNumber: String,
  // requires prescription
  requiresPrescription: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// virtual field for low stock
medicineSchema.virtual('isLowStock').get(function () { return this.stock <= this.reorderLevel; });
// virtual field for expired medicine
medicineSchema.virtual('isExpired').get(function () { return this.expiryDate && new Date() > this.expiryDate; });
medicineSchema.set('toJSON', { virtuals: true });

// creating dispensing schema
const dispensingSchema = new mongoose.Schema({
  // patient
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // doctor
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // appointment
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  // medicines
  medicines: [{ medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' }, quantity: { type: Number, required: true }, pricePerUnit: Number, totalPrice: Number }],
  // total amount
  totalAmount: { type: Number, default: 0 },
  // dispensed by
  dispensedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // status
  status: { type: String, enum: ['pending', 'dispensed', 'cancelled'], default: 'pending' },
  // notes
  notes: String,
}, { timestamps: true });


// exporting medicine model
export const Medicine = mongoose.model('Medicine', medicineSchema);
export const Dispensing = mongoose.model('Dispensing', dispensingSchema);
