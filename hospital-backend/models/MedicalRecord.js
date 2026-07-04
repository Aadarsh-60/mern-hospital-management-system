import mongoose from 'mongoose';
// creating medical record model
const medicalRecordSchema = new mongoose.Schema(
  {
    // patient
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // doctor
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // appointment
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    // diagnosis
    diagnosis: { type: String, required: true },
    // symptoms 
    symptoms: [String],
    // prescription
    prescription: [{ medicine: String, dosage: String, duration: String, instructions: String }],
    // tests
    tests: [{ testName: String, result: String, date: Date }],
    // notes
    notes: String,
    // follow up date
    followUpDate: Date,
  },
  { timestamps: true }
);
// exporting medical record model
const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);
export default MedicalRecord;
