// controllers/user_dash.controller.js
import mongoose from 'mongoose';
import Expense from '../models/expense.model.js';
import User from '../models/user.model.js';

export const getUserExpenseStats = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    //console.log("Fetching stats for userId:", userId);
    
    // Get current date info for filtering
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Ensure userId is converted to ObjectId if it's not already
    let userIdObj;
    try {
      userIdObj = new mongoose.Types.ObjectId(userId);
    } catch (err) {
      console.log("Could not convert userId to ObjectId, using as is:", userId);
      userIdObj = userId;
    }
    
    // Get total expenses for current month
    const totalMonthlyExpenses = await Expense.aggregate([
      { 
        $match: { 
          userId: userIdObj,
          expenseDate: { 
            $gte: new Date(currentYear, currentMonth, 1),
            $lte: new Date(currentYear, currentMonth + 1, 0)
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);
    
    // Get approved expenses in the last 7 days
    const approvedExpenses = await Expense.aggregate([
      { 
        $match: { 
          userId: userIdObj,
          approvalStatus: "Approved",
          updatedAt: { $gte: oneWeekAgo }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);
    
    // Count pending submissions
    const pendingCount = await Expense.countDocuments({
      userId: userIdObj,
      submissionStatus: "Submitted",
      approvalStatus: "Pending"
    });
    
    // Count draft reports
    const draftCount = await Expense.countDocuments({
      userId: userIdObj,
      submissionStatus: "Draft"
    });
    
    // Get user's expense limit
    const user = await User.findById(userId);
    
    // Format expenses similar to the example code
    const formattedExpenses = await Expense.find({
      userId: userIdObj,
      submissionStatus: "Submitted"
    }).populate("userId", "name");
    
    const recentExpenses = formattedExpenses.map(expense => ({
      id: expense._id,
      name: expense.userId?.name || "Unknown",
      department: expense.department,
      amount: expense.amount,
      items: expense.category,
      submitted: new Date(expense.expenseDate).toLocaleDateString(),
      status: expense.approvalStatus,
      image: expense.receiptUrl || "https://via.placeholder.com/150"
    }));
    
    // Debug logs
    // console.log("Query results:");
    // console.log("- Total monthly expenses:", totalMonthlyExpenses);
    // console.log("- Approved expenses:", approvedExpenses);
    // console.log("- Pending count:", pendingCount);
    // console.log("- Draft count:", draftCount);
    
    res.status(200).json({
      totalMonthlyExpenses: totalMonthlyExpenses.length > 0 ? totalMonthlyExpenses[0].total : 0,
      approvedExpenses: approvedExpenses.length > 0 ? approvedExpenses[0].total : 0,
      pendingCount,
      draftCount,
      allotedLimit: user?.Alloted_Limit || 0,
      recentExpenses // Include the formatted recent expenses
    });
    
  } catch (error) {
    console.error("Error fetching user expense stats:", error);
    res.status(500).json({ 
      message: "Failed to fetch expense statistics", 
      error: error.message 
    });
  }
};