import Expense from "../models/expense.model.js";
import User from "../models/user.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs";

export const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({
      submissionStatus: "Submitted",
    }).populate("userId", "name");

    const formattedExpenses = expenses.map((expense) => ({
      id: expense._id,
      name: expense.userId?.name || "Unknown",
      department: expense.department,
      amount: expense.amount,
      items: expense.category,
      submitted: new Date(expense.expenseDate).toLocaleDateString(),
      status: expense.approvalStatus,
      image: expense.receiptUrl || "https://via.placeholder.com/150",
    }));

    res.status(200).json(formattedExpenses);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving expenses", error: error.message });
  }
};

const AUTO_APPROVAL_CATEGORIES = [
  "Travel",
  "Office Supplies",
  "Meals",
  "Training",
  "Healthcare",
];

export const AutoApprovals = async (req, res) => {
  try {
    // Get all expenses that are Pending and Submitted
    const pendingExpenses = await Expense.find({
      approvalStatus: "Pending",
      submissionStatus: "Submitted",
      category: { $in: AUTO_APPROVAL_CATEGORIES },
    }).populate("userId");

    if (!pendingExpenses.length) {
      return res.json({
        success: true,
        processedExpenses: [],
        message: "No eligible expenses found for auto-approval",
      });
    }

    const processedExpenses = [];
    const errors = [];

    // Process each expense
    for (const expense of pendingExpenses) {
      try {
        const user = await User.findById(expense.userId);

        if (!user) {
          errors.push(`User not found for expense ${expense._id}`);
          continue;
        }

        if (!user.Alloted_Limit) {
          errors.push(
            `No limit set for user ${user.name} on expense ${expense._id}`
          );
          continue;
        }

        // Check if expense amount is within user's limit
        if (expense.amount <= user.Alloted_Limit) {
          // Update the expense status to AutoFlagged
          const updatedExpense = await Expense.findByIdAndUpdate(
            expense._id,
            { approvalStatus: "AutoFlagged" },
            { new: true }
          );

          if (updatedExpense) {
            processedExpenses.push({
              expenseId: updatedExpense._id,
              amount: updatedExpense.amount,
              category: updatedExpense.category,
              userName: user.name,
              status: updatedExpense.approvalStatus,
            });
          }
        }
      } catch (error) {
        errors.push(
          `Error processing expense ${expense._id}: ${error.message}`
        );
      }
    }

    res.json({
      success: true,
      processedExpenses,
      errors,
      message: `Processed ${processedExpenses.length} expenses. ${errors.length} errors occurred.`,
    });
  } catch (error) {
    console.error("Auto-approval error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing auto-approvals",
      error: error.message,
    });
  }
};

export const confirmAutoApprovals = async (req, res) => {
  try {
    // Find all auto-flagged expenses
    const autoFlaggedExpenses = await Expense.find({
      approvalStatus: "AutoFlagged",
    });

    if (autoFlaggedExpenses.length === 0) {
      return res.json({
        success: true,
        message: "No auto-flagged expenses found to approve",
        modifiedCount: 0,
      });
    }

    // Process each expense and update user limits
    for (const expense of autoFlaggedExpenses) {
      // Update expense status to Approved
      await Expense.findByIdAndUpdate(expense._id, {
        approvalStatus: "Approved",
      });

      // Find user and update their allocated limit
      const user = await User.findById(expense.userId);
      if (user && user.Alloted_Limit) {
        const newLimit = user.Alloted_Limit - expense.amount;
        await User.findByIdAndUpdate(
          user._id,
          { Alloted_Limit: newLimit },
          { new: true }
        );
      }
    }

    res.json({
      success: true,
      message: `Successfully approved ${autoFlaggedExpenses.length} expenses and updated user limits`,
      modifiedCount: autoFlaggedExpenses.length,
    });
  } catch (error) {
    console.error("Confirm auto-approvals error:", error);
    res.status(500).json({
      success: false,
      message: "Error confirming auto-approvals",
      error: error.message,
    });
  }
};

// In your expense controller
export const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id).populate(
      "userId",
      "name"
    );

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({
      id: expense._id,
      name: expense.userId?.name || "Unknown",
      department: expense.department,
      amount: expense.amount,
      currency: expense.currency,
      items: expense.category,
      merchant: expense.merchant,
      submitted: new Date(expense.expenseDate).toLocaleDateString(),
      status: expense.approvalStatus,
      receiptUrl: expense.receiptUrl,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching expense", error: error.message });
  }
};

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-pro" });

export const updateRejectionReason = async (req, res) => {
  try {
    const { expenseId } = req.params;

    // Find the expense
    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Check if expense is rejected
    if (expense.approvalStatus !== "Rejected") {
      return res.status(400).json({
        message: "Rejection reason can only be added to rejected expenses",
        currentStatus: expense.approvalStatus,
      });
    }

    // Read company policy document
    const policyDocument = fs.readFileSync("company-policy.pdf");

    // Construct prompt with expense details
    const prompt = `
      Based on the following expense details:
      - Merchant: ${expense.merchant}
      - Amount: ${expense.amount} ${expense.currency}
      - Category: ${expense.category}
      - Department: ${expense.department}
      - Date: ${expense.expenseDate}

      Compare with the company policy and provide a clear, concise rejection reason (under 100 words) if the expense violates any policies.
      Focus only on policy violations and be specific about which policies are violated.
    `;

    // Generate rejection reason using Gemini
    const result = await model.generateContent([
      {
        inlineData: {
          data: Buffer.from(policyDocument).toString("base64"),
          mimeType: "application/pdf",
        },
      },
      prompt,
    ]);

    const rejectionReason = result.response.text().trim();

    // Update expense with rejection reason
    const updatedExpense = await Expense.findByIdAndUpdate(
      expenseId,
      {
        reasonForRejection: rejectionReason,
      },
      { new: true }
    );

    return res.status(200).json({
      message: "Rejection reason updated successfully",
      rejectionReason,
      expense: updatedExpense,
    });
  } catch (error) {
    console.error("Error updating rejection reason:", error);
    return res.status(500).json({
      message: "Error updating rejection reason",
      error: error.message,
    });
  }
};
