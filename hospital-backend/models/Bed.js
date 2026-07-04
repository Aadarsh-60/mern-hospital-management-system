import mongoose from 'mongoose';
// creating bed model
const bedSchema = new mongoose.Schema({
  bedNumber: { type: String, required: true, unique: true, trim: true },
  ward: { type: mongoose.Schema.Types.ObjectId, ref: 'Ward', required: true },
  type: { type: String, enum: ['general', 'private', 'semi-private', 'icu', 'emergency', 'maternity', 'pediatric', 'orthopedic', 'cardiac', 'surgical'], default: 'general' },
  status: { type: String, enum: ['available', 'occupied', 'reserved', 'maintenance'], default: 'available' },
  currentPatient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  admittedAt: { type: Date, default: null },
  expectedDischarge: { type: Date, default: null },
  assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  pricePerDay: { type: Number, required: true, default: 500 },
  features: [String],
  floor: { type: Number, default: 1 },
  notes: String,
}, { timestamps: true });

// exporting bed model
const Bed = mongoose.model('Bed', bedSchema);
export default Bed;
