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
//  import { generateManagerTeamReport,
//   getUserReports,
//     downloadPDFReport,
//     deleteUserReport,
//     getReportPDF,
//     getReportDetails
// } from '../controller/report_man.controller.js';

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

//New routes for user expense reports
// router.get('/user-reports', getUserReports);
// router.get('/user-reports/generate', generateManagerTeamReport);
// router.get('/user-reports/:reportId/pdf', getReportPDF);
// router.get('/reports/download/:fileName', downloadPDFReport);
// router.delete('/user-reports/:reportId', deleteUserReport);
// router.get('/user-reports/:reportId', getReportDetails);

export default router;
