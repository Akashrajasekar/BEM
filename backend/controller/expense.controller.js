import Expense from "../models/expense.model.js";
import User from "../models/user.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs";
import multer from "multer";
import path from "path";

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
    const autoApproveEnabled = req.query.autoApprove === "true";

    // Get all expenses that are Pending and Submitted
    const pendingExpenses = await Expense.find({
      approvalStatus: "Pending",
      submissionStatus: "Submitted",
    }).populate("userId");

    if (!pendingExpenses.length) {
      return res.json({
        success: true,
        processedExpenses: [],
        message: "No eligible expenses found for processing",
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

        // Check if expense amount is within user's limit and category is eligible
        const isEligibleCategory = AUTO_APPROVAL_CATEGORIES.includes(
          expense.category
        );
        const isWithinLimit = expense.amount <= user.Alloted_Limit;

        if (autoApproveEnabled && isEligibleCategory && isWithinLimit) {
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
        // else if (autoApproveEnabled && !isWithinLimit) {
        //   // Auto-reject expenses that exceed limit
        //   await Expense.findByIdAndUpdate(
        //     expense._id,
        //     {
        //       approvalStatus: "Rejected",
        //       reasonForRejection: checkPolicyCompliance(expense),
        //     },
        //     { new: true }
        //   );

        // processedExpenses.push({
        //   expenseId: expense._id,
        //   amount: expense.amount,
        //   category: expense.category,
        //   userName: user.name,
        //   status: "Rejected",
        // });
        // }

        ///////scammmmmmm check laterrr dont keep this till end
        else if (autoApproveEnabled) {
          // Check with LLM for policy compliance
          const complianceResult = await checkPolicyCompliance(expense);

          if (
            complianceResult === "COMPLIANT" ||
            complianceResult === "OVER_LIMIT"
          ) {
            // If compliant but not in auto-approval categories, keep as pending
            processedExpenses.push({
              expenseId: expense._id,
              amount: expense.amount,
              category: expense.category,
              userName: user.name,
              status: "Pending",
            });
          } else {
            // Auto-reject with LLM-provided reason
            await Expense.findByIdAndUpdate(
              expense._id,
              {
                approvalStatus: "Rejected",
                reasonForRejection: complianceResult,
              },
              { new: true }
            );

            processedExpenses.push({
              expenseId: expense._id,
              amount: expense.amount,
              category: expense.category,
              userName: user.name,
              status: "Rejected",
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

// Get expense statistics
export const getExpenseStats = async (req, res) => {
  try {
    // Get total expenses
    const totalExpenses = await Expense.aggregate([
      {
        $match: {
          approvalStatus: { $in: ["Approved", "Pending", "Rejected"] },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Get pending approvals count
    const pendingApprovals = await Expense.countDocuments({
      approvalStatus: "Pending",
      submissionStatus: "Submitted",
    });

    // Get urgent requests (expenses pending for more than 5 days)
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const urgentRequests = await Expense.countDocuments({
      approvalStatus: "Pending",
      submissionStatus: "Submitted",
      createdAt: { $lte: fiveDaysAgo },
    });

    // Calculate expense growth (comparing to previous month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousMonthYear =
      currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthStart = new Date(currentYear, currentMonth, 1);
    const previousMonthStart = new Date(previousMonthYear, previousMonth, 1);
    const previousMonthEnd = new Date(currentYear, currentMonth, 0);

    const currentMonthExpenses = await Expense.aggregate([
      {
        $match: {
          expenseDate: { $gte: currentMonthStart },
          approvalStatus: "Approved",
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const previousMonthExpenses = await Expense.aggregate([
      {
        $match: {
          expenseDate: {
            $gte: previousMonthStart,
            $lte: previousMonthEnd,
          },
          approvalStatus: "Approved",
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    let expenseGrowth = 0;
    if (previousMonthExpenses.length > 0 && currentMonthExpenses.length > 0) {
      const currentTotal = currentMonthExpenses[0].total;
      const previousTotal = previousMonthExpenses[0].total;
      expenseGrowth =
        previousTotal > 0
          ? (((currentTotal - previousTotal) / previousTotal) * 100).toFixed(1)
          : 100;
    }

    res.json({
      totalExpenses: totalExpenses.length > 0 ? totalExpenses[0].total : 0,
      pendingApprovals,
      urgentRequests,
      expenseGrowth,
    });
  } catch (error) {
    console.error("Error fetching expense stats:", error);
    res.status(500).json({ message: "Error fetching expense stats" });
  }
};

// Add this to your expense.controller.js file

export const getExpenseChartData = async (req, res) => {
  try {
    // Get expenses by category (for pie chart)
    const expensesByCategory = await Expense.aggregate([
      {
        $match: {
          submissionStatus: "Submitted",
          approvalStatus: { $in: ["Approved", "Pending"] },
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      {
        $sort: { total: -1 },
      },
    ]);

    // Get monthly expense totals (for trend chart)
    const currentYear = new Date().getFullYear();
    const monthlyExpenses = await Expense.aggregate([
      {
        $match: {
          submissionStatus: "Submitted",
          approvalStatus: { $in: ["Approved", "Pending"] },
          expenseDate: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$expenseDate" },
          total: { $sum: "$amount" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Format monthly data with month names
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const formattedMonthlyData = monthNames.map((month, index) => {
      const monthData = monthlyExpenses.find((item) => item._id === index + 1);
      return {
        name: month,
        amount: monthData ? monthData.total : 0,
      };
    });

    // Get department expenses (for comparison chart)
    const departmentExpenses = await Expense.aggregate([
      {
        $match: {
          submissionStatus: "Submitted",
          approvalStatus: { $in: ["Approved", "Pending"] },
          department: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$department",
          total: { $sum: "$amount" },
        },
      },
      {
        $sort: { total: -1 },
      },
      {
        $limit: 5, // Top 5 departments
      },
    ]);

    res.status(200).json({
      categoryData: expensesByCategory,
      monthlyData: formattedMonthlyData,
      departmentData: departmentExpenses,
    });
  } catch (error) {
    console.error("Error fetching chart data:", error);
    res.status(500).json({
      message: "Error fetching chart data",
      error: error.message,
    });
  }
};

// Add these functions to your expense.controller.js file

export const approveExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;

    // Find the expense
    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Update expense status to Approved
    const updatedExpense = await Expense.findByIdAndUpdate(
      expenseId,
      { approvalStatus: "Approved" },
      { new: true }
    );

    // Find user and update their allocated limit if needed
    if (expense.userId) {
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

    return res.status(200).json({
      success: true,
      message: "Expense approved successfully",
      expense: updatedExpense,
    });
  } catch (error) {
    console.error("Error approving expense:", error);
    return res.status(500).json({
      success: false,
      message: "Error approving expense",
      error: error.message,
    });
  }
};

export const rejectExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { reason } = req.body;

    // Find the expense
    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Update expense status to Rejected
    const updatedExpense = await Expense.findByIdAndUpdate(
      expenseId,
      {
        approvalStatus: "Rejected",
        reasonForRejection: reason || "No reason provided",
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Expense rejected successfully",
      expense: updatedExpense,
    });
  } catch (error) {
    console.error("Error rejecting expense:", error);
    return res.status(500).json({
      success: false,
      message: "Error rejecting expense",
      error: error.message,
    });
  }
};

export const checkPolicyCompliance = async (expense) => {
  try {
    // Check if expense is undefined or null
    if (!expense) {
      return "COMPLIANT"; // Default return when no expense exists
    }

    dotenv.config();
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-pro" });

    // Read the company policy PDF
    const policyData = Buffer.from(
      fs.readFileSync("company-policy.pdf")
    ).toString("base64");

    // Create prompt with expense details
    const prompt = `Review this expense against our company policy:
    - Category: ${expense.category}
    - Amount: ${expense.amount} ${expense.currency}
    - Merchant: ${expense.merchant}
    - Description: ${expense.description || "None provided"}
    
    If this expense violates any policy, provide a brief 2-sentence reason for rejection. 
    If it complies with policy and is within limits, respond with "COMPLIANT".`;

    const result = await model.generateContent([
      {
        inlineData: {
          data: policyData,
          mimeType: "application/pdf",
        },
      },
      prompt,
    ]);

    const response = result.response.text().trim();
    return response;
  } catch (error) {
    console.error("LLM policy check error:", error);
    return "COMPLIANT"; // Return a default value on error instead of null
  }
};

// Add this new function to your controller

// Set up storage for policy files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/"); // Make sure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, "company-policy.pdf"); // Always use this filename to overwrite
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Add this route to your expense routes
export const uploadPolicyFile = (req, res) => {
  upload.single("policyFile")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    res.status(200).json({
      success: true,
      message: "Policy file uploaded successfully",
      filePath: req.file.path,
    });
  });
};