import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from "dotenv";
import adminRoutes from './routes/adminRoutes.js';
import auth from './routes/auth.routes.js'
import { connectDB } from './config/db.js';

dotenv.config();

const app = express();

// Connect to Database before starting server
connectDB();

// Middleware
app.use(express.json());  // Enables JSON body parsing
app.use(cors());  // Enables cross-origin requests

// Test Route
app.get("/organizations", (req, res) => {
    res.send("Server is ready");
});

// Use Admin Routes
app.use('/api/admin', adminRoutes);

// Use Auth Routes
app.use('/api/auth', auth);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});
