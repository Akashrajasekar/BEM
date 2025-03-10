import jwt from 'jsonwebtoken';
import Admin from '../models/admin.model.js';

// Secret key (you should store this in an environment variable for security)
const SECRET_KEY = 'secret_key';

// Admin Signup Functionality
export const adminSignup = async (req, res) => {
  try {
    const { fullName, email, password, department } = req.body;

    // Check if the email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    // Create new admin
    const newAdmin = new Admin({
      fullName,
      email,
      password,
      department,
    });

    await newAdmin.save();

    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Admin Login Functionality
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: admin._id, role: admin.access }, SECRET_KEY, {
      expiresIn: '1d',
    });

    // Include fullName in the response
    res.status(200).json({
      message: 'Login successful',
      token: token,
      fullName: admin.fullName,
      adminId: admin._id,
      access: admin.access,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Admin Dashboard Functionality
export const adminDashboard = async (req, res) => {
  try {
    res.status(200).json({ message: "Welcome to Admin Dashboard!" });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Authentication Middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1]; // Extract token after "Bearer "
  if (!token) return res.status(403).json({ message: "Access denied" });

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    req.admin = verified;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware;
