import express from 'express';
import { createReview, getBarberReviews, getUserReviews, updateReview, deleteReview } from '../controllers/reviewController.js';
import { protectRoute, authorizeRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route - Get all reviews for a barber
router.get('/barber/:barberId', getBarberReviews);

// Protected routes - require authentication
router.post('/', protectRoute, createReview);
router.get('/user/:userId', protectRoute, getUserReviews);
router.put('/:id', protectRoute, updateReview);
router.delete('/:id', protectRoute, deleteReview); // Users delete own, admins delete any

export default router;
