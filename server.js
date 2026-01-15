import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

// Load Env variables
dotenv.config();

//connect to DB
connectDB();

//Initialize Express app
const app = express();

//middleware
app.use(cors());
app.use(express.json());

//test route
app.get('/', (req, res) => {
    res.json({message: 'Welcome to SkipTheQueue'});
});

//Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});