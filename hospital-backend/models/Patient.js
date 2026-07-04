import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    age: Number,
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    bloodGroup: { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'] },
    address: { street: String, city: String, state: String, pincode: String },
    emergencyContact: { name: String, phone: String, relation: String },
    medicalHistory: [{ condition: String, diagnosedAt: Date, notes: String }],
    allergies: [String],
  },
  { timestamps: true }
);

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;
