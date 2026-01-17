import express from 'express';
import { createBarber, getAllBarbers, getBarberById, updateBarber, deleteBarber } from '../controllers/barberController.js';
// import validation script
import { requireFields } from '../middleware/validateRequest.js';

const router = express.Router();

// POST /api/barbers - create new barber
// router.post('/', createBarber);

// GET /api/barbers - get all barbers
router.get('/:id', getBarberById); //order of get requests matters
router.get('/', getAllBarbers);
router.put('/:id', updateBarber);
router.delete('/:id', deleteBarber);


// POST requirefields
router.post('/', requireFields(['name','email','phone']), createBarber);

export default router;