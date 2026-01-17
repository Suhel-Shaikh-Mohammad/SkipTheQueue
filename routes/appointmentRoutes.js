import express from 'express';
import { createAppointment, getAllAppointments, getAppointmentById, updateAppointment, deleteAppointment } from '../controllers/appointmentController.js';
// import validation script
import { requireFields } from '../middleware/validateRequest.js';

const router = express.Router();

//POST /api/appointments - create new appointment
// router.post('/', createAppointment);

// GET /api/appointments - GET all the appointments
router.get('/:id', getAppointmentById); // order of the get requests matters
router.get('/', getAllAppointments);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

// POST requireFields
router.post('/', requireFields(['customerName', 'customerPhone','barber','appointmentDate','timeSlot']), createAppointment);

export default router;