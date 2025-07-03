import ApiKey from "../models/apiKey.model.js";
import UsageLog from "../models/usageLog.model.js";
import moment from "moment";

// Rate limiting storage (in production, use Redis)
const rateLimitStore = new Map();

// Enhanced API key validation middleware
export const enhancedValidateApiKey = async (req, res, next) => {
  const startTime = Date.now();
  let apiKeyDoc = null;
  let validationError = null;

  try {
    const apiKey =
      req.header("X-API-Key") || req.body.apiKey || req.query.apiKey;

    if (!apiKey) {
      validationError =
        "API key is required. Provide it in X-API-Key header, body, or query parameter.";
      return res.status(401).json({
        success: false,
        message: validationError,
      });
    }

    // Find API key in database
    apiKeyDoc = await ApiKey.findOne({ apiKey, isActive: true });

    if (!apiKeyDoc) {
      validationError = "Invalid or inactive API key.";
      return res.status(401).json({
        success: false,
        message: validationError,
      });
    }

    // Check if API key has expired
    if (apiKeyDoc.expiresAt && new Date() > apiKeyDoc.expiresAt) {
      validationError = "API key has expired.";
      await ApiKey.findByIdAndUpdate(apiKeyDoc._id, { isActive: false });
      return res.status(401).json({
        success: false,
        message: validationError,
      });
    }

    // Check IP whitelist
    const clientIP =
      req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    if (
      apiKeyDoc.ipWhitelist.length > 0 &&
      !apiKeyDoc.ipWhitelist.includes(clientIP)
    ) {
      validationError = "Access denied: IP address not whitelisted.";
      return res.status(403).json({
        success: false,
        message: validationError,
      });
    }

    // Check permissions for specific endpoints
    const endpoint = req.path;
    const method = req.method.toLowerCase();

    if (!hasPermission(apiKeyDoc.permissions, endpoint, method)) {
      validationError = "Insufficient permissions for this endpoint.";
      return res.status(403).json({
        success: false,
        message: validationError,
      });
    }

    // Rate limiting check
    const rateLimitResult = await checkRateLimit(apiKeyDoc);
    if (!rateLimitResult.allowed) {
      validationError = `Rate limit exceeded: ${rateLimitResult.message}`;
      return res.status(429).json({
        success: false,
        message: validationError,
        retryAfter: rateLimitResult.retryAfter,
      });
    }

    // Add API key info to request
    req.apiKey = apiKey;
    req.apiKeyDoc = apiKeyDoc;
    req.validationStartTime = startTime;

    next();
  } catch (error) {
    validationError = "API key validation failed.";
    console.error("API key validation error:", error);
    res.status(401).json({
      success: false,
      message: validationError,
      error: error.message,
    });
  } finally {
    // Log the validation attempt (success or failure)
    if (apiKeyDoc || validationError) {
      try {
        await logApiUsage(req, res, {
          apiKeyDoc,
          validationError,
          processingTime: Date.now() - startTime,
          stage: "validation",
        });
      } catch (logError) {
        console.error("Error logging API usage:", logError);
      }
    }
  }
};

// Check if API key has required permissions
const hasPermission = (permissions, endpoint, method) => {
  // If has 'invoice:all' permission, allow everything
  if (permissions.includes("invoice:all")) {
    return true;
  }

  // Check specific permissions based on endpoint and method
  if (endpoint.includes("/extract-invoice") && method === "post") {
    return permissions.includes("invoice:extract");
  }

  if (endpoint.includes("/invoices") && method === "get") {
    return permissions.includes("invoice:read");
  }

  if (endpoint.includes("/invoices") && method === "delete") {
    return permissions.includes("invoice:delete");
  }

  // Default deny for unknown endpoints
  return false;
};

// Rate limiting logic
const checkRateLimit = async (apiKeyDoc) => {
  const now = moment();
  const keyId = apiKeyDoc.keyId;

  // Get or create rate limit data for this API key
  if (!rateLimitStore.has(keyId)) {
    rateLimitStore.set(keyId, {
      minute: { count: 0, resetTime: now.clone().add(1, "minute") },
      hour: { count: 0, resetTime: now.clone().add(1, "hour") },
      day: { count: 0, resetTime: now.clone().add(1, "day") },
    });
  }

  const limits = rateLimitStore.get(keyId);

  // Reset counters if time has passed
  if (now.isAfter(limits.minute.resetTime)) {
    limits.minute = { count: 0, resetTime: now.clone().add(1, "minute") };
  }
  if (now.isAfter(limits.hour.resetTime)) {
    limits.hour = { count: 0, resetTime: now.clone().add(1, "hour") };
  }
  if (now.isAfter(limits.day.resetTime)) {
    limits.day = { count: 0, resetTime: now.clone().add(1, "day") };
  }

  // Check limits
  const rateLimits = apiKeyDoc.rateLimit;

  if (limits.minute.count >= rateLimits.requestsPerMinute) {
    return {
      allowed: false,
      message: "Too many requests per minute",
      retryAfter: limits.minute.resetTime.unix(),
    };
  }

  if (limits.hour.count >= rateLimits.requestsPerHour) {
    return {
      allowed: false,
      message: "Too many requests per hour",
      retryAfter: limits.hour.resetTime.unix(),
    };
  }

  if (limits.day.count >= rateLimits.requestsPerDay) {
    return {
      allowed: false,
      message: "Too many requests per day",
      retryAfter: limits.day.resetTime.unix(),
    };
  }

  // Increment counters
  limits.minute.count++;
  limits.hour.count++;
  limits.day.count++;

  rateLimitStore.set(keyId, limits);

  return { allowed: true };
};

// Middleware to log API usage after request completion
export const logApiUsage = async (req, res, options = {}) => {
  try {
    const {
      apiKeyDoc = req.apiKeyDoc,
      validationError = null,
      processingTime = Date.now() - (req.validationStartTime || Date.now()),
      stage = "complete",
    } = options;

    if (!apiKeyDoc && !validationError) {
      return; // Nothing to log
    }

    const logData = {
      apiKey: req.apiKey || "unknown",
      keyId: apiKeyDoc?.keyId || "unknown",
      userId: apiKeyDoc?.userId || "unknown",
      endpoint: req.path,
      method: req.method,
      requestData: {
        headers: {
          "user-agent": req.get("User-Agent"),
          "content-type": req.get("Content-Type"),
          "x-forwarded-for": req.get("X-Forwarded-For"),
        },
        query: req.query,
        body: sanitizeRequestBody(req.body),
        fileInfo: req.file
          ? {
              originalName: req.file.originalname,
              mimeType: req.file.mimetype,
              size: req.file.size,
            }
          : null,
      },
      responseData: {
        statusCode: res.statusCode,
        success:
          !validationError && res.statusCode >= 200 && res.statusCode < 300,
        message: validationError || "Request processed",
        processingTime,
        dataExtracted: false,
        excelGenerated: false,
      },
      ipAddress:
        req.ip || req.connection.remoteAddress || req.socket.remoteAddress,
      userAgent: req.get("User-Agent"),
      timestamp: new Date(),
    };

    // Add error details if validation failed
    if (validationError) {
      logData.error = {
        message: validationError,
        code: "VALIDATION_ERROR",
      };
    }

    // Determine success status for invoice extraction
    if (req.path.includes("/extract-invoice") && !validationError) {
      logData.responseData.dataExtracted = res.statusCode === 200;
      logData.responseData.excelGenerated = res.statusCode === 200;
    }

    // Save usage log
    const usageLog = new UsageLog(logData);
    await usageLog.save();

    // Update API key usage statistics (only for successful validations)
    if (apiKeyDoc && !validationError) {
      const today = moment().startOf("day").toDate();
      const updateData = {
        $inc: {
          "usage.totalRequests": 1,
          "usage.successfulRequests": logData.responseData.success ? 1 : 0,
          "usage.failedRequests": logData.responseData.success ? 0 : 1,
        },
        $set: { "usage.lastUsed": new Date() },
      };

      // Update daily usage
      const dailyUsageUpdate = {
        $inc: {
          "usage.dailyUsage.$.requests": 1,
          "usage.dailyUsage.$.successful": logData.responseData.success ? 1 : 0,
          "usage.dailyUsage.$.failed": logData.responseData.success ? 0 : 1,
        },
      };

      try {
        // Try to update existing daily record
        const result = await ApiKey.updateOne(
          {
            _id: apiKeyDoc._id,
            "usage.dailyUsage.date": today,
          },
          dailyUsageUpdate
        );

        if (result.matchedCount === 0) {
          // No existing daily record, add new one
          await ApiKey.updateOne(
            { _id: apiKeyDoc._id },
            {
              ...updateData,
              $push: {
                "usage.dailyUsage": {
                  date: today,
                  requests: 1,
                  successful: logData.responseData.success ? 1 : 0,
                  failed: logData.responseData.success ? 0 : 1,
                },
              },
            }
          );
        } else {
          // Update existing daily record and totals
          await ApiKey.updateOne({ _id: apiKeyDoc._id }, updateData);
        }
      } catch (updateError) {
        console.error("Error updating API key usage stats:", updateError);
      }
    }
  } catch (error) {
    console.error("Error logging API usage:", error);
  }
};

// Sanitize request body to remove sensitive data
const sanitizeRequestBody = (body) => {
  if (!body) return null;

  const sanitized = { ...body };

  // Remove sensitive fields
  delete sanitized.apiKey;
  delete sanitized.password;
  delete sanitized.token;

  return sanitized;
};

// Middleware to track response after request completion
export const trackResponseMiddleware = (req, res, next) => {
  // Store original res.json and res.send methods
  const originalJson = res.json;
  const originalSend = res.send;

  // Override res.json to capture response data
  res.json = function (data) {
    // Log the completed request
    setImmediate(async () => {
      try {
        const processingTime =
          Date.now() - (req.validationStartTime || Date.now());

        await logApiUsage(req, res, {
          processingTime,
          stage: "complete",
        });
      } catch (error) {
        console.error("Error in response tracking:", error);
      }
    });

    return originalJson.call(this, data);
  };

  // Override res.send for non-JSON responses
  res.send = function (data) {
    setImmediate(async () => {
      try {
        const processingTime =
          Date.now() - (req.validationStartTime || Date.now());

        await logApiUsage(req, res, {
          processingTime,
          stage: "complete",
        });
      } catch (error) {
        console.error("Error in response tracking:", error);
      }
    });

    return originalSend.call(this, data);
  };

  next();
};
