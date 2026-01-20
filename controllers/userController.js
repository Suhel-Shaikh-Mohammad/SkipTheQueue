import User from '../models/user.js';

export const getAllUsers = async (req,res) => {
    try{
        const users = await User.find();
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error){
        res.status(500).json({success: false, message: error.message});
    }
};