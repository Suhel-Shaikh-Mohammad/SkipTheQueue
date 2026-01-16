import express from 'express';
import { createBarber, getAllBarbers } from '../controllers/barberController.js';

const router = express.Router();

// POST /api/barbers - create new barber
router.post('/', createBarber);

// GET /api/barbers - get all barbers
router.get('/', getAllBarbers);

export default router;