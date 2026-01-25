import express from 'express';
import { getAllUsers } from '../controllers/userController.js';
import { deleteUser, deleteAllUsers } from '../controllers/userController.js';
import { protectRoute, authorizeRole } from '../middleware/authMiddleware.js';

const router = express.Router();

//Admin only -view all users
router.get('/', protectRoute, authorizeRole('admin'), getAllUsers);
//Admin only - delete specific user
router.delete('/:id', protectRoute, authorizeRole('admin'), deleteUser);

//Admin only - delete all users (for testing/cleanup)
router.delete('/', protectRoute, authorizeRole('admin'), deleteAllUsers);

export default router;
