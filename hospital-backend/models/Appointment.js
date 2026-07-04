import mongoose from 'mongoose';
// creating appointment model
const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    appointmentDate: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
    reason: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
    prescription: { type: String, trim: true },
    consultationFee: Number,
    paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  },
  { timestamps: true }
);

// exporting appointment model
const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
