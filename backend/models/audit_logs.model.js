import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    department: {
      type: String,
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Organization", // Reference to Organization collection
    },
    record_type: {
      type: String,
      required: true,
      enum: ["approval", "submission", "modification", "deletion"], // Expand as needed
    },
    reference_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    performed_by: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // Reference to User collection
    },
    action: {
      type: String,
      required: true,
    },
    blockchain_tx_hash: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true, // Only manage createdAt
  }
);

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
