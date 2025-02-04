import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Admin", // Reference to Admin collection
    },
    organizationId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Organization", // Reference to Organization collection
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Manager", // Reference to Manager collection
    },
    department: {
      type: String,
      required: true,
    },
    allocatedTokens: {
      type: Number,
      required: true,
    },
    remainingTokens: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      enum: ["AED", "INR", "USD"], // Add more currencies if needed
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

const Token = mongoose.model("Token", tokenSchema);

export default Token;
