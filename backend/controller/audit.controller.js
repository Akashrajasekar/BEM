// auditController.js
import Expense from "../models/expense.model.js";

export const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, department, search } = req.query;

    const query = {};

    if (status) {
      query.approvalStatus = status;
    }

    if (department) {
      query.department = department;
    }

    if (search) {
      query.$or = [
        { merchant: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .populate("userId", "name role")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Expense.countDocuments(query),
    ]);

    const auditLogs = expenses.map((expense) => ({
      id: expense._id,
      timestamp: expense.createdAt,
      user: {
        name: expense.userId.name,
        role: expense.userId.role,
      },
      status: expense.approvalStatus,
      amount: expense.amount,
      currency: expense.currency,
      merchant: expense.merchant,
      category: expense.category,
      department: expense.department,
    }));

    res.json({
      logs: auditLogs,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
};

export const getExpenseDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findById(id)
      .populate("userId", "name role")
      .populate("department_id", "name");

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch expense details" });
  }
};
