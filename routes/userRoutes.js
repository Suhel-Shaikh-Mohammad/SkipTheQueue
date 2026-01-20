import express from 'express';
import { getAllUsers } from '../controllers/userController.js';
import { protectRoute, authorizeRole } from '../middleware/authMiddleware.js';

const router = express.Router();

//Admin only -view all users
router.get('/', protectRoute, authorizeRole('admin'), getAllUsers);

export default router;
