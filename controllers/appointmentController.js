import Appointment from '../models/appointment.js';
import Barber from '../models/barber.js';

// Create new Appointment
export const createAppointment = async (req, res) => {
    try{
        const {customerName, customerPhone, barber, appointmentDate, timeSlot, service, notes} = req.body;

        // Check if barber exists
        const barberExists = await Barber.findById(barber);
        if (!barberExists) {
            return res.status(404).json({ message: 'Barber not found'});
        }
        
        // Prevent double Booking of same barber
        const existing = await Appointment.findOne({ barber, appointmentDate, timeSlot});
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
            notes
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

      const appointments = await Appointment.find(filter).populate('barber', 'name email');

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
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.status(200).json({ success: true, message: 'Appointment updated', data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete appointment
export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.status(200).json({ success: true, message: 'Appointment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

