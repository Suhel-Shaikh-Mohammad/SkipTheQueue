import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export const protectRoute = async (req, res, next) => {
    try{
        const token = req.headers.authorization?.split(' ')[1];

        if(!token){
            return res.status(401).json({ message: 'No Token Provided'});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        req.userId = decoded.id;
        
        // Load user to get role
        const user = await User.findById(decoded.id);
        if (!user){
            return res.status(401).json({ message: 'User not found'});
        }
        req.userRole = user.role;
        next();
        
    } catch(error){
        return res.status(403).json({ message: 'Invalid token or Expired Token'});
    }
};

export const authorizeRole = (...allowedRoles) => (req, res, next) =>{
    if (!allowedRoles.includes(req.userRole)){
        return res.status(403).json({ message: 'Access denied'});
    }
    next();
};