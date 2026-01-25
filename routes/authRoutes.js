import express from 'express';
import { registerUser, loginUser, getCurrentUser, logoutUser, refreshAccessToken } from '../controllers/authController.js';
import { protectRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

//Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/refresh', refreshAccessToken); // Refresh access token

//Protected routes
router.get('/me', protectRoute, getCurrentUser);

export default router;