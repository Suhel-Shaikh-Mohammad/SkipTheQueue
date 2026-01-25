import User from '../models/user.js';
import jwt from 'jsonwebtoken';

const generateAccessToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });

const generateRefreshToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });

export const registerUser = async (req, res) => {
    try{
        const {username, email, password, role} = req.body;

        // Input validation
        if (!username || username.length < 3 || username.length > 30) {
        return res.status(400).json({ success: false, message: 'Username must be 3-30 characters' });
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return res.status(400).json({ success: false, message: 'Username can only contain letters, numbers, and underscores' });
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email format' });
        }
        if (!password || password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }
        if (role && !['user', 'barber', 'admin'].includes(role)) {
        return res.status(400).json({ success: false, message: 'Role must be user, barber, or admin' });
        }

        //Check if user already exists
        const existingUser = await User.findOne({ $or: [{email}, {username}] });
        if (existingUser){
            return res.status(400).json({ success: false,  message: 'User already exists'});
        }

        //Create new user
        const user = new User({ username, email, password, role});
        await user.save();

        //Generate tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Save refresh token to database
        user.refreshToken = refreshToken;
        await user.save();

        res.status(201).json({
            success: true,
            message: 'User registerd successfully',
            accessToken,
            refreshToken,
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
            return res.status(401).json({ success: false, message: 'Invalid email or password '});
        }

        // Generate tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Save refresh token to database
        user.refreshToken = refreshToken;
        await user.save();

        res.json({
            success: true,
            message: 'Login Successful',
            accessToken,
            refreshToken,
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

// Refresh access token
export const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required'
            });
        }

        // Verify refresh token
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired refresh token'
            });
        }

        // Find user and verify refresh token matches
        const user = await User.findById(decoded.id);
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token does not match or user not found'
            });
        }

        // Generate new access token
        const accessToken = generateAccessToken(user._id);

        res.json({
            success: true,
            message: 'Access token refreshed successfully',
            accessToken
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};