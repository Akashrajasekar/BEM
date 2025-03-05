// auth_r.controller.js
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import cloudinary from "cloudinary";
import Expense from "../models/expense.model.js"; // Import Expense model
import Department from '../models/departments.model.js';
import moment from "moment";
import crypto from 'crypto';

dotenv.config(); // Load environment variables

// Configure Cloudinary
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY); // Use API key from .env

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'your-secret-key';

const isDuplicateReceipt = async (userId, receiptHash, merchant, amount) => {
    try {
      // Check for receipt with same hash
      if (receiptHash) {
        const existingByHash = await Expense.findOne({ userId, receiptHash });
        if (existingByHash) return true;
      }
      
      // Check for receipt with same merchant, amount, and recent submission date
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1); // Look back one day
      
      const existingByMetadata = await Expense.findOne({
        userId,
        merchant,
        amount,
        createdAt: { $gte: oneDayAgo }
      });
      
      return !!existingByMetadata;
    } catch (error) {
      console.error("Error checking for duplicate receipt:", error);
      return false; // In case of error, proceed with upload
    }
  };

export const authenticateUser = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.split(' ')[1]; // Extract token from headers
        if (!token) {
            return res.status(401).json({ message: 'Access Denied. No token provided.' });
        }

        const decoded = jwt.verify(token, SECRET_KEY); // Verify token
        req.user = { id: decoded.id, organization_id: decoded.organization_id, department_id: decoded.department_id, department: decoded.department }; // Attach user data
        next(); // Proceed to next middleware
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Use the modified comparePassword method
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({
            id: user._id,
            role: user.access,
            email: user.email,
            department_id: user.department_id,
            department: user.department
        }, SECRET_KEY, { expiresIn: '1d' });

        res.status(200).json({
            message: 'Login successful',
            token,
            userId: user._id,
            fullName: user.name,
            access: user.access,
            isPasswordReset: user.isPasswordReset,
            organization_id: user.organization_id,
            department_id: user.department_id,
            department: user.department
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


export const resetPassword = async (req, res) => {
    try {
        const { email, tempPassword, newPassword } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare with temporary password (plain text comparison)
        const isMatch = await user.comparePassword(tempPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid temporary password' });
        }

        // Set new password and mark as reset
        user.password = newPassword;
        user.isPasswordReset = true;
        await user.save(); // This will trigger the pre-save middleware to hash the password

        res.status(200).json({
            message: 'Password reset successful. You can now log in with your new password.'
        });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};



export const extractReceiptText = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        // Ensure user is authenticated
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized access" });
        }

        const userId = req.user.id;
        const organization_id = req.user.organization_id;
        const department_id = req.user.department_id;
        const department = req.user.department;
        const description = req.body.description || '';


        // Generate file hash for duplicate detection
        const receiptHash = crypto
          .createHash('sha256')
          .update(req.file.buffer)
          .digest('hex');

        // Check for duplicate by hash BEFORE uploading to Cloudinary
        const existingByHash = await Expense.findOne({ userId, receiptHash });
        if (existingByHash) {
            return res.status(409).json({
                success: false,
                message: "This receipt appears to be a duplicate. A similar receipt has already been submitted."
            });
        }

        // Fetch department to get available categories
        const departmentData = await Department.findById(department_id);
        if (!departmentData) {
            return res.status(404).json({ success: false, message: "Department not found" });
        }
        const availableCategories = departmentData.categories || ["Others"];
    

        // Generate a unique receipt name based on timestamp
        const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, ""); 
        const receiptName = `receipt_${timestamp}`;

        // Upload image to Cloudinary
        cloudinary.v2.uploader.upload_stream(
            { resource_type: "image", public_id: receiptName, folder: "receipts" },
            async (error, uploadResult) => {
                if (error) {
                    console.error("Cloudinary upload error:", error);
                    return res.status(500).json({ success: false, message: "Error uploading image to Cloudinary" });
                }

                const imageUrl = uploadResult.secure_url; // Get image URL

                // Process image with Gemini AI
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
                const base64Image = req.file.buffer.toString("base64");

                const imageData = {
                    inlineData: {
                        mimeType: req.file.mimetype,
                        data: base64Image,
                    },
                };

                // Create a prompt with category detection
                const categoriesListStr = availableCategories.join(", ");
                const prompt = `Extract the text from the receipt image and provide the data in the following structured format:
                {
                    "vendor_name": "",
                    "invoice_number": "",
                    "date": "",
                    "time": "",
                    "items": [
                        {
                            "name": "",
                            "quantity": "",
                            "price": "",
                            "subtotal": ""
                        }
                    ],
                    "total_amount": "",
                    "currency": "",
                    "suggested_category": ""
                }
                For the "suggested_category" field, analyze the receipt content and suggest the most appropriate category from this list: ${categoriesListStr}. 
                
                Consider the merchant name, items purchased, and any other context clues to determine the category.
                Please ensure all values are in the correct format and maintain the JSON structure. Return only the JSON object without any additional text.`;

                // Call Gemini AI API
                const aiResponse = await model.generateContent([imageData, prompt]); 
                const response = await aiResponse.response;
                const rawText = response.text();

                if (!rawText) {
                    return res.status(500).json({ success: false, message: "No extracted text found in response" });
                }

                // Extract JSON from response
                const extractJsonFromMarkdown = (text) => text.replace(/```json\n|\n```/g, "").trim();

                let extractedData;
                try {
                    extractedData = JSON.parse(extractJsonFromMarkdown(rawText));
                } catch (parseError) {
                    console.error("Error parsing response:", parseError);
                    return res.status(500).json({ success: false, message: "Error parsing extracted text" });
                }

                // Validate required fields
                const requiredFields = ["vendor_name", "invoice_number", "date", "total_amount", "currency"];
                const missingFields = requiredFields.filter(field => !extractedData[field]);

                if (missingFields.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Missing required fields",
                        missingFields
                    });
                }

                // Validate and normalize category
                let category = extractedData.suggested_category || "Others";
                if (!availableCategories.includes(category)) {
                    category = "Others";
                }

                // Convert the extracted date into a valid Date object
                let expenseDate = new Date(extractedData.date);
                expenseDate = moment(extractedData.date, ["YYYY-MM-DD", "DD/MM/YYYY", "MM-DD-YYYY"]).toDate();
                // Check if the date is valid, otherwise handle the error
                if (isNaN(expenseDate.getTime())) {
                    return res.status(400).json({ 
                        success: false, 
                        message: "Invalid date format extracted from receipt",
                        extractedDate: extractedData.date 
                    });
                }
                
                // Check for duplicate receipt before saving
                const isDuplicate = await isDuplicateReceipt(
                    userId, 
                    receiptHash,
                    extractedData.vendor_name,
                    parseFloat(extractedData.total_amount)
                );

                if (isDuplicate) {
                    return res.status(409).json({
                        success: false,
                        message: "This receipt appears to be a duplicate. A similar receipt has already been submitted."
                    });
                }

                // Save the extracted data to MongoDB
                const newExpense = new Expense({
                    organization_id,
                    userId,
                    department_id,
                    department,
                    merchant: extractedData.vendor_name,
                    amount: parseFloat(extractedData.total_amount),
                    currency: extractedData.currency,
                    expenseDate,  // Ensure it's a valid Date object
                    description,
                    receiptUrl: imageUrl,
                    receiptHash,
                    submissionStatus: 'Submitted', // Set status to Submitted when receipt is uploaded
                    approvalStatus: 'Pending',     // Set initial approval status to Pending
                    category: category  // Add the suggested category
                });

                await newExpense.save();

                res.json({
                    success: true,
                    data: newExpense,
                    receiptName
                });
            }
        ).end(req.file.buffer);

    } catch (error) {
        console.error("Error extracting receipt text:", error);
        res.status(500).json({ success: false, message: "Error extracting receipt text", error: error.message });
    }
};

export const saveReceiptAsDraft = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        // Ensure user is authenticated
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized access" });
        }

        const userId = req.user.id;
        const organization_id = req.user.organization_id;
        const department_id = req.user.department_id;
        const department = req.user.department;
        const description = req.body.description || '';

        // Generate file hash for duplicate detection
        const receiptHash = crypto
          .createHash('sha256')
          .update(req.file.buffer)
          .digest('hex');

        // Check for duplicate by hash BEFORE uploading to Cloudinary
        const existingByHash = await Expense.findOne({ userId, receiptHash });
        if (existingByHash) {
            return res.status(409).json({
                success: false,
                message: "This receipt appears to be a duplicate. A similar receipt has already been submitted."
            });
        }

        // Fetch department to get available categories
        const departmentData = await Department.findById(department_id);
        if (!departmentData) {
            return res.status(404).json({ success: false, message: "Department not found" });
        }
        const availableCategories = departmentData.categories || ["Others"];

        // Generate a unique receipt name based on timestamp
        const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, ""); 
        const receiptName = `receipt_${timestamp}`;

        // Upload image to Cloudinary
        cloudinary.v2.uploader.upload_stream(
            { resource_type: "image", public_id: receiptName, folder: "receipts" },
            async (error, uploadResult) => {
                if (error) {
                    console.error("Cloudinary upload error:", error);
                    return res.status(500).json({ success: false, message: "Error uploading image to Cloudinary" });
                }

                const imageUrl = uploadResult.secure_url; // Get image URL

                // Process image with Gemini AI
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
                const base64Image = req.file.buffer.toString("base64");

                const imageData = {
                    inlineData: {
                        mimeType: req.file.mimetype,
                        data: base64Image,
                    },
                };

                // Create a prompt with category detection
                const categoriesListStr = availableCategories.join(", ");
                const prompt = `Extract the text from the receipt image and provide the data in the following structured format:
                {
                    "vendor_name": "",
                    "invoice_number": "",
                    "date": "",
                    "time": "",
                    "items": [
                        {
                            "name": "",
                            "quantity": "",
                            "price": "",
                            "subtotal": ""
                        }
                    ],
                    "total_amount": "",
                    "currency": "",
                    "suggested_category": ""
                }
                For the "suggested_category" field, analyze the receipt content and suggest the most appropriate category from this list: ${categoriesListStr}. 
                
                Consider the merchant name, items purchased, and any other context clues to determine the category.
                Please ensure all values are in the correct format and maintain the JSON structure. Return only the JSON object without any additional text.`;

                // Call Gemini AI API
                const aiResponse = await model.generateContent([imageData, prompt]); 
                const response = await aiResponse.response;
                const rawText = response.text();

                if (!rawText) {
                    return res.status(500).json({ success: false, message: "No extracted text found in response" });
                }

                // Extract JSON from response
                const extractJsonFromMarkdown = (text) => text.replace(/```json\n|\n```/g, "").trim();

                let extractedData;
                try {
                    extractedData = JSON.parse(extractJsonFromMarkdown(rawText));
                } catch (parseError) {
                    console.error("Error parsing response:", parseError);
                    return res.status(500).json({ success: false, message: "Error parsing extracted text" });
                }

                // Validate required fields
                const requiredFields = ["vendor_name", "invoice_number", "date", "total_amount", "currency"];
                const missingFields = requiredFields.filter(field => !extractedData[field]);

                if (missingFields.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Missing required fields",
                        missingFields
                    });
                }

                // Validate and normalize category
                let category = extractedData.suggested_category || "Others";
                if (!availableCategories.includes(category)) {
                    category = "Others";
                }

                // Convert the extracted date into a valid Date object
                let expenseDate = new Date(extractedData.date);
                expenseDate = moment(extractedData.date, ["YYYY-MM-DD", "DD/MM/YYYY", "MM-DD-YYYY"]).toDate();
                // Check if the date is valid, otherwise handle the error
                if (isNaN(expenseDate.getTime())) {
                    return res.status(400).json({ 
                        success: false, 
                        message: "Invalid date format extracted from receipt",
                        extractedDate: extractedData.date 
                    });
                }
                
                // Check for duplicate receipt before saving
                const isDuplicate = await isDuplicateReceipt(
                    userId, 
                    receiptHash,
                    extractedData.vendor_name,
                    parseFloat(extractedData.total_amount)
                );

                if (isDuplicate) {
                    return res.status(409).json({
                        success: false,
                        message: "This receipt appears to be a duplicate. A similar receipt has already been submitted."
                    });
                }

                // Save the extracted data to MongoDB
                const newExpense = new Expense({
                    organization_id,
                    userId,
                    department_id,
                    department,
                    merchant: extractedData.vendor_name,
                    amount: parseFloat(extractedData.total_amount),
                    currency: extractedData.currency,
                    expenseDate,  // Ensure it's a valid Date object
                    description,
                    receiptUrl: imageUrl,
                    receiptHash, 
                    submissionStatus: 'Draft', // Set status to Submitted when receipt is uploaded
                    approvalStatus: 'Pending',     // Set initial approval status to Pending
                    category: category  // Add the suggested category
                });

                await newExpense.save();

                res.json({
                    success: true,
                    data: newExpense,
                    receiptName
                });
            }
        ).end(req.file.buffer);

    } catch (error) {
        console.error("Error extracting receipt text:", error);
        res.status(500).json({ success: false, message: "Error extracting receipt text", error: error.message });
    }
};

export const getExpenses = async (req, res) => {
    try {
        const userId = req.user.id;
        const expenses = await Expense.find({ userId });
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching expenses', error: error.message });
    }
};

export const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Find the expense and verify it belongs to the user
        const expense = await Expense.findOne({ _id: id, userId });
        
        if (!expense) {
            return res.status(404).json({ 
                success: false, 
                message: 'Expense not found or unauthorized' 
            });
        }

        // Only allow deletion of draft expenses
        if (expense.submissionStatus !== 'Draft') {
            return res.status(400).json({ 
                success: false, 
                message: 'Only draft expenses can be deleted' 
            });
        }

        // Delete the image from Cloudinary if receiptUrl exists
        if (expense.receiptUrl) {
            try {
                // Extract public_id from URL
                // Cloudinary URLs typically look like:
                // https://res.cloudinary.com/cloud_name/image/upload/v1234/receipts/receipt_name
                const urlParts = expense.receiptUrl.split('/');
                const fileName = urlParts[urlParts.length - 1]; // Get the filename
                const folderName = urlParts[urlParts.length - 2]; // Get the folder name
                const public_id = `${folderName}/${fileName.split('.')[0]}`; // Combine to get public_id
                
                // Delete the image
                await cloudinary.v2.uploader.destroy(public_id);
                console.log(`Successfully deleted image with public_id: ${public_id}`);
            } catch (cloudinaryError) {
                console.error('Error deleting image from Cloudinary:', cloudinaryError);
                // Continue with expense deletion even if image deletion fails
            }
        }

        // Delete the expense
        await Expense.findByIdAndDelete(id);

        res.status(200).json({ 
            success: true, 
            message: 'Expense deleted successfully' 
        });

    } catch (error) {
        console.error('Delete expense error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting expense', 
            error: error.message 
        });
    }
};

export const updateDraftExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const { merchant, amount, expenseDate, category } = req.body;
        const userId = req.user.id;

        // Find the expense and verify it belongs to the user
        const expense = await Expense.findOne({ _id: id, userId });
        
        if (!expense) {
            return res.status(404).json({ 
                success: false, 
                message: 'Expense not found or unauthorized' 
            });
        }

        // Verify it's a draft
        if (expense.submissionStatus !== 'Draft') {
            return res.status(400).json({ 
                success: false, 
                message: 'Only draft expenses can be edited' 
            });
        }

        // Update the expense
        const updatedExpense = await Expense.findByIdAndUpdate(
            id,
            {
                merchant,
                amount,
                category,
                expenseDate: new Date(expenseDate)
            },
            { new: true } // Return the updated document
        );

        res.status(200).json({
            success: true,
            data: updatedExpense
        });

    } catch (error) {
        console.error('Update expense error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error updating expense', 
            error: error.message 
        });
    }
};

export const submitDraftExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Find the expense and verify it belongs to the user
        const expense = await Expense.findOne({ _id: id, userId });
        
        if (!expense) {
            return res.status(404).json({ 
                success: false, 
                message: 'Expense not found or unauthorized' 
            });
        }

        // Verify it's a draft
        if (expense.submissionStatus !== 'Draft') {
            return res.status(400).json({ 
                success: false, 
                message: 'Only draft expenses can be submitted' 
            });
        }

        // Update the submission status
        const updatedExpense = await Expense.findByIdAndUpdate(
            id,
            {
                submissionStatus: 'Submitted',
                approvalStatus: 'Pending'
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            data: updatedExpense
        });

    } catch (error) {
        console.error('Submit expense error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error submitting expense', 
            error: error.message 
        });
    }
};

export const createManualExpense = async (req, res) => {
    try {
        // Ensure user is authenticated
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized access" });
        }

        const userId = req.user.id;
        const organization_id = req.user.organization_id;
        const department_id = req.user.department_id;
        const department = req.user.department;

        // Extract required fields from request body
        const {
            merchant,
            amount,
            currency,
            category,
            expenseDate,
            description,
            submissionStatus = 'Draft' // Default to Draft if not specified
        } = req.body;

        // Validate required fields
        if (!merchant || !amount || !currency || !expenseDate) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
                requiredFields: ['merchant', 'amount', 'currency', 'expenseDate']
            });
        }

        // Validate currency
        if (!['INR', 'AED', 'USD'].includes(currency)) {
            return res.status(400).json({
                success: false,
                message: "Invalid currency. Must be one of: INR, AED, USD"
            });
        }

        // Check for duplicate expense
        const isDuplicate = await isDuplicateReceipt(
            userId,
            null, // No receipt hash for manual expenses
            merchant,
            parseFloat(amount)
        );

        if (isDuplicate) {
            return res.status(409).json({
                success: false,
                message: "This expense appears to be a duplicate. A similar expense has already been submitted."
            });
        }

        // Create new expense
        const newExpense = new Expense({
            organization_id,
            userId,
            department,
            description,
            department_id,
            merchant,
            amount: parseFloat(amount),
            currency,
            category,
            expenseDate: new Date(expenseDate),
            submissionStatus,
            approvalStatus: 'Pending'
        });

        await newExpense.save();

        res.status(201).json({
            success: true,
            data: newExpense
        });

    } catch (error) {
        console.error("Error creating manual expense:", error);
        res.status(500).json({
            success: false,
            message: "Error creating manual expense",
            error: error.message
        });
    }
};


export const getDepartmentById = async (req, res) => {
    try {
        const { departmentId } = req.params;
        
        // Find department by ID
        const department = await Department.findById(departmentId);
        
        // Check if department exists
        if (!department) {
            return res.status(404).json({ 
                success: false, 
                message: 'Department not found' 
            });
        }
        
        // Return the department data (which includes categories)
        res.status(200).json({
            success: true,
            _id: department._id,
            name: department.name,
            categories: department.categories || ['Others'],
            createdAt: department.createdAt,
            updatedAt: department.updatedAt
        });
        
    } catch (error) {
        console.error('Error fetching department:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching department data', 
            error: error.message 
        });
    }
};