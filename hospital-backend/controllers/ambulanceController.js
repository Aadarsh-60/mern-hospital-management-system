import { Ambulance, AmbulanceBooking } from '../models/Ambulance.js';

// controller for adding ambulance
export const addAmbulance = async (req, res) => {
  try { const ambulance = await Ambulance.create(req.body); res.status(201).json({ success: true, ambulance }); }
  catch (error) { res.status(500).json({ success: false, message: error.message }); }
};



// controller for getting all ambulances  
export const getAllAmbulances = async (req, res) => {
  try {
    const { status } = req.query;
    let query = { isActive: true };
    if (status) query.status = status;
    const ambulances = await Ambulance.find(query).sort({ vehicleNumber: 1 });
    const available = await Ambulance.countDocuments({ status: 'available', isActive: true });
    res.json({ success: true, totalAvailable: available, count: ambulances.length, ambulances });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// controller for updating ambulance
export const updateAmbulance = async (req, res) => {
  try {
    const ambulance = await Ambulance.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!ambulance) return res.status(404).json({ success: false, message: 'Ambulance not found' });
    res.json({ success: true, ambulance });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// controller for booking ambulance
export const bookAmbulance = async (req, res) => {
  try {
    const { patientName, patientPhone, pickupAddress, pickupCoordinates, emergency, notes } = req.body;
    const ambulance = await Ambulance.findOne({ status: 'available', isActive: true });
    if (!ambulance) return res.status(400).json({ success: false, message: 'No ambulances available. Please call 108.' });
    const booking = await AmbulanceBooking.create({ ambulance: ambulance._id, bookedBy: req.user._id, patientName, patientPhone, pickupAddress, pickupCoordinates, emergency: emergency || false, status: 'assigned', assignedAt: new Date(), estimatedArrival: emergency ? '10-15 mins' : '20-30 mins', notes });
    await Ambulance.findByIdAndUpdate(ambulance._id, { status: 'on-duty' });
    const populated = await AmbulanceBooking.findById(booking._id).populate('ambulance');
    res.status(201).json({ success: true, message: emergency ? '🚨 Emergency ambulance dispatched!' : 'Ambulance booked', booking: populated });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// controller for updating booking status
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await AmbulanceBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    booking.status = status;
    if (status === 'completed') { booking.completedAt = new Date(); await Ambulance.findByIdAndUpdate(booking.ambulance, { status: 'available' }); }
    await booking.save();
    res.json({ success: true, booking });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};


// controller for getting all bookings
export const getAllBookings = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status;
    const bookings = await AmbulanceBooking.find(query).populate('ambulance', 'vehicleNumber type driver').populate('bookedBy', 'name phone').sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};


// controller for getting my bookings
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await AmbulanceBooking.find({ bookedBy: req.user._id }).populate('ambulance', 'vehicleNumber type driver').sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
