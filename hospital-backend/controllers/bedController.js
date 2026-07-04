import Bed from '../models/Bed.js';
import Ward from '../models/Ward.js';

// controller for creating ward

export const createWard = async (req, res) => {
  try {
    const ward = await Ward.create(req.body);
    
    // Auto-create beds if totalBeds is provided
    if (req.body.totalBeds && req.body.totalBeds > 0) {
      const bedsToCreate = [];
      for (let i = 1; i <= req.body.totalBeds; i++) {
        bedsToCreate.push({
          bedNumber: `${ward.name}-${i}`,
          ward: ward._id,
          type: ward.type,
          pricePerDay: req.body.type === 'icu' ? 2000 : 500, // basic default pricing based on type
          floor: ward.floor || 1
        });
      }
      await Bed.insertMany(bedsToCreate);
    }

    res.status(201).json({ success: true, ward }); 
  }
  catch (error) { 
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Ward with this name already exists. Please choose a different name.' });
    }
    res.status(500).json({ success: false, message: error.message }); 
  }
};

// controller for getting all wards
export const getAllWards = async (req, res) => {
  try {
    const wards = await Ward.find({ isActive: true }).populate('wardIncharge', 'name phone');
    const wardsWithStats = await Promise.all(wards.map(async (ward) => {
      const [total, available, occupied, reserved, maintenance] = await Promise.all([
        Bed.countDocuments({ ward: ward._id }), Bed.countDocuments({ ward: ward._id, status: 'available' }),
        Bed.countDocuments({ ward: ward._id, status: 'occupied' }), Bed.countDocuments({ ward: ward._id, status: 'reserved' }),
        Bed.countDocuments({ ward: ward._id, status: 'maintenance' }),
      ]);

      return { ...ward.toObject(), bedStats: { total, available, occupied, reserved, maintenance } };
    }));
    res.json({ success: true, count: wardsWithStats.length, wards: wardsWithStats });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// controller for adding bed

export const addBed = async (req, res) => {
  try {
    const ward = await Ward.findById(req.body.ward);
    if (!ward) return res.status(404).json({ success: false, message: 'Ward not found' });
    const bed = await Bed.create(req.body);
    const populated = await bed.populate('ward', 'name type');
    res.status(201).json({ success: true, bed: populated });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// controller for getting all beds
export const getAllBeds = async (req, res) => {
  try {
    const { status, ward, type } = req.query;
    let query = {};
    if (status) query.status = status; if (ward) query.ward = ward; if (type) query.type = type;
    const beds = await Bed.find(query).populate('ward', 'name type floor').populate('currentPatient', 'name phone').populate('assignedDoctor', 'name').sort({ bedNumber: 1 });
    res.json({ success: true, count: beds.length, beds });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// controller for getting bed summary
export const getBedSummary = async (req, res) => {
  try {
    const [total, available, occupied, reserved, maintenance] = await Promise.all([
      Bed.countDocuments(), Bed.countDocuments({ status: 'available' }), Bed.countDocuments({ status: 'occupied' }),
      Bed.countDocuments({ status: 'reserved' }), Bed.countDocuments({ status: 'maintenance' }),
    ]);
    const typeBreakdown = await Bed.aggregate([{ $group: { _id: { type: '$type', status: '$status' }, count: { $sum: 1 } } }, { $sort: { '_id.type': 1 } }]);
    res.json({ success: true, summary: { total, available, occupied, reserved, maintenance, occupancyRate: total ? ((occupied / total) * 100).toFixed(1) + '%' : '0%' }, typeBreakdown });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// controllers for getting admitpatient

export const admitPatient = async (req, res) => {
  try {
    const { patientId, doctorId, expectedDischarge } = req.body;
    const bed = await Bed.findById(req.params.id);
    if (!bed) return res.status(404).json({ success: false, message: 'Bed not found' });

    if (bed.status !== 'available') return res.status(400).json({ success: false, message: `Bed is ${bed.status}` });

    bed.status = 'occupied'; bed.currentPatient = patientId; bed.assignedDoctor = doctorId;
    bed.admittedAt = new Date(); bed.expectedDischarge = expectedDischarge || null;
    await bed.save();
    const updated = await Bed.findById(bed._id).populate('ward', 'name').populate('currentPatient', 'name phone').populate('assignedDoctor', 'name');

    res.json({ success: true, message: 'Patient admitted', bed: updated });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// controller for dischargepatient
export const dischargePatient = async (req, res) => {
  try {
    const bed = await Bed.findById(req.params.id);
    if (!bed) return res.status(404).json({ success: false, message: 'Bed not found' });

    if (bed.status !== 'occupied') return res.status(400).json({ success: false, message: 'Bed is not occupied' });
    bed.status = 'available'; bed.currentPatient = null; bed.assignedDoctor = null;
    bed.admittedAt = null; bed.expectedDischarge = null; bed.notes = req.body.notes || '';
    await bed.save();

    res.json({ success: true, message: 'Patient discharged, bed available', bed });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// controller for updating bed status
export const updateBedStatus = async (req, res) => {
  try {
    const bed = await Bed.findByIdAndUpdate(req.params.id, { status: req.body.status, notes: req.body.notes }, { new: true }).populate('ward', 'name');
    if (!bed) return res.status(404).json({ success: false, message: 'Bed not found' });
    res.json({ success: true, bed });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
