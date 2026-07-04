import mongoose from 'mongoose';
// creating ambulance model
const ambulanceSchema = new mongoose.Schema({

  vehicleNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
  type: { type: String, enum: ['basic', 'advanced', 'icu-mobile', 'neonatal'], default: 'basic' },
  status: { type: String, enum: ['available', 'on-duty', 'maintenance', 'offline'], default: 'available' },
  driver: { name: { type: String, required: true }, phone: { type: String, required: true }, licenseNumber: String },
  equipment: [String],
  currentLocation: { address: String, coordinates: { lat: Number, lng: Number } },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// creating ambulance booking model
const ambulanceBookingSchema = new mongoose.Schema({
  ambulance: { type: mongoose.Schema.Types.ObjectId, ref: 'Ambulance' },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientName: { type: String, required: true },
  patientPhone: { type: String, required: true },
  pickupAddress: { type: String, required: true },
  pickupCoordinates: { lat: Number, lng: Number },
  destination: { type: String, default: 'City Hospital' },
  emergency: { type: Boolean, default: false },
  status: { type: String, enum: ['requested', 'assigned', 'dispatched', 'arrived', 'completed', 'cancelled'], default: 'requested' },
  assignedAt: Date, completedAt: Date, notes: String, estimatedArrival: String,
}, { timestamps: true });

// exporting ambulance model
export const Ambulance = mongoose.model('Ambulance', ambulanceSchema);
// exporting ambulance booking model
export const AmbulanceBooking = mongoose.model('AmbulanceBooking', ambulanceBookingSchema);
