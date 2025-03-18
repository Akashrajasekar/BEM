// Express route setup
import express from "express";
const router = express.Router();
import {
  getUsersByDepartment,
  setUserLimit,
  authenticateUser
} from "../controller/manager.controller.js";
import { AutoApprovals,
  getAllExpenses,
  confirmAutoApprovals,
  getExpenseById,
  getExpenseStats,
  getExpenseChartData,
  approveExpense,
  rejectExpense,
  uploadPolicyFile,
 } from "../controller/expense.controller.js";
import { generateTeamExpenseReport,
  getManagerTeamReports,
  downloadTeamPDFReport,
  getTeamReportPDF,
  deleteTeamReport,
  getTeamReportDetails,
  getTeamMembers
} from '../controller/report_man.controller.js';

// Apply authentication middleware to all routes
router.use(authenticateUser);

//Budget limit
router.get("/by-department", getUsersByDepartment);
router.post("/set-limit", setUserLimit);

//expense approval
router.get("/expenses", getAllExpenses);
router.post("/auto-approve", AutoApprovals);
router.post("/upload-policy", uploadPolicyFile);
router.post("/confirm-approvals", confirmAutoApprovals);
router.get("/chart-data", getExpenseChartData);
router.get("/stats", getExpenseStats);
router.post("/:expenseId/approve", approveExpense);
router.post("/:expenseId/reject", rejectExpense);
router.get("/:id", getExpenseById);
router.get("/auto-approvals", AutoApprovals);
router.get("/confirm-auto-approvals", confirmAutoApprovals);

//New routes for team expense reports
router.get('/team-reports', getManagerTeamReports);
router.get('/team-reports/generate', generateTeamExpenseReport);
router.get('/team-reports/:reportId/pdf', getTeamReportPDF);
router.get('/reports/download/:fileName', downloadTeamPDFReport);
router.delete('/team-reports/:reportId', deleteTeamReport);
router.get('/team-reports/:reportId', getTeamReportDetails);
router.get('/team-members',  getTeamMembers);

export default router;
