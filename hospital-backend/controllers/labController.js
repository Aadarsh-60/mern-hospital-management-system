import { LabTest, LabReport } from '../models/LabTest.js';
import User from '../models/User.js';

// controller for adding lab test
export const addLabTest = async (req, res) => {
  try {
    if (!req.body.code) { const count = await LabTest.countDocuments(); req.body.code = `LAB${String(count + 1).padStart(4, '0')}`; }
    const test = await LabTest.create(req.body);
    res.status(201).json({ success: true, test });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// controller for getting all lab test
export const getAllLabTests = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { isActive: true };
    if (category) query.category = category; if (search) query.name = new RegExp(search, 'i');
    const tests = await LabTest.find(query).sort({ category: 1, name: 1 });
    res.json({ success: true, count: tests.length, tests });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// controller for ordering lab test
export const orderLabTests = async (req, res) => {
  try {
    const { patientId, appointmentId, testIds, notes } = req.body;
    const patient = await User.findById(patientId);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    let totalAmount = 0;
    const tests = [];
    for (const testId of testIds) {
      const test = await LabTest.findById(testId);
      if (!test) return res.status(404).json({ success: false, message: `Test ${testId} not found` });
      totalAmount += test.price; tests.push({ test: testId });
    }
    const report = await LabReport.create({ patient: patientId, doctor: req.user._id, appointment: appointmentId, tests, totalAmount, notes });
    const populated = await LabReport.findById(report._id).populate('patient', 'name email').populate('doctor', 'name').populate('tests.test', 'name code category price turnaroundTime');
    res.status(201).json({ success: true, message: 'Lab tests ordered', report: populated });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// controller for updating lab results
export const updateLabResults = async (req, res) => {
  try {
    const { tests, remarks } = req.body;
    const report = await LabReport.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    tests.forEach((item) => { const existing = report.tests.find((t) => t.test.toString() === item.testId); if (existing) { existing.result = item.result; existing.unit = item.unit; existing.normalRange = item.normalRange; existing.isAbnormal = item.isAbnormal || false; existing.notes = item.notes; } });
    report.status = 'completed'; report.completedAt = new Date(); report.technician = req.user._id; report.remarks = remarks;
    await report.save();
    const updated = await LabReport.findById(report._id).populate('patient', 'name email').populate('doctor', 'name').populate('tests.test', 'name code category normalRange unit').populate('technician', 'name');
    res.json({ success: true, message: 'Lab results updated', report: updated });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// controller for getting lab report by id
export const getLabReportById = async (req, res) => {
  try {
    const report = await LabReport.findById(req.params.id).populate('patient', 'name email phone').populate('doctor', 'name').populate('tests.test', 'name code category normalRange unit').populate('technician', 'name');
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    const userId = req.user._id.toString();
    if (report.patient._id.toString() !== userId && report.doctor._id.toString() !== userId && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Not authorized' });
    res.json({ success: true, report });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// controller for getting lab reports

export const getLabReports = async (req, res) => {
  try {
    const { status, patientId, page = 1, limit = 10 } = req.query;
    let query = {};
    if (req.user.role === 'patient') query.patient = req.user._id;
    else if (patientId) query.patient = patientId;
    if (status) query.status = status;
    const reports = await LabReport.find(query).populate('patient', 'name email').populate('doctor', 'name').populate('tests.test', 'name code').limit(limit * 1).skip((page - 1) * limit).sort({ createdAt: -1 });
    const total = await LabReport.countDocuments(query);
    res.json({ success: true, count: reports.length, total, reports });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// controller for updating report status
export const updateReportStatus = async (req, res) => {
  try {
    const report = await LabReport.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, report });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
