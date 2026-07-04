import mongoose from 'mongoose';
// creating doctor model
const doctorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    specialization: { type: String, required: true, trim: true },
    qualification: { type: String, required: true },
    experience: { type: Number, default: 0 },
    consultationFee: { type: Number, required: true },
    availableSlots: [
      {
        day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
        startTime: String,
        endTime: String,
      },
    ],
    department: { type: String, trim: true },
    bio: { type: String, trim: true },
    isAvailable: { type: Boolean, default: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);
// exporting doctor model
const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;
