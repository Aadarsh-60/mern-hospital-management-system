import BloodBank from '../models/BloodBank.js';

// Get all blood stock
export const getBloodStock = async (req, res) => {
  try {
    const stock = await BloodBank.find().populate('lastUpdatedBy', 'name email');
    
    // Ensure all blood groups are present in the response
    const allGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const formattedStock = allGroups.map(bg => {
      const existing = stock.find(s => s.bloodGroup === bg);
      return existing || { bloodGroup: bg, units: 0, lastUpdatedBy: null, createdAt: new Date() };
    });

    res.json({ success: true, count: formattedStock.length, stock: formattedStock });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update blood stock (add or deduct units)
export const updateBloodStock = async (req, res) => {
  try {
    const { bloodGroup, units, action } = req.body;
    
    if (!['add', 'deduct'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action. Use add or deduct.' });
    }

    if (units <= 0) {
      return res.status(400).json({ success: false, message: 'Units must be greater than 0.' });
    }

    let record = await BloodBank.findOne({ bloodGroup });
    
    if (!record) {
      if (action === 'deduct') {
        return res.status(400).json({ success: false, message: 'Not enough units in stock.' });
      }
      record = new BloodBank({ bloodGroup, units, lastUpdatedBy: req.user._id });
    } else {
      if (action === 'add') {
        record.units += Number(units);
      } else if (action === 'deduct') {
        if (record.units < units) {
          return res.status(400).json({ success: false, message: 'Not enough units in stock.' });
        }
        record.units -= Number(units);
      }
      record.lastUpdatedBy = req.user._id;
    }

    await record.save();
    
    // fetch populated record
    const updatedRecord = await BloodBank.findById(record._id).populate('lastUpdatedBy', 'name email');
    
    res.json({ success: true, message: 'Stock updated successfully', record: updatedRecord });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
