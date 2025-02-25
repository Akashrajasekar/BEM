// Express route setup
import express from "express";
const router = express.Router();
import {
  getUsersByDepartment,
  setUserLimit,
  authenticateUser
} from "../controller/manager.controller.js";
import { getAllExpenses,
  AutoApprovals,
  confirmAutoApprovals,
  getExpenseById
 } from "../controller/expense.controller.js";

// Apply authentication middleware to all routes
router.use(authenticateUser);

//Budget limit
router.get("/by-department", getUsersByDepartment);
router.post("/set-limit", setUserLimit);

//expense approval
router.get("/expenses", getAllExpenses);
router.post("/auto-approve", AutoApprovals);
router.post("/confirm-approvals", confirmAutoApprovals);
router.get("/:id", getExpenseById);

export default router;
