import mongoose from "mongoose";

const aiPredictionSchema = new mongoose.Schema(
  {
    expenseId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Expense", // Reference to Expense collection
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Organization", // Reference to Organization collection
    },
    department: {
      type: String,
      required: true,
    },
    predictedApproval: {
      type: String,
      required: true,
      enum: ["Likely Approved", "Likely Rejected", "Needs Review"], // Expand options as needed
    },
    confidenceScore: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    duplicateDetection: {
      type: Boolean,
      required: true,
    },
    policy_flags: {
      type: [String],
      default: [],
    },
    suggested_adjustments: {
      amount: {
        type: Number,
        required: true,
      },
      reason: {
        type: String,
        required: true,
      },
    },
    riskLevel: {
      type: String,
      required: true,
      enum: ["Low", "Medium", "High"], // Define risk levels
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

const AiPrediction = mongoose.model("AiPrediction", aiPredictionSchema);

export default AiPrediction;
