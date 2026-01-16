import express from 'express';
import { createAppointment, getAllAppointments } from '../controllers/appointmentController.js';

const router = express.Router();

//POST /api/appointments - create new appointment
router.post('/', createAppointment);

// GET /api/appointments - GET all the appointments
router.get('/', getAllAppointments);

export default router;