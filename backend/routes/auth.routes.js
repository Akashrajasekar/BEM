import express from 'express';
import { resetPassword, login, extractReceiptText, authenticateUser, getExpenses, saveReceiptAsDraft, deleteExpense, updateDraftExpense, submitDraftExpense, createManualExpense, getDepartmentById } from '../controller/auth_r.controller.js';
import { generateUserExpenseReport,
    getUserReports,
    downloadPDFReport,
    deleteUserReport,
    getReportPDF,
    getReportDetails
 } from '../controller/AIreport.controller.js';
import { generateChatResponse } from '../controller/chatbot.controller.js';
import { getUserExpenseStats } from '../controller/user_dash.controller.js';
import multer from 'multer';


const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/reset-password', resetPassword);
router.post('/login', login);

// Apply authentication middleware to all routes
router.use(authenticateUser);
// Define the route for receipt text extraction
router.post('/extract-receipt-text',upload.single('receipt'),authenticateUser, extractReceiptText);
router.get('/expenses', authenticateUser, getExpenses);
router.post('/save-receipt-draft',upload.single('receipt'), authenticateUser, saveReceiptAsDraft);
router.delete('/expenses/:id', authenticateUser, deleteExpense);
router.patch('/expenses/:id', authenticateUser, updateDraftExpense);
router.patch('/expenses/:id/submit', authenticateUser, submitDraftExpense);
router.post('/expenses/manual', authenticateUser, createManualExpense);
router.get('/departments/:departmentId', authenticateUser, getDepartmentById);

// New routes for user expense reports
router.get('/user-reports', getUserReports);
router.get('/user-reports/generate', generateUserExpenseReport);
router.get('/user-reports/:reportId/pdf', getReportPDF);
router.get('/reports/download/:fileName', downloadPDFReport);
//router.get('/reports/download/:reportId', authMiddleware, downloadPDFReport);
router.delete('/user-reports/:reportId', deleteUserReport);
router.get('/user-reports/:reportId', getReportDetails);

//chatbot
router.post('/chat/gemini', generateChatResponse);

// Route to get expense statistics for a specific user
router.get('/stats/:userId', getUserExpenseStats);
export default router;