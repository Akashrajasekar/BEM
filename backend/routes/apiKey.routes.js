import express from "express";
import {
  createApiKey,
  getUserApiKeys,
  getApiKeyDetails,
  updateApiKey,
  deactivateApiKey,
  rotateApiKey,
  getApiKeyUsage,
  deleteApiKey,
} from "../controller/apiKey.controller.js";

const router = express.Router();

// Basic authentication middleware for API key management endpoints
// You should implement proper authentication here (JWT, session, etc.)
const authenticateAdmin = (req, res, next) => {
  // Simple implementation - replace with your authentication logic
  const authToken = req.header("Authorization")?.replace("Bearer ", "");

  if (!authToken) {
    return res.status(401).json({
      success: false,
      message: "Authentication required for API key management",
    });
  }

  // Add your authentication logic here
  // For demo purposes, we'll accept any token that starts with 'admin_'
  if (!authToken.startsWith("admin_")) {
    return res.status(401).json({
      success: false,
      message: "Invalid authentication token",
    });
  }

  req.adminUser = { id: "admin", role: "admin" }; // Mock admin user
  next();
};

// Create new API key
router.post("/api-keys", authenticateAdmin, createApiKey);

// Get all API keys for a user
router.get("/users/:userId/api-keys", authenticateAdmin, getUserApiKeys);

// Get specific API key details
router.get("/api-keys/:keyId", authenticateAdmin, getApiKeyDetails);

// Update API key
router.put("/api-keys/:keyId", authenticateAdmin, updateApiKey);

// Deactivate API key
router.patch(
  "/api-keys/:keyId/deactivate",
  authenticateAdmin,
  deactivateApiKey
);

// Rotate API key (generate new key)
router.post("/api-keys/:keyId/rotate", authenticateAdmin, rotateApiKey);

// Get API key usage statistics and logs
router.get("/api-keys/:keyId/usage", authenticateAdmin, getApiKeyUsage);

// Delete API key
router.delete("/api-keys/:keyId", authenticateAdmin, deleteApiKey);

// Health check for API key management
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API Key Management service is running",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
router.use((error, req, res, next) => {
  console.error("API Key Management Error:", error);
  res.status(500).json({
    success: false,
    message: "An error occurred in API key management",
    error: error.message,
  });
});

export default router;
