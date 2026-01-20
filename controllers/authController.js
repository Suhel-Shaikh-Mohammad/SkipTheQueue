import User from '../models/user.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });

export const registerUser = async (req, res) => {
    try{
        const {username, email, password, role} = req.body;

        //Check if user already exists
        const existingUser = await User.findOne({ $or: [{email}, {username}] });
        if (existingUser){
            return res.status(400).json({ success: false,  message: 'User already exists'});
        }

        //Create new user
        const user = new User({ username, email, password, role});
        await user.save();

        //Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            message: 'User registerd successfully',
            token,
            user: user.toJSON(),
        });
    } catch (error){
        res.status(500).json({ success: false,  message: error.message});
    }
};

export const loginUser = async (req, res) => {
    try{
        const {email, password} = req.body;

        // Validate inputs
        if (!email || !password){
            return res.status(400).json({success: false, message: 'Email and password are required'});
        }

        // Find user and include password field
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))){
            return res.status(401).json({ message: 'Invalid email or password '});
        }

        // Generate token
        const token = generateToken(user._id);
        res.json({
            message: 'Login Successful',
            token,
            user: user.toJSON(),
        });
    } catch (error){
        res.status(500).json({success: false,  message: error.message });
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({success: false, message: error.message });
    }
};

export const logoutUser = (req, res) => {
    // Since we're using JWT, logout can be handled on the client side
    res.json({ success: true,  message: 'Logout successful'});
};