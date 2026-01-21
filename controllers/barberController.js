import Barber from '../models/barber.js';

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
}