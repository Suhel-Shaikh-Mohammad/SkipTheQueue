// Middleware/vaidateRequest.js
export const requireFields = (fields) => (req, res, next) =>{
    const missing = fields.filter((f) => !req.body?.[f]);
    if (missing.length){
        return res.status(400).json({message: `missing fields: ${missing.join(', ')}`});
    }
    next();
};