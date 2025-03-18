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
    getDepartmentBudget,
    getBudgetSummary,
    getMonthlyExpenseData,
    getDepartmentBudgetDistribution,
    getYearlyExpenseData,
    getDepartmentBudgets,
  } from "../controller/budget.controller.js";
import {
    getAuditLogs,
    getExpenseDetails,
  } from "../controller/audit.controller.js";
import { getDashboardStats } from "../controller/dashboard.controller.js";
  
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
router.get("/budget", getDepartmentBudget);
router.get("/summary", getBudgetSummary);
router.get("/monthly-expenses", getMonthlyExpenseData);
router.get("/department-distribution", getDepartmentBudgetDistribution);
router.get("/yearly-expenses", getYearlyExpenseData);
router.get("/department-budgets", getDepartmentBudgets);

// Audit Log Routes
router.get("/", getAuditLogs);
router.get("/dashboard-stats", getDashboardStats);
router.get("/:id", getExpenseDetails);


export default router;
