import express from 'express';
import { createBarber, getAllBarbers, getBarberById, updateBarber, deleteBarber, startAppointment, finishAppointment, getPendingQueue, toggleShopStatus, getNextAvailable} from '../controllers/barberController.js';
// import validation script
import { requireFields } from '../middleware/validateRequest.js';
// import authentication middleware
import { protectRoute, authorizeRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/barbers - create new barber
// router.post('/', createBarber);

// GET /api/barbers - get all barbers
router.get('/:id', getBarberById); //order of get requests matters
router.get('/', getAllBarbers);

// Protected routes - require authentication
router.post('/', protectRoute,authorizeRole('admin'), requireFields(['name','email','phone']), createBarber);
router.put('/:id', protectRoute,authorizeRole('admin'), updateBarber);
router.delete('/:id', protectRoute,authorizeRole('admin'), deleteBarber);
router.get('/:id/next-available', getNextAvailable); // public - customers can check

//for barber and admin only
// Queue management (barber/admin only)
router.post('/:id/start-appointment', protectRoute, authorizeRole('admin', 'barber'), startAppointment);
router.patch('/:id/finish-appointment', protectRoute, authorizeRole('admin', 'barber'), finishAppointment);
router.get('/:id/pending-queue', protectRoute, authorizeRole('admin', 'barber'), getPendingQueue);
router.patch('/:id/toggle-status', protectRoute, authorizeRole('admin', 'barber'), toggleShopStatus);

export default router;