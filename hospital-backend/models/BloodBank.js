import mongoose from 'mongoose';

const bloodBankSchema = new mongoose.Schema({
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true,
    unique: true
  },
  units: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

const BloodBank = mongoose.model('BloodBank', bloodBankSchema);

export default BloodBank;
