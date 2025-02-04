import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    department: {
      type: String,
      required: true,
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Manager", // Reference to Manager collection
    },
    expenseReportId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "ExpenseReport", // Reference to ExpenseReport collection
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Organization", // Reference to Organization collection
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      enum: ["AED", "INR", "USD"], // Add more currencies if needed
    },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Completed", "Rejected"], // Add more statuses if needed
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
