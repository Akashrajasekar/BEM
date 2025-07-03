import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from "dotenv";
import adminRoutes from './routes/adminRoutes.js';
import managerRoutes from './routes/manager.routes.js';
import auth from './routes/auth.routes.js'
import { connectDB } from './config/db.js';

// NEW: Import invoice-related routes
import invoiceRoutes from "./routes/invoice.routes.js";
import apiKeyRoutes from "./routes/apiKey.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

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

// Trust proxy for accurate IP addresses (needed for API key management)
app.set("trust proxy", true);

// Increase body size limits for file uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Use invoice Routes
// NEW: Invoice API routes
app.use("/api/v1/invoice", invoiceRoutes); // Invoice processing endpoints
app.use("/api/v1/management", apiKeyRoutes); // API key management endpoints
app.use("/api/v1", analyticsRoutes); // Analytics endpoints

// Use Admin Routes
app.use('/api/admin', adminRoutes);

// Use Auth Routes
app.use('/api/auth', auth);

// Use Manager Routes
app.use('/api/manager', managerRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});
