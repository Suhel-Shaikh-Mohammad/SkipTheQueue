import jwt from 'jsonwebtoken';

export const protectRoute = (req, res, next) => {
    try{
        const token = req.headers.authorization?.split(' ')[1];

        if(!token){
            return res.status(401).json({ message: 'No Token Provided'});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        req.userId = decoded.id;
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