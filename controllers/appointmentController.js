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

      //pagination
      const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
      const skip = parseInt(req.query.skip, 10) || 0;
      
      //Build a filter 
      let filter = {};
      if (barber) filter.barber = barber;
      if (date) filter.appointmentDate = { $gte: new Date(date), $lt: new Date(new Date(date).getTime() + 86400000)};
      if (status) filter.status = status;

      // if user is not admin/barber, show only the appointemnts
      if (req.userRole == 'user') filter.user = req.userId;

      const appointments = await Appointment.find(filter)
      .populate('barber', 'name email')
      .populate('user', 'username email')
      .skip(skip)
      .limit(limit);

      const total = await Appointment.countDocuments(filter);
      res.status(200).json({ success: true, count: appointments.length, total, data: appointments });


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

// Update appointment status
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Must be: Pending, Confirmed, Completed, or Cancelled' 
      });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Validate status transition (optional but good practice)
    if (appointment.status === 'Completed' && status !== 'Completed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot change status of completed appointment' 
      });
    }

    appointment.status = status;
    await appointment.save();

    res.status(200).json({ 
      success: true, 
      message: `Appointment status updated to ${status}`, 
      data: appointment 
    });
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

// Search/Filter appointments
export const searchAppointments = async (req, res) => {
  try {
    const { status, barber, startDate, endDate } = req.query;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const skip = parseInt(req.query.skip, 10) || 0;

    let filter = {};

    if (status) {
      const validStatuses = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];
      if (validStatuses.includes(status)) {
        filter.status = status;
      } else {
        return res.status(400).json({ 
          success: false, 
          message: `Invalid status. Valid options: ${validStatuses.join(', ')}` 
        });
      }
    }

    if (barber) {
      filter.barber = barber;
    }

    if (startDate || endDate) {
      filter.appointmentDate = {};
      if (startDate) {
        filter.appointmentDate.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.appointmentDate.$lte = new Date(new Date(endDate).getTime() + 86400000);
      }
    }

    // Regular users can only see their own appointments
    if (req.userRole === 'user') {
      filter.user = req.userId;
    }

    const appointments = await Appointment.find(filter)
      .populate('barber', 'name email specialization')
      .populate('user', 'username email')
      .skip(skip)
      .limit(limit)
      .sort({ appointmentDate: 1 });

    const total = await Appointment.countDocuments(filter);

    res.status(200).json({ 
      success: true, 
      count: appointments.length, 
      total, 
      data: appointments 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel appointment
export const cancelAppointment = async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if appointment can be cancelled (only Pending or Confirmed)
    if (!['Pending', 'Confirmed'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel appointment with status: ${appointment.status}. Only Pending or Confirmed appointments can be cancelled.`
      });
    }

    // Check ownership (users can only cancel their own; admins/barbers can cancel any)
    if (req.userRole === 'user' && appointment.user.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own appointments'
      });
    }

    // Update appointment with cancellation details
    appointment.status = 'Cancelled';
    appointment.cancelledAt = new Date();
    appointment.cancelledBy = req.userId;
    appointment.cancellationReason = cancellationReason || '';

    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointmentId)
      .populate('barber', 'name email')
      .populate('user', 'username email')
      .populate('cancelledBy', 'username email');

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: updatedAppointment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

