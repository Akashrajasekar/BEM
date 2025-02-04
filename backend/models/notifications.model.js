import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // Reference to User collection
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Organization", // Reference to Organization collection
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Approval Update", "Token Allocation", "New Expense"], // Notification types
    },
    isRead: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true, // Only manage createdAt
  }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;