import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
// import routes of the appointment
import appointmentRoutes from './routes/appointmentRoutes.js';
// import routes of the barbers
import barberRoutes from './routes/barberRoutes.js';
//import authentication routes
import authRoutes from './routes/authRoutes.js';

// Load Env variables
dotenv.config();

//connect to DB
connectDB();

//Initialize Express app
const app = express();

//middleware
app.use(cors());
app.use(express.json());

//use authentication route
app.use('/api/auth', authRoutes);

//use appointment routes
app.use('/api/appointments', appointmentRoutes);

//use barber routes
app.use('/api/barbers', barberRoutes);

//test route
app.get('/', (req, res) => {
    res.json({message: 'Welcome to SkipTheQueue'});
});

//Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});