import express from 'express';
import { createAppointment, getAllAppointments, getAppointmentById, updateAppointment, deleteAppointment, updateAppointmentStatus } from '../controllers/appointmentController.js';
// import validation script
import { requireFields } from '../middleware/validateRequest.js';
// import authentication middleware
import { protectRoute , authorizeRole} from '../middleware/authMiddleware.js';

const router = express.Router();

//POST /api/appointments - create new appointment
// router.post('/', createAppointment);

// GET /api/appointments - GET all the appointments
// router.get('/:id', getAppointmentById); // order of the get requests matters


// Protected routes - require authentication
router.post('/', protectRoute, requireFields(['customerName', 'customerPhone','barber','appointmentDate','timeSlot']), createAppointment);
router.put('/:id', protectRoute, updateAppointment);
router.delete('/:id', protectRoute, deleteAppointment);
router.get('/',protectRoute, getAllAppointments);
router.patch('/:id/status', protectRoute, authorizeRole('admin', 'barber'), updateAppointmentStatus);

export default router;