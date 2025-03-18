import User from "../models/user.model.js";
import Department from "../models/departments.model.js";
import Expense from "../models/expense.model.js";

// Get dashboard statistics for admin page
export const getDashboardStats = async (req, res) => {
  try {
    // Get total users count
    const totalUsers = await User.countDocuments();

    // Calculate total budget (sum of all department budgets)
    const departments = await Department.find();
    const totalBudget = departments.reduce((sum, dept) => {
      return sum + (dept.total_budget || 0);
    }, 0);

    // Count total departments
    const totalDepartments = departments.length;

    // Count pending expense claims
    const pendingClaims = await Expense.countDocuments({
      approvalStatus: "Pending",
      submissionStatus: "Submitted",
    });

    res.status(200).json({
      totalUsers,
      totalBudget,
      totalDepartments,
      pendingClaims,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard statistics" });
  }
};
