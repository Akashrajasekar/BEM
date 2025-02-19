import express from 'express';
import { adminSignup, adminLogin, adminDashboard } from '../controller/auth.js';
import authMiddleware from '../controller/auth.js';

const router = express.Router();

// Admin Signup Route
router.post('/signup', adminSignup);

// Admin Login Route
router.post('/login', adminLogin);

// Admin Dashboard Route (protected)
router.get('/dashboard', authMiddleware, adminDashboard);

export default router;
