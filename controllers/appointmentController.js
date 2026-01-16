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
        const appointments = await Appointment.find().populate('barber', 'name email');

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error){
        res.status(500).json({ success:false, message: error.message});
    }
};