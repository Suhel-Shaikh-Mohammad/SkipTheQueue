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
        const barbers = await Barber.find({ isActive: true});

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