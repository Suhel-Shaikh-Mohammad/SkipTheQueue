import Barber from '../models/barber.js';
import Appointment from '../models/appointment.js';

// Start serving an appointment;
export const startAppointment = async (req, res) => {
    try{
        const { appointmentId, estimatedDuration } = req.body;
        const barberId = req.params.id;

        // Validate inputs
        if (!appointmentId || !estimatedDuration){
            return res.status(400).json({
                success: false,
                message: 'AppointmentId and estimated Duration (minutes) required'
            });
        }

        // Find barber
        const barber = await Barber.findById(barberId);
        if (!barber) return res.status(404).json({
            success: false,
            message: 'Barber Not found'
        });

        // Find appointment and update status
        const appointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            {status: 'In Progress'},
            {new: true}
        ).populate('barber');

        if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

        // Update barber's current appointment
        const now = new Date();
        const estimatedEndTime = new Date(now.getTime() + estimatedDuration * 60000);

        barber.currentAppointment = {
        appointmentId,
        startedAt: now,
        estimatedEndTime
        };
        await barber.save();

        res.json({
            success: true,
            message: 'Appointment started',
            data: { appointment, nextAvailableAt: estimatedEndTime}
        });
    } catch(error){
        res.status(500).json({ success: false, message: error.message});
    }
};

// Finish current appointment
export const finishAppointment = async (req, res) => {
  try {
    const barberId = req.params.id;

    const barber = await Barber.findById(barberId);
    if (!barber) return res.status(404).json({ success: false, message: 'Barber not found' });

    if (!barber.currentAppointment?.appointmentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'No appointment currently in progress' 
      });
    }

    // Mark appointment as Completed
    await Appointment.findByIdAndUpdate(
      barber.currentAppointment.appointmentId,
      { status: 'Completed' },
      { new: true }
    );

    // Calculate next available time
    const finishTime = new Date();
    const nextAvailableAt = new Date(finishTime.getTime() + barber.bufferTime * 60000);

    // Clear current appointment
    barber.currentAppointment = null;
    await barber.save();

    res.json({
      success: true,
      message: 'Appointment completed',
      data: { nextAvailableAt }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get next available time slot for barber
export const getNextAvailable = async (req, res) => {
  try {
    const barberId = req.params.id;

    const barber = await Barber.findById(barberId);
    if (!barber) return res.status(404).json({ success: false, message: 'Barber not found' });

    if (!barber.isOpen) {
      return res.json({ 
        success: true, 
        isOpen: false, 
        message: 'Barber shop is closed' 
      });
    }

    if (!barber.currentAppointment?.estimatedEndTime) {
      return res.json({
        success: true,
        isOpen: true,
        nextAvailableAt: new Date(),
        message: 'Barber is free now'
      });
    }

    const nextAvailable = new Date(
      new Date(barber.currentAppointment.estimatedEndTime).getTime() + 
      barber.bufferTime * 60000
    );

    res.json({
      success: true,
      isOpen: true,
      nextAvailableAt: nextAvailable,
      currentAppointmentEndsAt: barber.currentAppointment.estimatedEndTime
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get pending appointments for barber (sorted by date)
export const getPendingQueue = async (req, res) => {
  try {
    const barberId = req.params.id;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const skip = parseInt(req.query.skip, 10) || 0;

    const barber = await Barber.findById(barberId);
    if (!barber) return res.status(404).json({ success: false, message: 'Barber not found' });

    const pendingAppointments = await Appointment.find({
      barber: barberId,
      status: 'Pending'
    })
      .sort({ appointmentDate: 1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username email');

    const total = await Appointment.countDocuments({ barber: barberId, status: 'Pending' });

    res.json({
      success: true,
      count: pendingAppointments.length,
      total,
      data: pendingAppointments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle shop open/close
export const toggleShopStatus = async (req, res) => {
  try {
    const barberId = req.params.id;
    const { isOpen } = req.body;

    if (typeof isOpen !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isOpen must be true or false' });
    }

    const barber = await Barber.findByIdAndUpdate(
      barberId,
      { isOpen },
      { new: true }
    );

    if (!barber) return res.status(404).json({ success: false, message: 'Barber not found' });

    res.json({
      success: true,
      message: `Shop is now ${isOpen ? 'open' : 'closed'}`,
      data: barber
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a barber
export const createBarber = async (req, res) => {
    try{
        const { name, email, phone, specialization, experience } = req.body;

        // check if email already exists
        const barberExists = await Barber.findOne({ email });
        if (barberExists){
            return res.status(400).json({ message: 'Email Already exists, Hence Registered'});
        }

        //create barber
        const barber = await Barber.create({
            name,
            email,
            phone,
            specialization,
            experience
        });

        res.status(201).json({
            success: true,
            message: 'Barber successfully created',
            data: barber
        });
    } catch (error){
        res.status(500).json({success: false, message: error.message});
    }
};

// Get all barbers
export const getAllBarbers = async (req, res) => {
    try{
    
        //pagination
        const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
        const skip = parseInt(req.query.skip, 10) || 0;

        const barbers = await Barber.find({ isActive: true})
        .skip(skip)
        .limit(limit);

        const total = await Barber.countDocuments({ isActive: true });
        res.status(200).json({ success: true, count: barbers.length, total, data: barbers });

        res.status(200).json({
            success: true,
            count: barbers.length,
            data: barbers
        });
    } catch (error){
        res.status(500).json(
            { success: false, message: error.message}
        );
    }
};

// Get Single barber
export const getBarberById = async (req,res) => {
    try{
        const barber = await Barber.findById(req.params.id);
        if (!barber) return res.status(404).json({ message: 'Barber Not found'});
        res.status(200).json({ success: true, data: barber});
    } catch (error){
        res.status(500).json({ success: false, message: error.message});
    }
};

//update barber
export const updateBarber = async (req,res) => {
    try{
        const barber = await Barber.findByIdAndUpdate(req.params.id, req.body, {new: true});
        if (!barber) return res.status(404).json({ message: 'Barber not found'});
        res.status(200).json({ success: true, message: 'Barber updated successfully', data: barber});
    } catch (error){
        res.status(500).json({ success: false, message: error.message});
    }
};

//Delete Barber
export const deleteBarber = async (req,res) => {
    try{
        const barber = await Barber.findByIdAndDelete(req.params.id);
        if (!barber) return res.status(404).json({ message: 'Barber not found'});
        res.status(200).json({ success: true, message: 'Barber Deleted', data: barber});
    } catch (error){
        res.status(500).json({ success: false, message: error.message});
    }
};