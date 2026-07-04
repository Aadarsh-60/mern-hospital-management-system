import mongoose from 'mongoose';
// creating ward schema
const wardSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  type: { type: String, enum: ['general', 'icu', 'emergency', 'maternity', 'pediatric', 'orthopedic', 'cardiac', 'surgical'], required: true },
  floor: { type: Number, required: true },
  totalBeds: { type: Number, required: true },
  wardIncharge: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  description: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// exporting ward model
const Ward = mongoose.model('Ward', wardSchema);
export default Ward;
