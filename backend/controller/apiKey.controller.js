import ApiKey from "../models/apiKey.model.js";
import UsageLog from "../models/usageLog.model.js";
import crypto from "crypto";
import moment from "moment";

// Generate a secure API key
const generateApiKey = () => {
  const prefix = "iak_"; // invoice api key prefix
  const randomBytes = crypto.randomBytes(32).toString("hex");
  return `${prefix}${randomBytes}`;
};

// Generate a unique key ID
const generateKeyId = () => {
  return crypto.randomBytes(16).toString("hex");
};

// Create new API key
export const createApiKey = async (req, res) => {
  try {
    const {
      name,
      description,
      userId,
      userEmail,
      permissions,
      rateLimit,
      ipWhitelist,
      expiresAt,
    } = req.body;

    // Input validation
    if (!name || !userId || !userEmail) {
      return res.status(400).json({
        success: false,
        message: "Name, userId, and userEmail are required",
      });
    }

    // Check if user already has an active API key with the same name
    const existingKey = await ApiKey.findOne({
      userId,
      name,
      isActive: true,
    });

    if (existingKey) {
      return res.status(409).json({
        success: false,
        message:
          "An active API key with this name already exists for this user",
      });
    }

    const keyId = generateKeyId();
    const apiKey = generateApiKey();

    const newApiKey = new ApiKey({
      keyId,
      apiKey,
      name,
      description,
      userId,
      userEmail,
      permissions: permissions || ["invoice:all"],
      rateLimit: {
        requestsPerMinute: rateLimit?.requestsPerMinute || 100,
        requestsPerHour: rateLimit?.requestsPerHour || 1000,
        requestsPerDay: rateLimit?.requestsPerDay || 10000,
      },
      ipWhitelist: ipWhitelist || [],
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    await newApiKey.save();

    // Return the API key (this should be stored securely by the client)
    res.status(201).json({
      success: true,
      message: "API key created successfully",
      data: {
        keyId,
        apiKey, // Only shown once during creation
        name,
        description,
        permissions: newApiKey.permissions,
        rateLimit: newApiKey.rateLimit,
        createdAt: newApiKey.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating API key:", error);
    res.status(500).json({
      success: false,
      message: "Error creating API key",
      error: error.message,
    });
  }
};

// Get all API keys for a user (without showing the actual key)
export const getUserApiKeys = async (req, res) => {
  try {
    const { userId } = req.params;
    const { includeInactive = false } = req.query;

    const filter = { userId };
    if (!includeInactive) {
      filter.isActive = true;
    }

    const apiKeys = await ApiKey.find(filter)
      .select("-apiKey") // Exclude the actual API key from response
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: apiKeys,
      total: apiKeys.length,
    });
  } catch (error) {
    console.error("Error fetching API keys:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching API keys",
      error: error.message,
    });
  }
};

// Get API key details by keyId
export const getApiKeyDetails = async (req, res) => {
  try {
    const { keyId } = req.params;

    const apiKey = await ApiKey.findOne({ keyId }).select("-apiKey"); // Exclude the actual API key

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: "API key not found",
      });
    }

    res.status(200).json({
      success: true,
      data: apiKey,
    });
  } catch (error) {
    console.error("Error fetching API key details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching API key details",
      error: error.message,
    });
  }
};

// Update API key
export const updateApiKey = async (req, res) => {
  try {
    const { keyId } = req.params;
    const updates = req.body;

    // Don't allow updating the actual API key or keyId
    delete updates.apiKey;
    delete updates.keyId;

    const apiKey = await ApiKey.findOneAndUpdate(
      { keyId },
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-apiKey");

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: "API key not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "API key updated successfully",
      data: apiKey,
    });
  } catch (error) {
    console.error("Error updating API key:", error);
    res.status(500).json({
      success: false,
      message: "Error updating API key",
      error: error.message,
    });
  }
};

// Deactivate API key
export const deactivateApiKey = async (req, res) => {
  try {
    const { keyId } = req.params;

    const apiKey = await ApiKey.findOneAndUpdate(
      { keyId },
      { $set: { isActive: false } },
      { new: true }
    ).select("-apiKey");

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: "API key not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "API key deactivated successfully",
      data: apiKey,
    });
  } catch (error) {
    console.error("Error deactivating API key:", error);
    res.status(500).json({
      success: false,
      message: "Error deactivating API key",
      error: error.message,
    });
  }
};

// Rotate API key (generate new key)
export const rotateApiKey = async (req, res) => {
  try {
    const { keyId } = req.params;

    const newApiKey = generateApiKey();

    const apiKey = await ApiKey.findOneAndUpdate(
      { keyId, isActive: true },
      {
        $set: {
          apiKey: newApiKey,
          lastRotated: new Date(),
        },
      },
      { new: true }
    );

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: "Active API key not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "API key rotated successfully",
      data: {
        keyId,
        apiKey: newApiKey, // New API key is shown once
        lastRotated: apiKey.lastRotated,
      },
    });
  } catch (error) {
    console.error("Error rotating API key:", error);
    res.status(500).json({
      success: false,
      message: "Error rotating API key",
      error: error.message,
    });
  }
};

// Get usage statistics for an API key
export const getApiKeyUsage = async (req, res) => {
  try {
    const { keyId } = req.params;
    const { startDate, endDate, groupBy = "day", limit = 100 } = req.query;

    // Verify API key exists
    const apiKey = await ApiKey.findOne({ keyId }).select("-apiKey");
    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: "API key not found",
      });
    }

    // Build date filter
    const dateFilter = { keyId };
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) dateFilter.timestamp.$gte = new Date(startDate);
      if (endDate) dateFilter.timestamp.$lte = new Date(endDate);
    }

    // Get usage logs
    const usageLogs = await UsageLog.find(dateFilter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    // Aggregate statistics
    const stats = await UsageLog.aggregate([
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
          dataExtractionSuccess: {
            $sum: {
              $cond: [{ $eq: ["$responseData.dataExtracted", true] }, 1, 0],
            },
          },
          excelGenerationSuccess: {
            $sum: {
              $cond: [{ $eq: ["$responseData.excelGenerated", true] }, 1, 0],
            },
          },
        },
      },
    ]);

    // Group by time period if requested
    let timeSeriesData = [];
    if (groupBy === "day" || groupBy === "hour") {
      const groupFormat =
        groupBy === "day"
          ? { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }
          : { $dateToString: { format: "%Y-%m-%d %H:00", date: "$timestamp" } };

      timeSeriesData = await UsageLog.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: groupFormat,
            requests: { $sum: 1 },
            successful: {
              $sum: { $cond: [{ $eq: ["$responseData.success", true] }, 1, 0] },
            },
            failed: {
              $sum: {
                $cond: [{ $eq: ["$responseData.success", false] }, 1, 0],
              },
            },
            avgProcessingTime: { $avg: "$responseData.processingTime" },
          },
        },
        { $sort: { _id: 1 } },
      ]);
    }

    res.status(200).json({
      success: true,
      data: {
        apiKeyInfo: {
          keyId: apiKey.keyId,
          name: apiKey.name,
          usage: apiKey.usage,
        },
        statistics: stats[0] || {
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          avgProcessingTime: 0,
          dataExtractionSuccess: 0,
          excelGenerationSuccess: 0,
        },
        timeSeriesData,
        recentLogs: usageLogs.slice(0, 10), // Show last 10 requests
      },
    });
  } catch (error) {
    console.error("Error fetching API key usage:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching API key usage",
      error: error.message,
    });
  }
};

// Delete API key (soft delete by deactivating)
export const deleteApiKey = async (req, res) => {
  try {
    const { keyId } = req.params;
    const { permanent = false } = req.query;

    if (permanent === "true") {
      // Permanent deletion - also delete associated logs
      await UsageLog.deleteMany({ keyId });
      await ApiKey.findOneAndDelete({ keyId });

      res.status(200).json({
        success: true,
        message: "API key permanently deleted",
      });
    } else {
      // Soft delete - just deactivate
      const apiKey = await ApiKey.findOneAndUpdate(
        { keyId },
        { $set: { isActive: false } },
        { new: true }
      ).select("-apiKey");

      if (!apiKey) {
        return res.status(404).json({
          success: false,
          message: "API key not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "API key deactivated successfully",
        data: apiKey,
      });
    }
  } catch (error) {
    console.error("Error deleting API key:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting API key",
      error: error.message,
    });
  }
};
