import express from 'express';
import { resetPassword, login, extractReceiptText, authenticateUser, getExpenses, saveReceiptAsDraft, deleteExpense, updateDraftExpense, submitDraftExpense, createManualExpense, getDepartmentById } from '../controller/auth_r.controller.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/reset-password', resetPassword);
router.post('/login', login);
// Define the route for receipt text extraction
router.post('/extract-receipt-text',upload.single('receipt'),authenticateUser, extractReceiptText);
router.get('/expenses', authenticateUser, getExpenses);
router.post('/save-receipt-draft',upload.single('receipt'), authenticateUser, saveReceiptAsDraft);
router.delete('/expenses/:id', authenticateUser, deleteExpense);
router.patch('/expenses/:id', authenticateUser, updateDraftExpense);
router.patch('/expenses/:id/submit', authenticateUser, submitDraftExpense);
router.post('/expenses/manual', authenticateUser, createManualExpense);
router.get('/departments/:departmentId', authenticateUser, getDepartmentById);
export default router;