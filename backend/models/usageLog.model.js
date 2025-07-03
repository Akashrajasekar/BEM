import mongoose from "mongoose";

const usageLogSchema = new mongoose.Schema(
  {
    apiKey: {
      type: String,
      required: true,
      index: true,
    },
    keyId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    endpoint: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      required: true,
    },
    requestData: {
      headers: { type: Object },
      query: { type: Object },
      body: { type: Object },
      fileInfo: {
        originalName: String,
        mimeType: String,
        size: Number,
      },
    },
    responseData: {
      statusCode: { type: Number, required: true },
      success: { type: Boolean, required: true },
      message: String,
      processingTime: { type: Number }, // in milliseconds
      dataExtracted: { type: Boolean, default: false },
      excelGenerated: { type: Boolean, default: false },
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    error: {
      message: String,
      stack: String,
      code: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient querying
usageLogSchema.index({ apiKey: 1, timestamp: -1 });
usageLogSchema.index({ userId: 1, timestamp: -1 });
usageLogSchema.index({ endpoint: 1, timestamp: -1 });
usageLogSchema.index({ "responseData.success": 1, timestamp: -1 });

// TTL index to automatically delete old logs (optional - keeps logs for 90 days)
usageLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 }
);

const UsageLog = mongoose.model("UsageLog", usageLogSchema);

export default UsageLog;
