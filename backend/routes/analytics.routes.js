import express from "express";
import {
  getSystemAnalytics,
  getUserAnalytics,
  getDetailedLogs,
  exportAnalytics,
} from "../controller/usageAnalytics.controller.js";

const router = express.Router();

// Basic authentication middleware for analytics endpoints
const authenticateAdmin = (req, res, next) => {
  const authToken = req.header("Authorization")?.replace("Bearer ", "");

  if (!authToken) {
    return res.status(401).json({
      success: false,
      message: "Authentication required for analytics access",
    });
  }

  // Add your authentication logic here
  if (!authToken.startsWith("admin_")) {
    return res.status(401).json({
      success: false,
      message: "Invalid authentication token",
    });
  }

  req.adminUser = { id: "admin", role: "admin" };
  next();
};

// System-wide analytics (admin only)
router.get("/analytics/system", authenticateAdmin, getSystemAnalytics);

// User-specific analytics
router.get("/analytics/users/:userId", authenticateAdmin, getUserAnalytics);

// Detailed logs with filtering and pagination
router.get("/analytics/logs", authenticateAdmin, getDetailedLogs);

// Export analytics data
router.get("/analytics/export", authenticateAdmin, exportAnalytics);

// Real-time statistics endpoint
router.get("/analytics/realtime", authenticateAdmin, async (req, res) => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Import models here to avoid circular dependency
    const { default: UsageLog } = await import("../models/usageLog.model.js");
    const { default: ApiKey } = await import("../models/apiKey.model.js");

    // Last hour statistics
    const lastHourStats = await UsageLog.aggregate([
      { $match: { timestamp: { $gte: oneHourAgo } } },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          successfulRequests: {
            $sum: { $cond: [{ $eq: ["$responseData.success", true] }, 1, 0] },
          },
          failedRequests: {
            $sum: { $cond: [{ $eq: ["$responseData.success", false] }, 1, 0] },
          },
          avgProcessingTime: { $avg: "$responseData.processingTime" },
        },
      },
    ]);

    // Last 24 hours statistics
    const last24HourStats = await UsageLog.aggregate([
      { $match: { timestamp: { $gte: oneDayAgo } } },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          successfulRequests: {
            $sum: { $cond: [{ $eq: ["$responseData.success", true] }, 1, 0] },
          },
          failedRequests: {
            $sum: { $cond: [{ $eq: ["$responseData.success", false] }, 1, 0] },
          },
          uniqueUsers: { $addToSet: "$userId" },
        },
      },
      {
        $project: {
          totalRequests: 1,
          successfulRequests: 1,
          failedRequests: 1,
          uniqueUserCount: { $size: "$uniqueUsers" },
        },
      },
    ]);

    // Active API keys count
    const activeApiKeysCount = await ApiKey.countDocuments({ isActive: true });

    // Recent activity (last 10 requests)
    const recentActivity = await UsageLog.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .select(
        "userId endpoint responseData.success timestamp responseData.processingTime"
      )
      .lean();

    res.json({
      success: true,
      data: {
        lastHour: lastHourStats[0] || {
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          avgProcessingTime: 0,
        },
        last24Hours: last24HourStats[0] || {
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          uniqueUserCount: 0,
        },
        activeApiKeys: activeApiKeysCount,
        recentActivity,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching real-time analytics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching real-time analytics",
      error: error.message,
    });
  }
});

// Health check for analytics service
router.get("/analytics/health", (req, res) => {
  res.json({
    success: true,
    message: "Analytics service is running",
    timestamp: new Date().toISOString(),
  });
});

export default router;
