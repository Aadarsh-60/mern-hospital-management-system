import 'dotenv/config';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Ward from '../models/Ward.js';
import Bed from '../models/Bed.js';
import { Ambulance } from '../models/Ambulance.js';
import { Medicine } from '../models/Medicine.js';
import Staff from '../models/Staff.js';
import { LabTest } from '../models/LabTest.js';

const seed = async () => {
  await connectDB();
  try {
    // ── Clear ALL collections ──────────────────────────
    await Promise.all([
      User.deleteMany(),
      Doctor.deleteMany(),
      Patient.deleteMany(),
      Ward.deleteMany(),
      Bed.deleteMany(),
      Ambulance.deleteMany(),
      Medicine.deleteMany(),
      Staff.deleteMany(),
      LabTest.deleteMany(),
    ]);
    console.log('🗑️  Cleared all existing data\n');

    // ── 1. ADMIN ───────────────────────────────────────
    await User.create({
      name: 'Admin User',
      email: 'admin@hospital.com',
      password: 'admin123',
      role: 'admin',
      phone: '9999999999',
      isEmailVerified: true,
    });
    console.log('✅ Admin: admin@hospital.com / admin123');

    // ── 2. DOCTORS ─────────────────────────────────────
    const doctorData = [
      { name: 'Dr. Rahul Sharma', email: 'rahul@hospital.com', spec: 'Cardiology', qual: 'MD Cardiology - AIIMS Delhi', exp: 10, fee: 800 },
      { name: 'Dr. Priya Patel', email: 'priya@hospital.com', spec: 'Neurology', qual: 'DM Neurology - PGI Chandigarh', exp: 8, fee: 900 },
      { name: 'Dr. Amit Verma', email: 'amit@hospital.com', spec: 'Orthopedics', qual: 'MS Orthopedics - AIIMS Mumbai', exp: 12, fee: 700 },
      { name: 'Dr. Sneha Joshi', email: 'sneha@hospital.com', spec: 'Pediatrics', qual: 'MD Pediatrics - Kasturba', exp: 6, fee: 600 },
    ];
    const doctorUsers = [];
    for (const d of doctorData) {
      const user = await User.create({
        name: d.name, email: d.email, password: 'doctor123',
        role: 'doctor', phone: '9876543210', isEmailVerified: true,
      });
      await Doctor.create({
        user: user._id,
        specialization: d.spec,
        qualification: d.qual,
        experience: d.exp,
        consultationFee: d.fee,
        availableSlots: [
          { day: 'Monday', startTime: '09:00', endTime: '13:00' },
          { day: 'Wednesday', startTime: '09:00', endTime: '13:00' },
          { day: 'Friday', startTime: '14:00', endTime: '18:00' },
        ],
        isAvailable: true,
        rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
      });
      doctorUsers.push(user);
      console.log(`✅ Doctor: ${d.email} / doctor123`);
    }

    // ── 3. PATIENTS ────────────────────────────────────
    const patientData = [
      { name: 'Avinash Kumar', email: 'avinash@test.com', blood: 'B+', age: 22 },
      { name: 'Rohan Singh', email: 'rohan@test.com', blood: 'O+', age: 28 },
    ];
    const patientUsers = [];
    for (const p of patientData) {
      const user = await User.create({
        name: p.name, email: p.email, password: 'patient123',
        role: 'patient', phone: '9123456789', isEmailVerified: true,
      });
      await Patient.create({
        user: user._id,
        age: p.age,
        gender: 'Male',
        bloodGroup: p.blood,
        address: { street: '42 Vijay Nagar', city: 'Indore', state: 'MP', pincode: '452001' },
        emergencyContact: { name: 'Rajesh Kumar', phone: '9999888877', relation: 'Father' },
        allergies: ['Penicillin'],
      });
      patientUsers.push(user);
      console.log(`✅ Patient: ${p.email} / patient123`);
    }

    // ── 4. RECEPTIONIST ────────────────────────────────
    await User.create({
      name: 'Meena Receptionist', email: 'meena@hospital.com',
      password: 'recep123', role: 'receptionist',
      phone: '9000000001', isEmailVerified: true,
    });
    console.log('✅ Receptionist: meena@hospital.com / recep123');

    // ── 5. NURSE ───────────────────────────────────────
    const nurseUser = await User.create({
      name: 'Sunita Nurse', email: 'sunita@hospital.com',
      password: 'nurse123', role: 'nurse',
      phone: '9000000002', isEmailVerified: true,
    });
    console.log('✅ Nurse: sunita@hospital.com / nurse123');

    // ── 6. WARDS ───────────────────────────────────────
    console.log('\n🏥 Seeding Wards...');
    const wardData = [
      { name: 'General Ward A', type: 'general', floor: 1, totalBeds: 20 },
      { name: 'ICU Ward', type: 'icu', floor: 2, totalBeds: 10 },
      { name: 'Emergency Ward', type: 'emergency', floor: 1, totalBeds: 8 },
      { name: 'Maternity Ward', type: 'maternity', floor: 3, totalBeds: 12 },
      { name: 'Pediatric Ward', type: 'pediatric', floor: 3, totalBeds: 10 },
    ];
    const wards = [];
    for (const w of wardData) {
      const ward = await Ward.create({ ...w, wardIncharge: nurseUser._id, isActive: true });
      wards.push(ward);
      console.log(`✅ Ward: ${w.name}`);
    }

    // ── 7. BEDS ────────────────────────────────────────
    console.log('\n🛏️  Seeding Beds...');
    const bedSeeds = [
      // General Ward — 5 beds
      { bedNumber: 'G-101', ward: wards[0], type: 'general', status: 'available', price: 500 },
      { bedNumber: 'G-102', ward: wards[0], type: 'general', status: 'occupied', price: 500 },
      { bedNumber: 'G-103', ward: wards[0], type: 'general', status: 'available', price: 500 },
      { bedNumber: 'G-104', ward: wards[0], type: 'private', status: 'reserved', price: 1500 },
      { bedNumber: 'G-105', ward: wards[0], type: 'general', status: 'maintenance', price: 500 },
      // ICU — 3 beds
      { bedNumber: 'I-201', ward: wards[1], type: 'icu', status: 'available', price: 5000 },
      { bedNumber: 'I-202', ward: wards[1], type: 'icu', status: 'occupied', price: 5000 },
      { bedNumber: 'I-203', ward: wards[1], type: 'icu', status: 'available', price: 5000 },
      // Emergency — 2 beds
      { bedNumber: 'E-101', ward: wards[2], type: 'emergency', status: 'available', price: 2000 },
      { bedNumber: 'E-102', ward: wards[2], type: 'emergency', status: 'occupied', price: 2000 },
    ];
    for (const b of bedSeeds) {
      await Bed.create({
        bedNumber: b.bedNumber,
        ward: b.ward._id,
        type: b.type,
        status: b.status,
        pricePerDay: b.price,
        floor: b.ward.floor,
        features: b.type === 'icu' ? ['ventilator', 'oxygen', 'monitor'] : ['oxygen', 'call-button'],
        currentPatient: b.status === 'occupied' ? patientUsers[0]._id : null,
        assignedDoctor: b.status === 'occupied' ? doctorUsers[0]._id : null,
        admittedAt: b.status === 'occupied' ? new Date() : null,
      });
    }
    console.log(`✅ Beds: 10 beds seeded (General, ICU, Emergency)`);

    // ── 8. AMBULANCES ──────────────────────────────────
    console.log('\n🚑 Seeding Ambulances...');
    const ambulanceData = [
      { vehicleNumber: 'MP09AB1234', type: 'advanced', status: 'available', driverName: 'Ramesh Yadav', driverPhone: '9876501111', equipment: ['defibrillator', 'oxygen', 'stretcher', 'IV-kit'] },
      { vehicleNumber: 'MP09CD5678', type: 'basic', status: 'available', driverName: 'Suresh Patel', driverPhone: '9876502222', equipment: ['oxygen', 'stretcher', 'first-aid'] },
      { vehicleNumber: 'MP09EF9012', type: 'icu-mobile', status: 'on-duty', driverName: 'Mahesh Sharma', driverPhone: '9876503333', equipment: ['ventilator', 'defibrillator', 'oxygen', 'stretcher'] },
      { vehicleNumber: 'MP09GH3456', type: 'basic', status: 'maintenance', driverName: 'Dinesh Kumar', driverPhone: '9876504444', equipment: ['oxygen', 'stretcher'] },
    ];
    for (const a of ambulanceData) {
      await Ambulance.create({
        vehicleNumber: a.vehicleNumber,
        type: a.type,
        status: a.status,
        driver: { name: a.driverName, phone: a.driverPhone, licenseNumber: `DL-MP-${Math.floor(Math.random() * 999999)}` },
        equipment: a.equipment,
        currentLocation: { address: 'City Hospital, Indore' },
        isActive: true,
      });
      console.log(`✅ Ambulance: ${a.vehicleNumber} (${a.type}) — ${a.status}`);
    }

    // ── 9. MEDICINES ───────────────────────────────────
    console.log('\n💊 Seeding Medicines...');
    const medicineData = [
      { name: 'Paracetamol 500mg', generic: 'Acetaminophen', cat: 'tablet', mfg: 'Cipla', stock: 500, price: 25, reorder: 50, expiry: '2026-12-31', rx: false },
      { name: 'Amoxicillin 250mg', generic: 'Amoxicillin', cat: 'capsule', mfg: 'Sun Pharma', stock: 200, price: 85, reorder: 30, expiry: '2026-06-30', rx: true },
      { name: 'Ibuprofen 400mg', generic: 'Ibuprofen', cat: 'tablet', mfg: 'Abbott', stock: 300, price: 35, reorder: 40, expiry: '2026-09-30', rx: false },
      { name: 'Metformin 500mg', generic: 'Metformin HCl', cat: 'tablet', mfg: 'USV', stock: 150, price: 45, reorder: 25, expiry: '2026-03-31', rx: true },
      { name: 'Atorvastatin 20mg', generic: 'Atorvastatin', cat: 'tablet', mfg: 'Ranbaxy', stock: 8, price: 120, reorder: 20, expiry: '2026-11-30', rx: true },
      { name: 'Cough Syrup 100ml', generic: 'Dextromethorphan', cat: 'syrup', mfg: 'Pfizer', stock: 80, price: 95, reorder: 15, expiry: '2025-08-31', rx: false },
      { name: 'Normal Saline 500ml', generic: 'Sodium Chloride', cat: 'injection', mfg: 'Baxter', stock: 50, price: 180, reorder: 20, expiry: '2026-12-31', rx: true },
      { name: 'Azithromycin 500mg', generic: 'Azithromycin', cat: 'tablet', mfg: 'Cipla', stock: 5, price: 95, reorder: 15, expiry: '2025-12-31', rx: true },
      { name: 'Omeprazole 20mg', generic: 'Omeprazole', cat: 'capsule', mfg: 'Sun Pharma', stock: 220, price: 55, reorder: 30, expiry: '2027-01-31', rx: false },
      { name: 'Insulin Glargine', generic: 'Insulin', cat: 'injection', mfg: 'Sanofi', stock: 30, price: 1200, reorder: 10, expiry: '2025-10-31', rx: true },
    ];
    for (const m of medicineData) {
      await Medicine.create({
        name: m.name, genericName: m.generic, category: m.cat,
        manufacturer: m.mfg, stock: m.stock, unit: 'strip',
        pricePerUnit: m.price, reorderLevel: m.reorder,
        expiryDate: new Date(m.expiry),
        batchNumber: `BATCH${Math.floor(Math.random() * 99999)}`,
        requiresPrescription: m.rx, isActive: true,
      });
      console.log(`✅ Medicine: ${m.name} (stock: ${m.stock})`);
    }

    // ── 10. STAFF ──────────────────────────────────────
    console.log('\n👥 Seeding Staff...');
    const staffData = [
      { name: 'Sunita Sharma', email: 's2@hospital.com', desig: 'nurse', dept: 'General Ward', shift: 'morning' },
      { name: 'Rakesh Tiwari', email: 'r2@hospital.com', desig: 'ward-boy', dept: 'ICU', shift: 'evening' },
      { name: 'Geeta Pandey', email: 'g1@hospital.com', desig: 'lab-technician', dept: 'Pathology Lab', shift: 'morning' },
      { name: 'Ajay Mishra', email: 'a1@hospital.com', desig: 'pharmacist', dept: 'Pharmacy', shift: 'morning' },
      { name: 'Priya Gupta', email: 'p1@hospital.com', desig: 'receptionist', dept: 'OPD', shift: 'morning' },
    ];
    for (const s of staffData) {
      const user = await User.create({
        name: s.name, email: s.email, password: 'staff123',
        role: s.desig === 'receptionist' ? 'receptionist' : s.desig === 'nurse' ? 'nurse' : 'admin',
        phone: '9000099999', isEmailVerified: true,
      });
      await Staff.create({
        user: user._id,
        designation: s.desig,
        department: s.dept,
        ward: s.dept === 'General Ward' ? wards[0]._id : s.dept === 'ICU' ? wards[1]._id : null,
        shift: s.shift,
        shiftTiming: { start: s.shift === 'morning' ? '08:00' : '16:00', end: s.shift === 'morning' ? '16:00' : '00:00' },
        salary: 25000,
        qualifications: ['Relevant Degree'],
        isOnDuty: Math.random() > 0.5,
        joiningDate: new Date('2023-01-01'),
      });
      console.log(`✅ Staff: ${s.name} (${s.desig})`);
    }

    // ── 11. LAB TESTS ──────────────────────────────────
    console.log('\n🧪 Seeding Lab Tests...');
    const labTestData = [
      { name: 'Complete Blood Count', code: 'LAB0001', cat: 'blood', price: 350, time: '4 hours', range: 'WBC: 4000-11000 cells/mcL', unit: 'cells/mcL' },
      { name: 'Blood Sugar Fasting', code: 'LAB0002', cat: 'blood', price: 120, time: '2 hours', range: '70-110 mg/dL', unit: 'mg/dL' },
      { name: 'Blood Sugar PP', code: 'LAB0003', cat: 'blood', price: 120, time: '2 hours', range: '< 140 mg/dL', unit: 'mg/dL' },
      { name: 'Lipid Profile', code: 'LAB0004', cat: 'blood', price: 500, time: '6 hours', range: 'Total < 200 mg/dL', unit: 'mg/dL' },
      { name: 'Liver Function Test', code: 'LAB0005', cat: 'blood', price: 600, time: '6 hours', range: 'ALT: 7-56 U/L', unit: 'U/L' },
      { name: 'Kidney Function Test', code: 'LAB0006', cat: 'blood', price: 550, time: '6 hours', range: 'Creatinine: 0.7-1.3 mg/dL', unit: 'mg/dL' },
      { name: 'Urine Routine', code: 'LAB0007', cat: 'urine', price: 150, time: '2 hours', range: 'Normal', unit: '' },
      { name: 'ECG', code: 'LAB0008', cat: 'cardiac', price: 300, time: '30 minutes', range: 'Normal sinus rhythm', unit: '' },
      { name: 'Chest X-Ray', code: 'LAB0009', cat: 'imaging', price: 400, time: '1 hour', range: 'Normal', unit: '' },
      { name: 'Thyroid Profile (T3T4TSH)', code: 'LAB0010', cat: 'hormonal', price: 700, time: '8 hours', range: 'TSH: 0.4-4.0 mIU/L', unit: 'mIU/L' },
      { name: 'HbA1c', code: 'LAB0011', cat: 'blood', price: 450, time: '4 hours', range: '< 5.7%', unit: '%' },
      { name: 'Dengue NS1 Antigen', code: 'LAB0012', cat: 'blood', price: 800, time: '4 hours', range: 'Non-reactive', unit: '' },
    ];
    for (const t of labTestData) {
      await LabTest.create({
        name: t.name, code: t.code, category: t.cat,
        price: t.price, turnaroundTime: t.time,
        normalRange: t.range, unit: t.unit, isActive: true,
      });
      console.log(`✅ Lab Test: ${t.name} (₹${t.price})`);
    }

    // ── FINAL SUMMARY ──────────────────────────────────
    console.log('\n' + '═'.repeat(50));
    console.log('🎉 SEEDING COMPLETE!\n');
    console.log('👤 Users seeded:');
    console.log('   Admin       → admin@hospital.com    / admin123');
    console.log('   Doctor (4)  → rahul@hospital.com    / doctor123');
    console.log('   Patient (2) → avinash@test.com      / patient123');
    console.log('   Receptionist→ meena@hospital.com    / recep123');
    console.log('   Nurse       → sunita@hospital.com   / nurse123');
    console.log('\n🏥 Hospital data:');
    console.log('   Wards       → 5 wards');
    console.log('   Beds        → 10 beds (mixed status)');
    console.log('   Ambulances  → 4 ambulances');
    console.log('   Medicines   → 10 medicines (some low stock!)');
    console.log('   Staff       → 5 staff members');
    console.log('   Lab Tests   → 12 tests in catalog');
    console.log('═'.repeat(50));

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();