import Appointment from '../models/appointment.js';
import Barber from '../models/barber.js';
import User from '../models/user.js';

// Create new Appointment
export const createAppointment = async (req, res) => {
    try{
        const {customerName, customerPhone, barber, appointmentDate, timeSlot, service, notes} = req.body;

        // Check if barber exists
        const barberExists = await Barber.findById(barber);
        if (!barberExists) {
            return res.status(404).json({success:false, message: 'Barber not found'});
        }
        
        // Prevent double Booking of same barber
        const existing = await Appointment.findOne({ barber, appointmentDate, timeSlot, user: req.userId});
        if (existing){
            return res.status(409).json({ success: false, message: 'This Time slot is already booked'});
        }
        
        // Create appointment
        const appointment = await Appointment.create({
            customerName,
            customerPhone,
            barber,
            appointmentDate,
            timeSlot,
            service,
            notes,
            user: req.userId
        });

        res.status(201).json({
            success: true,
            message: 'Appointment is assigned successfully',
            data: appointment
        });
    } catch (error) {
        res.status(500).json({success:false, message: error.message});
    }
};

// Get all appointments
export const getAllAppointments = async (req, res) => {
    try{
      const {barber, date, status} = req.query;
      
      //Build a filter 
      let filter = {};
      if (barber) filter.barber = barber;
      if (date) filter.appointmentDate = { $gte: new Date(date), $lt: new Date(new Date(date).getTime() + 86400000)};
      if (status) filter.status = status;

      // if user is not admin/barber, show only the appointemnts
      if (req.userRole == 'user') filter.user = req.userId;

      const appointments = await Appointment.find(filter).populate('barber', 'name email')
  .populate('user', 'username email');

      res.status(200).json({
          success: true,
          count: appointments.length,
          data: appointments
      });
    } catch (error){
        res.status(500).json({ success:false, message: error.message});
    }
};

// Get single appointment
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate('barber', 'name email');
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update appointment
export const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({success: false, message: 'Appointment not found' });
    
    // Check ownership (allow if user is owner or admin/barber)
    if (req.userRole === 'user' && appointment.user.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'You can only update your own appointments' });
    }
    
    const updated = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, message: 'Appointment updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete appointment
export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    
    // Check ownership (allow if user is owner or admin/barber)
    if (req.userRole === 'user' && appointment.user.toString() !== req.userId) {
      return res.status(403).json({ success: false,  message: 'You can only delete your own appointments' });
    }
    
    await Appointment.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Appointment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

