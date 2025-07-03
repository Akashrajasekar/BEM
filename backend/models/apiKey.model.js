import mongoose from "mongoose";

const apiKeySchema = new mongoose.Schema(
  {
    keyId: {
      type: String,
      required: true,
      unique: true,
    },
    apiKey: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    userId: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    permissions: [
      {
        type: String,
        enum: [
          "invoice:extract",
          "invoice:read",
          "invoice:delete",
          "invoice:all",
        ],
        default: ["invoice:all"],
      },
    ],
    rateLimit: {
      requestsPerMinute: { type: Number, default: 100 },
      requestsPerHour: { type: Number, default: 1000 },
      requestsPerDay: { type: Number, default: 10000 },
    },
    usage: {
      totalRequests: { type: Number, default: 0 },
      successfulRequests: { type: Number, default: 0 },
      failedRequests: { type: Number, default: 0 },
      lastUsed: { type: Date },
      dailyUsage: [
        {
          date: { type: Date },
          requests: { type: Number, default: 0 },
          successful: { type: Number, default: 0 },
          failed: { type: Number, default: 0 },
        },
      ],
    },
    ipWhitelist: [
      {
        type: String,
      },
    ],
    expiresAt: {
      type: Date,
    },
    lastRotated: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
apiKeySchema.index({ apiKey: 1 });
apiKeySchema.index({ userId: 1 });
apiKeySchema.index({ keyId: 1 });
apiKeySchema.index({ "usage.dailyUsage.date": 1 });

const ApiKey = mongoose.model("ApiKey", apiKeySchema);

export default ApiKey;
