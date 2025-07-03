import express from "express";
import {
  extractInvoiceData,
  getInvoices,
  getInvoiceById,
  deleteInvoice,
} from "../controller/invoice.controller.js";
import {
  enhancedValidateApiKey,
  trackResponseMiddleware,
} from "../middleware/enhancedValidation.middleware.js";
import multer from "multer";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and PDFs
    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "application/pdf",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid file type. Only images and PDFs are allowed."),
        false
      );
    }
  },
});

// Apply enhanced API key validation and response tracking to all routes
router.use(enhancedValidateApiKey);
router.use(trackResponseMiddleware);

// Route to extract invoice data from uploaded document
router.post("/extract-invoice", upload.single("document"), extractInvoiceData);

// Route to get all invoices for the API key
router.get("/invoices", getInvoices);

// Route to get specific invoice by ID
router.get("/invoices/:id", getInvoiceById);

// Route to delete invoice
router.delete("/invoices/:id", deleteInvoice);

// Health check route
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Invoice API is running",
    timestamp: new Date().toISOString(),
    apiKey: req.apiKeyDoc
      ? {
          keyId: req.apiKeyDoc.keyId,
          name: req.apiKeyDoc.name,
          userId: req.apiKeyDoc.userId,
        }
      : null,
  });
});

// API key info route (for clients to verify their API key)
router.get("/api-key-info", (req, res) => {
  if (!req.apiKeyDoc) {
    return res.status(401).json({
      success: false,
      message: "API key validation failed",
    });
  }

  res.json({
    success: true,
    data: {
      keyId: req.apiKeyDoc.keyId,
      name: req.apiKeyDoc.name,
      userId: req.apiKeyDoc.userId,
      permissions: req.apiKeyDoc.permissions,
      rateLimit: req.apiKeyDoc.rateLimit,
      usage: {
        totalRequests: req.apiKeyDoc.usage.totalRequests,
        successfulRequests: req.apiKeyDoc.usage.successfulRequests,
        failedRequests: req.apiKeyDoc.usage.failedRequests,
        lastUsed: req.apiKeyDoc.usage.lastUsed,
      },
      isActive: req.apiKeyDoc.isActive,
      expiresAt: req.apiKeyDoc.expiresAt,
      createdAt: req.apiKeyDoc.createdAt,
    },
  });
});

// Error handling middleware
router.use((error, req, res, next) => {
  console.error("Invoice API Error:", error);

  // Log error for analytics
  if (req.apiKeyDoc) {
    setImmediate(async () => {
      try {
        const { logApiUsage } = await import(
          "../middleware/enhancedValidation.middleware.js"
        );

        await logApiUsage(req, res, {
          validationError: error.message,
          processingTime: Date.now() - (req.validationStartTime || Date.now()),
          stage: "error",
        });
      } catch (logError) {
        console.error("Error logging API usage in error handler:", logError);
      }
    });
  }

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size allowed is 10MB.",
      });
    }
  }

  if (
    error.message === "Invalid file type. Only images and PDFs are allowed."
  ) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  res.status(500).json({
    success: false,
    message: "An error occurred while processing your request.",
    error: error.message,
  });
});

export default router;
