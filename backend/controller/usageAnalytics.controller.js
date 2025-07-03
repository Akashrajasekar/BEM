import UsageLog from "../models/usageLog.model.js";
import ApiKey from "../models/apiKey.model.js";
import moment from "moment";

// Get overall system analytics
export const getSystemAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = "day", userId } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) dateFilter.timestamp.$gte = new Date(startDate);
      if (endDate) dateFilter.timestamp.$lte = new Date(endDate);
    }

    // Add user filter if specified
    if (userId) {
      dateFilter.userId = userId;
    }

    // Overall statistics
    const overallStats = await UsageLog.aggregate([
      { $match: dateFilter },
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
          totalDataExtracted: {
            $sum: {
              $cond: [{ $eq: ["$responseData.dataExtracted", true] }, 1, 0],
            },
          },
          totalExcelGenerated: {
            $sum: {
              $cond: [{ $eq: ["$responseData.excelGenerated", true] }, 1, 0],
            },
          },
          uniqueUsers: { $addToSet: "$userId" },
          uniqueApiKeys: { $addToSet: "$keyId" },
        },
      },
      {
        $project: {
          totalRequests: 1,
          successfulRequests: 1,
          failedRequests: 1,
          avgProcessingTime: 1,
          totalDataExtracted: 1,
          totalExcelGenerated: 1,
          uniqueUserCount: { $size: "$uniqueUsers" },
          uniqueApiKeyCount: { $size: "$uniqueApiKeys" },
          successRate: {
            $cond: [
              { $eq: ["$totalRequests", 0] },
              0,
              {
                $multiply: [
                  { $divide: ["$successfulRequests", "$totalRequests"] },
                  100,
                ],
              },
            ],
          },
        },
      },
    ]);

    // Time series data
    const groupFormat = getGroupFormat(groupBy);
    const timeSeriesData = await UsageLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: groupFormat,
          requests: { $sum: 1 },
          successful: {
            $sum: { $cond: [{ $eq: ["$responseData.success", true] }, 1, 0] },
          },
          failed: {
            $sum: { $cond: [{ $eq: ["$responseData.success", false] }, 1, 0] },
          },
          avgProcessingTime: { $avg: "$responseData.processingTime" },
          dataExtracted: {
            $sum: {
              $cond: [{ $eq: ["$responseData.dataExtracted", true] }, 1, 0],
            },
          },
          excelGenerated: {
            $sum: {
              $cond: [{ $eq: ["$responseData.excelGenerated", true] }, 1, 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 100 },
    ]);

    // Top endpoints
    const topEndpoints = await UsageLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$endpoint",
          requests: { $sum: 1 },
          successful: {
            $sum: { $cond: [{ $eq: ["$responseData.success", true] }, 1, 0] },
          },
          avgProcessingTime: { $avg: "$responseData.processingTime" },
        },
      },
      { $sort: { requests: -1 } },
      { $limit: 10 },
    ]);

    // Top users by API usage
    const topUsers = await UsageLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$userId",
          requests: { $sum: 1 },
          successful: {
            $sum: { $cond: [{ $eq: ["$responseData.success", true] }, 1, 0] },
          },
          lastActivity: { $max: "$timestamp" },
        },
      },
      { $sort: { requests: -1 } },
      { $limit: 10 },
    ]);

    // Error analysis
    const errorAnalysis = await UsageLog.aggregate([
      {
        $match: {
          ...dateFilter,
          "responseData.success": false,
        },
      },
      {
        $group: {
          _id: "$responseData.statusCode",
          count: { $sum: 1 },
          messages: { $addToSet: "$responseData.message" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        overall: overallStats[0] || getDefaultStats(),
        timeSeries: timeSeriesData,
        topEndpoints,
        topUsers,
        errorAnalysis,
        period: {
          startDate: startDate || "All time",
          endDate: endDate || "Present",
          groupBy,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching system analytics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching system analytics",
      error: error.message,
    });
  }
};

// Get user-specific analytics
export const getUserAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, groupBy = "day" } = req.query;

    // Build date filter
    const dateFilter = { userId };
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) dateFilter.timestamp.$gte = new Date(startDate);
      if (endDate) dateFilter.timestamp.$lte = new Date(endDate);
    }

    // User's API keys
    const userApiKeys = await ApiKey.find({ userId, isActive: true }).select(
      "keyId name usage createdAt"
    );

    // User statistics
    const userStats = await UsageLog.aggregate([
      { $match: dateFilter },
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
          totalDataExtracted: {
            $sum: {
              $cond: [{ $eq: ["$responseData.dataExtracted", true] }, 1, 0],
            },
          },
          totalExcelGenerated: {
            $sum: {
              $cond: [{ $eq: ["$responseData.excelGenerated", true] }, 1, 0],
            },
          },
          firstRequest: { $min: "$timestamp" },
          lastRequest: { $max: "$timestamp" },
        },
      },
    ]);

    // API key usage breakdown
    const apiKeyUsage = await UsageLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$keyId",
          requests: { $sum: 1 },
          successful: {
            $sum: { $cond: [{ $eq: ["$responseData.success", true] }, 1, 0] },
          },
          failed: {
            $sum: { $cond: [{ $eq: ["$responseData.success", false] }, 1, 0] },
          },
          lastUsed: { $max: "$timestamp" },
        },
      },
      { $sort: { requests: -1 } },
    ]);

    // Daily usage trend
    const dailyUsage = await UsageLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          requests: { $sum: 1 },
          successful: {
            $sum: { $cond: [{ $eq: ["$responseData.success", true] }, 1, 0] },
          },
          dataExtracted: {
            $sum: {
              $cond: [{ $eq: ["$responseData.dataExtracted", true] }, 1, 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }, // Last 30 days
    ]);

    res.json({
      success: true,
      data: {
        userId,
        apiKeys: userApiKeys,
        statistics: userStats[0] || getDefaultStats(),
        apiKeyUsage,
        dailyUsage,
        period: {
          startDate: startDate || "All time",
          endDate: endDate || "Present",
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user analytics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user analytics",
      error: error.message,
    });
  }
};

// Get detailed logs with filtering and pagination
export const getDetailedLogs = async (req, res) => {
  try {
    const {
      userId,
      keyId,
      endpoint,
      success,
      startDate,
      endDate,
      page = 1,
      limit = 50,
      sortBy = "timestamp",
      sortOrder = "desc",
    } = req.query;

    // Build filter
    const filter = {};
    if (userId) filter.userId = userId;
    if (keyId) filter.keyId = keyId;
    if (endpoint) filter.endpoint = { $regex: endpoint, $options: "i" };
    if (success !== undefined)
      filter["responseData.success"] = success === "true";

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute query with pagination
    const logs = await UsageLog.find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const totalCount = await UsageLog.countDocuments(filter);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / parseInt(limit)),
        },
        filters: {
          userId,
          keyId,
          endpoint,
          success,
          startDate,
          endDate,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching detailed logs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching detailed logs",
      error: error.message,
    });
  }
};

// Export analytics data
export const exportAnalytics = async (req, res) => {
  try {
    const { userId, startDate, endDate, format = "csv" } = req.query;

    // Build filter
    const filter = {};
    if (userId) filter.userId = userId;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    // Get logs
    const logs = await UsageLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(10000) // Limit for performance
      .lean();

    if (format === "csv") {
      // Convert to CSV
      const csvHeaders = [
        "Timestamp",
        "User ID",
        "Key ID",
        "Endpoint",
        "Method",
        "Status Code",
        "Success",
        "Processing Time (ms)",
        "IP Address",
        "User Agent",
      ];

      const csvRows = logs.map((log) => [
        log.timestamp.toISOString(),
        log.userId,
        log.keyId,
        log.endpoint,
        log.method,
        log.responseData.statusCode,
        log.responseData.success,
        log.responseData.processingTime,
        log.ipAddress,
        log.userAgent,
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map((row) => row.map((field) => `"${field}"`).join(","))
        .join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="api_usage_${Date.now()}.csv"`
      );
      res.send(csvContent);
    } else {
      // Return JSON
      res.json({
        success: true,
        data: logs,
        exportInfo: {
          format,
          totalRecords: logs.length,
          exportDate: new Date().toISOString(),
          filters: { userId, startDate, endDate },
        },
      });
    }
  } catch (error) {
    console.error("Error exporting analytics:", error);
    res.status(500).json({
      success: false,
      message: "Error exporting analytics",
      error: error.message,
    });
  }
};

// Helper functions
const getGroupFormat = (groupBy) => {
  switch (groupBy) {
    case "hour":
      return {
        $dateToString: { format: "%Y-%m-%d %H:00", date: "$timestamp" },
      };
    case "day":
      return { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } };
    case "week":
      return { $dateToString: { format: "%Y-W%U", date: "$timestamp" } };
    case "month":
      return { $dateToString: { format: "%Y-%m", date: "$timestamp" } };
    default:
      return { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } };
  }
};

const getDefaultStats = () => ({
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  avgProcessingTime: 0,
  totalDataExtracted: 0,
  totalExcelGenerated: 0,
  uniqueUserCount: 0,
  uniqueApiKeyCount: 0,
  successRate: 0,
});
