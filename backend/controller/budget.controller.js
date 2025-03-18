// departments.controller.js

import Department from "../models/departments.model.js";
import User from "../models/user.model.js";
import Expense from "../models/expense.model.js";

export const getDepartmentsList = async (req, res) => {
  try {
    const departments = await Department.find().select("name");
    res.json(departments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching departments", error: error.message });
  }
};

export const getDepartmentManagers = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const managers = await User.find({
      department_id: departmentId,
      access: "manager",
    }).select("name _id");
    res.json(managers);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching managers", error: error.message });
  }
};

export const updateDepartmentBudget = async (req, res) => {
  try {
    const { department_id, manager_id, total_budget } = req.body;

    const updatedDepartment = await Department.findByIdAndUpdate(
      department_id,
      {
        manager_id,
        total_budget,
      },
      { new: true }
    );

    if (!updatedDepartment) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.json(updatedDepartment);
  } catch (error) {
    res.status(500).json({
      message: "Error updating department budget",
      error: error.message,
    });
  }
};

// Get department budget information
export const getDepartmentBudget = async (req, res) => {
  try {
    // Get total budget across all departments
    const totalBudget = await Department.aggregate([
      { $group: { _id: null, total: { $sum: "$total_budget" } } },
    ]);

    // Get total approved expenses
    const totalApprovedExpenses = await Expense.aggregate([
      { $match: { approvalStatus: "Approved" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const availableBudget =
      totalBudget.length > 0
        ? totalBudget[0].total -
          (totalApprovedExpenses.length > 0
            ? totalApprovedExpenses[0].total
            : 0)
        : 0;

    const totalBudgetValue = totalBudget.length > 0 ? totalBudget[0].total : 0;
    const budgetUsedPercentage =
      totalBudgetValue > 0
        ? (
            ((totalBudgetValue - availableBudget) / totalBudgetValue) *
            100
          ).toFixed(1)
        : 0;

    res.json({
      totalBudget: totalBudgetValue,
      availableBudget,
      budgetUsedPercentage,
    });
  } catch (error) {
    console.error("Error fetching department budget:", error);
    res.status(500).json({ message: "Error fetching department budget" });
  }
};

/**
 * Get total budget and budget spent across all departments
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getBudgetSummary = async (req, res) => {
  try {
    // Optionally filter by organization_id if provided in query
    const orgFilter = req.query.organization_id
      ? { organization_id: req.query.organization_id }
      : {};

    // Aggregate to calculate total budget from departments
    const departmentAggregation = await Department.aggregate([
      { $match: orgFilter },
      {
        $group: {
          _id: null,
          totalBudget: { $sum: "$total_budget" },
        },
      },
    ]);

    // Aggregate to calculate total expenses (only approved expenses)
    const expenseAggregation = await Expense.aggregate([
      {
        $match: {
          ...orgFilter,
          approvalStatus: "Approved", // Only include approved expenses
        },
      },
      {
        $group: {
          _id: null,
          budgetSpent: { $sum: "$amount" },
        },
      },
    ]);

    // Extract values from aggregation results or default to 0
    const totalBudget =
      departmentAggregation.length > 0
        ? departmentAggregation[0].totalBudget
        : 0;

    const budgetSpent =
      expenseAggregation.length > 0 ? expenseAggregation[0].budgetSpent : 0;

    // Calculate remaining budget
    const remainingBudget = totalBudget - budgetSpent;

    // Return the budget summary
    return res.status(200).json({
      success: true,
      data: {
        totalBudget,
        budgetSpent,
        remainingBudget,
        budgetUtilizationPercentage:
          totalBudget > 0 ? ((budgetSpent / totalBudget) * 100).toFixed(2) : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching budget summary:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch budget summary",
      error: error.message,
    });
  }
};

/**
 * Get department budget distribution data for pie chart
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getDepartmentBudgetDistribution = async (req, res) => {
  try {
    // Optionally filter by organization_id if provided in query
    const orgFilter = req.query.organization_id
      ? {
          organization_id: new mongoose.Types.ObjectId(
            req.query.organization_id
          ),
        }
      : {};

    // Aggregate to get departments with their total budgets
    const departmentBudgets = await Department.aggregate([
      { $match: { ...orgFilter, total_budget: { $exists: true, $ne: null } } },
      {
        $project: {
          name: 1,
          total_budget: 1,
        },
      },
      { $sort: { total_budget: -1 } },
    ]);

    // Transform data for pie chart
    const pieData = departmentBudgets.map((dept, index) => {
      // Define colors that match the theme
      const colors = [
        "#F97316",
        "#FB923C",
        "#FDBA74",
        "#FED7AA",
        "#E8A67E",
        "#D4845C",
        "#C05621",
      ];
      return {
        name: dept.name,
        value: dept.total_budget,
        color: colors[index % colors.length], // Cycle through colors
      };
    });

    return res.status(200).json({
      success: true,
      data: pieData,
    });
  } catch (error) {
    console.error("Error fetching budget distribution:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch budget distribution data",
      error: error.message,
    });
  }
};

/**
 * Get monthly expenses data for scatter plot
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getMonthlyExpenseData = async (req, res) => {
  try {
    // Optionally filter by organization_id if provided in query
    const orgFilter = req.query.organization_id
      ? {
          organization_id: new mongoose.Types.ObjectId(
            req.query.organization_id
          ),
        }
      : {};

    // Only include approved expenses
    const matchCondition = {
      ...orgFilter,
      approvalStatus: "Approved",
      expenseDate: { $exists: true },
    };

    // Aggregate expenses by month
    const monthlyExpenses = await Expense.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: {
            year: { $year: "$expenseDate" },
            month: { $month: "$expenseDate" },
          },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }, // Count expenses per month
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          totalAmount: 1,
          count: 1,
        },
      },
      { $sort: { year: 1, month: 1 } },
    ]);

    // Transform data for scatter plot
    const scatterData = monthlyExpenses.map((item) => {
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
      return {
        name: monthNames[item.month - 1],
        amount: item.totalAmount,
        count: item.count,
        // Adding x and y properties for scatter plot
        x: `${monthNames[item.month - 1]} ${item.year}`,
        y: item.totalAmount,
      };
    });

    return res.status(200).json({
      success: true,
      data: scatterData,
    });
  } catch (error) {
    console.error("Error fetching monthly expense data:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch monthly expense data",
      error: error.message,
    });
  }
};

/**
 * Get yearly expenses data for bar graph
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getYearlyExpenseData = async (req, res) => {
  try {
    // Optionally filter by organization_id if provided in query
    const orgFilter = req.query.organization_id
      ? {
          organization_id: new mongoose.Types.ObjectId(
            req.query.organization_id
          ),
        }
      : {};

    // Only include approved expenses
    const matchCondition = {
      ...orgFilter,
      approvalStatus: "Approved",
      expenseDate: { $exists: true },
    };

    // Aggregate expenses by year
    const yearlyExpenses = await Expense.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: { $year: "$expenseDate" },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }, // Count expenses per year
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id",
          amount: "$totalAmount",
          count: 1,
        },
      },
      { $sort: { year: 1 } }, // Sort by year ascending
    ]);

    // If there's no data, return empty array with a message
    if (yearlyExpenses.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No yearly expense data found",
        data: [],
      });
    }

    // Format data for the bar chart
    const barData = yearlyExpenses.map((item) => ({
      name: item.year.toString(),
      value: item.amount,
      count: item.count,
    }));

    return res.status(200).json({
      success: true,
      data: barData,
    });
  } catch (error) {
    console.error("Error fetching yearly expense data:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch yearly expense data",
      error: error.message,
    });
  }
};

/**
 * Get detailed budget information for each department
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getDepartmentBudgets = async (req, res) => {
  try {
    // Optionally filter by organization_id if provided in query
    const orgFilter = req.query.organization_id
      ? {
          organization_id: new mongoose.Types.ObjectId(
            req.query.organization_id
          ),
        }
      : {};

    // Get all departments with their allocated budgets
    const departments = await Department.find({
      ...orgFilter,
      total_budget: { $exists: true },
    }).lean();

    // Create a map to store department information
    const departmentMap = new Map();
    departments.forEach((dept) => {
      departmentMap.set(dept._id.toString(), {
        _id: dept._id,
        name: dept.name,
        allocated: dept.total_budget || 0,
        spent: 0,
        remaining: dept.total_budget || 0,
      });
    });

    // Get all expense data with approved status
    const approvedExpenses = await Expense.find({
      ...orgFilter,
      approvalStatus: "Approved",
    })
      .populate({
        path: "userId",
        select: "name department department_id",
        model: User,
      })
      .lean();

    // Calculate spent amount for each department
    approvedExpenses.forEach((expense) => {
      if (expense.userId && expense.userId.department_id) {
        const deptId = expense.userId.department_id.toString();

        if (departmentMap.has(deptId)) {
          const dept = departmentMap.get(deptId);
          dept.spent += expense.amount || 0;
          dept.remaining = dept.allocated - dept.spent;
        }
      }
    });

    // Convert map to array and calculate percentages
    const departmentBudgets = Array.from(departmentMap.values()).map(
      (dept) => ({
        ...dept,
        spent: dept.spent,
        remaining: dept.remaining,
        utilizationPercentage:
          dept.allocated > 0
            ? Math.round((dept.spent / dept.allocated) * 100)
            : 0,
      })
    );

    return res.status(200).json({
      success: true,
      data: departmentBudgets,
    });
  } catch (error) {
    console.error("Error fetching department budgets:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch department budgets",
      error: error.message,
    });
  }
};