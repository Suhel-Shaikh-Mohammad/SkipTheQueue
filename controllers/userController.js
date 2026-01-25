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

export const deleteUser = async (req,res) => {
    try{
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({success: false, message: 'User not found'});
        }
        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
            data: user
        });
    } catch (error){
        res.status(500).json({success: false, message: error.message});
    }
};

export const deleteAllUsers = async (req,res) => {
    try{
        const result = await User.deleteMany({});
        res.status(200).json({
            success: true,
            message: `Deleted ${result.deletedCount} users`,
            deletedCount: result.deletedCount
        });
    } catch (error){
        res.status(500).json({success: false, message: error.message});
    }
};