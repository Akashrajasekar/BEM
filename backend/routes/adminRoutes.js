import express from 'express';
import { adminSignup, adminLogin, adminDashboard } from '../controller/auth.js';
import User from "../models/user.model.js";
import authMiddleware from '../controller/auth.js';
import {
    departments,
    newUser,
    getDepartmentUsers,
    deleteUser,
    updateUser,
  } from "../controller/user.controller.js";
import {
    getDepartmentsList,
    getDepartmentManagers,
    updateDepartmentBudget,
  } from "../controller/budget.controller.js";

const router = express.Router();

// Admin Signup Route
router.post('/signup', adminSignup);

// Admin Login Route
router.post('/login', adminLogin);

// Admin Dashboard Route (protected)
router.get('/dashboard', authMiddleware, adminDashboard);

//User Management
router.post("/newUser", authMiddleware,newUser);

router.get("/departments", authMiddleware,departments);

router.get("/department-users", authMiddleware,getDepartmentUsers);

router.delete("/deleteUser/:userId", authMiddleware,deleteUser);

router.put("/updateUser/:userId", authMiddleware,updateUser);

//Budget Management
router.get("/list", getDepartmentsList);
router.get("/:departmentId/managers", getDepartmentManagers);
router.post("/update-budget", updateDepartmentBudget);

export default router;
