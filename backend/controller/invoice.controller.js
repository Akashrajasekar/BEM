import Invoice from '../models/invoice.model.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import cloudinary from "cloudinary";
import crypto from 'crypto';
import XLSX from 'xlsx';
import moment from "moment";

dotenv.config();

// Configure Cloudinary
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Middleware to validate API key
export const validateApiKey = async (req, res, next) => {
    try {
        const apiKey = req.header('X-API-Key') || req.body.apiKey || req.query.apiKey;
        
        if (!apiKey) {
            return res.status(401).json({ 
                success: false, 
                message: 'API key is required. Provide it in X-API-Key header, body, or query parameter.' 
            });
        }

        // Add your API key validation logic here
        // For now, we'll just check if it's not empty and has minimum length
        if (apiKey.length < 10) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid API key format.' 
            });
        }

        req.apiKey = apiKey;
        next();
    } catch (error) {
        res.status(401).json({ 
            success: false, 
            message: 'API key validation failed.' 
        });
    }
};

// Function to create Excel file from invoice data
// const createExcelFile = async (invoiceData) => {
//     try {
//         // Create a new workbook
//         const workbook = XLSX.utils.book_new();
        
//         // Invoice Summary Sheet
//         const summaryData = [
//             ['Invoice Information'],
//             ['Vendor Name', invoiceData.vendorName || ''],
//             ['Invoice Number', invoiceData.invoiceNumber || ''],
//             ['Invoice Date', invoiceData.invoiceDate || ''],
//             ['PO Number', invoiceData.poNumber || ''],
//             ['Vehicle Number', invoiceData.vehicleNo || ''],
//             ['Sub Total', invoiceData.subTotal || 0],
//             ['CGST Amount', invoiceData.cgstAmount || 0],
//             ['SGST Amount', invoiceData.sgstAmount || 0],
//             ['Total Amount', invoiceData.totalAmount || 0],
//             ['Payment Terms', invoiceData.paymentTerms || ''],
//             [''],
//             ['Bank Details'],
//             ['Bank Name', invoiceData.bankDetails?.bankName || ''],
//             ['Account Number', invoiceData.bankDetails?.accountNumber || ''],
//             ['IFSC Code', invoiceData.bankDetails?.ifscCode || ''],
//             ['Branch', invoiceData.bankDetails?.branch || '']
//         ];
        
//         const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
//         XLSX.utils.book_append_sheet(workbook, summarySheet, 'Invoice Summary');
        
//         // Items Details Sheet
//         const itemsData = [
//             ['Sr No', 'Item Description', 'Quantity', 'Price Per Unit', 'Amount', 'HSN/SAC', 'GST Rate %', 'DC No']
//         ];
        
//         if (invoiceData.items && invoiceData.items.length > 0) {
//             invoiceData.items.forEach((item, index) => {
//                 itemsData.push([
//                     index + 1,
//                     item.itemDescription || '',
//                     item.quantity || 0,
//                     item.pricePerUnit || 0,
//                     item.amount || 0,
//                     item.hsnSac || '',
//                     item.gstRate || 0,
//                     item.dcNo || ''
//                 ]);
//             });
//         }
        
//         const itemsSheet = XLSX.utils.aoa_to_sheet(itemsData);
//         XLSX.utils.book_append_sheet(workbook, itemsSheet, 'Items Details');
        
//         // Convert workbook to buffer
//         const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
//         return excelBuffer;
//     } catch (error) {
//         console.error('Error creating Excel file:', error);
//         throw error;
//     }
// };

// Function to parse billing/delivery address into components
const parseAddress = (addressString) => {
    if (!addressString) return { name: '', address: '', state: '', stateCode: '', gstin: '' };
    
    // Try to extract company name (usually first line)
    const lines = addressString.split(',').map(line => line.trim());
    const name = lines[0] || '';
    const address = lines.slice(1).join(', ') || '';
    
    // Extract state and state code if available
    let state = '';
    let stateCode = '';
    let gstin = '';
    
    // Look for state information in the address
    const stateMatch = address.match(/([A-Za-z\s]+)\s*-?\s*(\d{6})/);
    if (stateMatch) {
        state = stateMatch[1].trim();
    }
    
    // Look for GSTIN pattern
    const gstinMatch = addressString.match(/\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/);
    if (gstinMatch) {
        gstin = gstinMatch[0];
        stateCode = gstin.substring(0, 2);
    }
    
    return { name, address, state, stateCode, gstin };
};

// Function to create Excel file in Shree Sai Powder format
const createExcelFile = async (invoiceData) => {
    try {
        // Create a new workbook
        const workbook = XLSX.utils.book_new();
        
        // Create worksheet data array (we'll build it row by row)
        const worksheetData = [];
        const maxCols = 38; // AL column = 38th column
        
        // Helper function to create empty row
        const createEmptyRow = () => new Array(maxCols).fill('');
        
        // ROW 1: Section Headers
        const row1 = createEmptyRow();
        row1[0] = 'supplierDetails';    // A1
        row1[5] = 'invoiceDetails';     // F1
        row1[10] = 'billingDetails';    // K1
        row1[15] = 'deliveryDetails';   // P1
        row1[20] = 'lineItems';         // U1
        row1[29] = 'totals';            // AD1
        row1[34] = 'bankDetails';       // AI1
        worksheetData.push(row1);
        
        // ROW 2: Field Headers
        const row2 = createEmptyRow();
        // Supplier section (A-E)
        row2[0] = 'name';
        row2[1] = 'address';
        row2[2] = 'gstin';
        row2[3] = 'phone';
        row2[4] = 'email';
        
        // Invoice section (F-J)
        row2[5] = 'invoiceNo';
        row2[6] = 'invoiceDate';
        row2[7] = 'vehicleNo';
        row2[8] = 'custDcNo';
        row2[9] = 'dcDate';
        
        // Billing section (K-O)
        row2[10] = 'name';
        row2[11] = 'address';
        row2[12] = 'state';
        row2[13] = 'stateCode';
        row2[14] = 'gstin';
        
        // Delivery section (P-T)
        row2[15] = 'name';
        row2[16] = 'address';
        row2[17] = 'state';
        row2[18] = 'stateCode';
        row2[19] = 'gstin';
        
        // Line items headers (U-AC)
        row2[20] = 'srNo';
        row2[21] = 'itemDescription';
        row2[22] = 'ourDCNo';
        row2[23] = 'hsnSac';
        row2[24] = 'gstPercent';
        row2[25] = 'qty';
        row2[26] = 'uom';
        row2[27] = 'pricePerUnit';
        row2[28] = 'amount';
        
        // Totals section (AD-AH)
        row2[29] = 'subTotal';
        row2[30] = 'cgst';
        row2[31] = 'sgst';
        row2[32] = 'roundOff';
        row2[33] = 'invoiceAmount';
        
        // Bank details (AI-AL)
        row2[34] = 'bankName';
        row2[35] = 'accountNo';
        row2[36] = 'ifsc';
        row2[37] = 'branch';
        
        worksheetData.push(row2);
        
        // Parse billing and delivery addresses
        const billingParts = parseAddress(invoiceData.billingAddress);
        const deliveryParts = parseAddress(invoiceData.deliveryAddress);
        
        // ROW 3: Main data row with first item
        const row3 = createEmptyRow();
        
        // Supplier data (A-E)
        row3[0] = invoiceData.vendorName || '';
        row3[1] = invoiceData.vendorAddress || '';
        row3[2] = invoiceData.vendorGstin || '';
        row3[3] = invoiceData.vendorPhone ? String(invoiceData.vendorPhone).replace(/\D/g, '') : '';
        row3[4] = invoiceData.vendorEmail || '';
        
        // Invoice data (F-J)
        row3[5] = invoiceData.invoiceNumber || '';
        row3[6] = invoiceData.invoiceDate ? new Date(invoiceData.invoiceDate) : '';
        row3[7] = invoiceData.vehicleNo || '';
        row3[8] = invoiceData.custDcNo || '';
        row3[9] = invoiceData.dcDate ? new Date(invoiceData.dcDate) : '';
        
        // Billing data (K-O)
        row3[10] = billingParts.name || invoiceData.vendorName || '';
        row3[11] = billingParts.address || invoiceData.billingAddress || '';
        row3[12] = billingParts.state || 'Karnataka';
        row3[13] = billingParts.stateCode || '29';
        row3[14] = billingParts.gstin || invoiceData.vendorGstin || '';
        
        // Delivery data (P-T)
        row3[15] = deliveryParts.name || billingParts.name || invoiceData.vendorName || '';
        row3[16] = deliveryParts.address || invoiceData.deliveryAddress || billingParts.address || '';
        row3[17] = deliveryParts.state || billingParts.state || 'Karnataka';
        row3[18] = deliveryParts.stateCode || billingParts.stateCode || '29';
        row3[19] = deliveryParts.gstin || billingParts.gstin || invoiceData.vendorGstin || '';
        
        // First line item (U-AC)
        if (invoiceData.items && invoiceData.items.length > 0) {
            const firstItem = invoiceData.items[0];
            row3[20] = 1; // Sr No
            row3[21] = firstItem.itemDescription || '';
            row3[22] = firstItem.dcNo || invoiceData.custDcNo || '';
            row3[23] = firstItem.hsnSac || '';
            row3[24] = firstItem.gstRate || 12; // Default GST rate
            row3[25] = firstItem.quantity || 0;
            row3[26] = 'nos'; // Default UOM
            row3[27] = firstItem.pricePerUnit || 0;
            row3[28] = firstItem.amount || 0;
        }
        
        // Totals (AD-AH) - only in first row
        row3[29] = invoiceData.subTotal || 0;
        row3[30] = invoiceData.cgstAmount || 0;
        row3[31] = invoiceData.sgstAmount || 0;
        row3[32] = 0.07; // Default round off
        row3[33] = invoiceData.totalAmount || 0;
        
        // Bank details (AI-AL)
        const bankDetails = invoiceData.bankDetails || {};
        row3[34] = bankDetails.bankName || '';
        row3[35] = bankDetails.accountNumber || '';
        row3[36] = bankDetails.ifscCode || '';
        row3[37] = bankDetails.branch || '';
        
        worksheetData.push(row3);
        
        // ROW 4: Additional phone number (like in original)
        if (invoiceData.vendorPhone) {
            const row4 = createEmptyRow();
            // Add alternate phone number if available (extract from vendor data)
            const phones = String(invoiceData.vendorPhone).match(/\d{10,}/g) || [];
            if (phones.length > 1) {
                row4[3] = phones[1]; // Second phone number in column D
            }
            
            // Add second item if exists
            if (invoiceData.items && invoiceData.items.length > 1) {
                const item = invoiceData.items[1];
                row4[20] = 2; // Sr No
                row4[21] = item.itemDescription || '';
                row4[22] = item.dcNo || invoiceData.custDcNo || '';
                row4[23] = item.hsnSac || '';
                row4[24] = item.gstRate || 12;
                row4[25] = item.quantity || 0;
                row4[26] = 'nos';
                row4[27] = item.pricePerUnit || 0;
                row4[28] = item.amount || 0;
            }
            
            worksheetData.push(row4);
        }
        
        // Additional item rows (starting from row 5)
        const startIndex = invoiceData.vendorPhone ? 2 : 1; // Skip first item(s) already added
        if (invoiceData.items && invoiceData.items.length > startIndex) {
            for (let i = startIndex; i < invoiceData.items.length; i++) {
                const itemRow = createEmptyRow();
                const item = invoiceData.items[i];
                
                // Item data (U-AC)
                itemRow[20] = i + 1; // Sr No
                itemRow[21] = item.itemDescription || '';
                itemRow[22] = item.dcNo || invoiceData.custDcNo || '';
                itemRow[23] = item.hsnSac || '';
                itemRow[24] = item.gstRate || 12;
                itemRow[25] = item.quantity || 0;
                itemRow[26] = 'nos';
                itemRow[27] = item.pricePerUnit || 0;
                itemRow[28] = item.amount || 0;
                
                worksheetData.push(itemRow);
            }
        }
        
        // Create worksheet from data
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        
        // Set column widths to match original format
        const columnWidths = [
            { wch: 30 },  // A: Supplier name
            { wch: 60 },  // B: Address
            { wch: 18 },  // C: GSTIN
            { wch: 15 },  // D: Phone
            { wch: 35 },  // E: Email
            { wch: 15 },  // F: Invoice No
            { wch: 15 },  // G: Date
            { wch: 15 },  // H: Vehicle
            { wch: 15 },  // I: DC No
            { wch: 15 },  // J: DC Date
            { wch: 35 },  // K: Billing name
            { wch: 60 },  // L: Billing address
            { wch: 15 },  // M: State
            { wch: 10 },  // N: State code
            { wch: 18 },  // O: GSTIN
            { wch: 35 },  // P: Delivery name
            { wch: 60 },  // Q: Delivery address
            { wch: 15 },  // R: State
            { wch: 10 },  // S: State code
            { wch: 18 },  // T: GSTIN
            { wch: 8 },   // U: Sr No
            { wch: 40 },  // V: Item Description
            { wch: 15 },  // W: DC No
            { wch: 10 },  // X: HSN/SAC
            { wch: 10 },  // Y: GST %
            { wch: 8 },   // Z: Qty
            { wch: 8 },   // AA: UOM
            { wch: 12 },  // AB: Price
            { wch: 12 },  // AC: Amount
            { wch: 15 },  // AD: Sub Total
            { wch: 12 },  // AE: CGST
            { wch: 12 },  // AF: SGST
            { wch: 10 },  // AG: Round Off
            { wch: 15 },  // AH: Invoice Amount
            { wch: 25 },  // AI: Bank Name
            { wch: 20 },  // AJ: Account No
            { wch: 15 },  // AK: IFSC
            { wch: 20 }   // AL: Branch
        ];
        
        worksheet['!cols'] = columnWidths;
        
        // Add the worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        
        // Convert workbook to buffer
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
        return excelBuffer;
    } catch (error) {
        console.error('Error creating Excel file:', error);
        throw error;
    }
};

// Function to upload Excel file to Cloudinary
const uploadExcelToCloudinary = async (buffer, fileName) => {
    return new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload_stream(
            { 
                resource_type: "raw",
                public_id: fileName,
                folder: "invoice_excel_files",
                format: "xlsx"
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        ).end(buffer);
    });
};

export const extractInvoiceData = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const apiKey = req.apiKey;

        // Generate file hash for duplicate detection
        const documentHash = crypto
            .createHash('sha256')
            .update(req.file.buffer)
            .digest('hex');

        // Check for duplicate document
        const existingInvoice = await Invoice.findOne({ documentHash });
        if (existingInvoice) {
            return res.status(409).json({
                success: false,
                message: "This document appears to be a duplicate. A similar document has already been processed."
            });
        }

        // Generate a unique document name based on timestamp
        const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, "");
        const documentName = `invoice_${timestamp}`;

        // Upload document to Cloudinary
        cloudinary.v2.uploader.upload_stream(
            { resource_type: "image", public_id: documentName, folder: "invoices" },
            async (error, uploadResult) => {
                if (error) {
                    console.error("Cloudinary upload error:", error);
                    return res.status(500).json({ success: false, message: "Error uploading document to Cloudinary" });
                }

                const documentUrl = uploadResult.secure_url;

                try {
                    // Process document with Gemini AI
                    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
                    const base64Document = req.file.buffer.toString("base64");

                    const imageData = {
                        inlineData: {
                            mimeType: req.file.mimetype,
                            data: base64Document,
                        },
                    };

                    const prompt = `Extract all the data from this invoice/tax document and provide it in the following structured JSON format:
                    {
                        "vendorName": "",
                        "vendorAddress": "",
                        "vendorGstin": "",
                        "vendorPhone": "",
                        "vendorEmail": "",
                        "billingAddress": "",
                        "deliveryAddress": "",
                        "invoiceNumber": "",
                        "invoiceDate": "",
                        "poNumber": "",
                        "poDate": "",
                        "custDcNo": "",
                        "dcDate": "",
                        "vehicleNo": "",
                        "modeOfTransport": "",
                        "items": [
                            {
                                "itemDescription": "",
                                "quantity": 0,
                                "pricePerUnit": 0,
                                "amount": 0,
                                "hsnSac": "",
                                "gstRate": 0,
                                "dcNo": ""
                            }
                        ],
                        "subTotal": 0,
                        "cgstAmount": 0,
                        "sgstAmount": 0,
                        "igstAmount": 0,
                        "totalAmount": 0,
                        "totalAmountInWords": "",
                        "taxAmountInWords": "",
                        "paymentTerms": "",
                        "bankDetails": {
                            "bankName": "",
                            "accountNumber": "",
                            "ifscCode": "",
                            "branch": ""
                        },
                        "panNumber": "",
                        "eWayBillNo": "",
                        "remarks": ""
                    }
                    
                    Please ensure:
                    1. All numerical values are properly converted to numbers
                    2. Dates are in YYYY-MM-DD format
                    3. Extract all line items with their details
                    4. Calculate totals accurately
                    5. Return only the JSON object without any additional text`;

                    // Call Gemini AI API
                    const aiResponse = await model.generateContent([imageData, prompt]);
                    const response = await aiResponse.response;
                    const rawText = response.text();

                    if (!rawText) {
                        return res.status(500).json({ success: false, message: "No extracted data found in response" });
                    }

                    // Extract JSON from response
                    const extractJsonFromMarkdown = (text) => text.replace(/```json\n|\n```/g, "").trim();

                    let extractedData;
                    try {
                        extractedData = JSON.parse(extractJsonFromMarkdown(rawText));
                    } catch (parseError) {
                        console.error("Error parsing response:", parseError);
                        return res.status(500).json({ success: false, message: "Error parsing extracted data" });
                    }

                    // Validate required fields
                    const requiredFields = ["vendorName", "invoiceNumber", "invoiceDate", "totalAmount"];
                    const missingFields = requiredFields.filter(field => !extractedData[field]);

                    if (missingFields.length > 0) {
                        return res.status(400).json({
                            success: false,
                            message: "Missing required fields",
                            missingFields
                        });
                    }

                    // Convert dates
                    let invoiceDate = moment(extractedData.invoiceDate, ["YYYY-MM-DD", "DD/MM/YYYY", "MM-DD-YYYY"]).toDate();
                    let poDate = null;
                    let dcDate = null;
                    
                    if (extractedData.poDate) {
                        poDate = moment(extractedData.poDate, ["YYYY-MM-DD", "DD/MM/YYYY", "MM-DD-YYYY"]).toDate();
                    }
                    
                    if (extractedData.dcDate) {
                        dcDate = moment(extractedData.dcDate, ["YYYY-MM-DD", "DD/MM/YYYY", "MM-DD-YYYY"]).toDate();
                    }

                    if (isNaN(invoiceDate.getTime())) {
                        return res.status(400).json({ 
                            success: false, 
                            message: "Invalid invoice date format extracted from document",
                            extractedDate: extractedData.invoiceDate 
                        });
                    }

                    // Create Excel file
                    const excelBuffer = await createExcelFile(extractedData);
                    const excelFileName = `invoice_data_${timestamp}`;
                    
                    // Upload Excel file to Cloudinary
                    const excelUploadResult = await uploadExcelToCloudinary(excelBuffer, excelFileName);

                    // Save to MongoDB
                    const newInvoice = new Invoice({
                        apiKey,
                        vendorName: extractedData.vendorName,
                        vendorAddress: extractedData.vendorAddress,
                        vendorGstin: extractedData.vendorGstin,
                        vendorPhone: extractedData.vendorPhone,
                        vendorEmail: extractedData.vendorEmail,
                        billingAddress: extractedData.billingAddress,
                        deliveryAddress: extractedData.deliveryAddress,
                        invoiceNumber: extractedData.invoiceNumber,
                        invoiceDate,
                        poNumber: extractedData.poNumber,
                        poDate,
                        custDcNo: extractedData.custDcNo,
                        dcDate,
                        vehicleNo: extractedData.vehicleNo,
                        modeOfTransport: extractedData.modeOfTransport,
                        items: extractedData.items || [],
                        subTotal: parseFloat(extractedData.subTotal) || 0,
                        cgstAmount: parseFloat(extractedData.cgstAmount) || 0,
                        sgstAmount: parseFloat(extractedData.sgstAmount) || 0,
                        igstAmount: parseFloat(extractedData.igstAmount) || 0,
                        totalAmount: parseFloat(extractedData.totalAmount),
                        totalAmountInWords: extractedData.totalAmountInWords,
                        taxAmountInWords: extractedData.taxAmountInWords,
                        paymentTerms: extractedData.paymentTerms,
                        bankDetails: extractedData.bankDetails || {},
                        panNumber: extractedData.panNumber,
                        eWayBillNo: extractedData.eWayBillNo,
                        remarks: extractedData.remarks,
                        documentUrl,
                        documentHash,
                        excelFileUrl: excelUploadResult.secure_url,
                        processingStatus: 'Completed'
                    });

                    await newInvoice.save();

                    res.json({
                        success: true,
                        data: newInvoice,
                        documentName,
                        excelFileUrl: excelUploadResult.secure_url,
                        message: "Invoice processed successfully and Excel file generated"
                    });

                } catch (aiError) {
                    console.error("AI processing error:", aiError);
                    
                    // Save failed processing record
                    const failedInvoice = new Invoice({
                        apiKey,
                        vendorName: "Processing Failed",
                        invoiceNumber: "Unknown",
                        invoiceDate: new Date(),
                        totalAmount: 0,
                        documentUrl,
                        documentHash,
                        processingStatus: 'Failed'
                    });
                    
                    await failedInvoice.save();
                    
                    res.status(500).json({ 
                        success: false, 
                        message: "Error processing invoice data",
                        error: aiError.message 
                    });
                }
            }
        ).end(req.file.buffer);

    } catch (error) {
        console.error("Error extracting invoice data:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error extracting invoice data", 
            error: error.message 
        });
    }
};

export const getInvoices = async (req, res) => {
    try {
        const apiKey = req.apiKey;
        const { page = 1, limit = 10, status } = req.query;
        
        const filter = { apiKey };
        if (status) {
            filter.processingStatus = status;
        }
        
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        };
        
        const invoices = await Invoice.find(filter)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });
            
        const total = await Invoice.countDocuments(filter);
        
        res.status(200).json({
            success: true,
            data: invoices,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching invoices', 
            error: error.message 
        });
    }
};

export const getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const apiKey = req.apiKey;
        
        const invoice = await Invoice.findOne({ _id: id, apiKey });
        
        if (!invoice) {
            return res.status(404).json({ 
                success: false, 
                message: 'Invoice not found or access denied' 
            });
        }
        
        res.status(200).json({
            success: true,
            data: invoice
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching invoice', 
            error: error.message 
        });
    }
};

export const deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const apiKey = req.apiKey;
        
        const invoice = await Invoice.findOne({ _id: id, apiKey });
        
        if (!invoice) {
            return res.status(404).json({ 
                success: false, 
                message: 'Invoice not found or access denied' 
            });
        }
        
        // Delete files from Cloudinary
        if (invoice.documentUrl) {
            try {
                const urlParts = invoice.documentUrl.split('/');
                const fileName = urlParts[urlParts.length - 1];
                const folderName = urlParts[urlParts.length - 2];
                const public_id = `${folderName}/${fileName.split('.')[0]}`;
                await cloudinary.v2.uploader.destroy(public_id);
            } catch (cloudinaryError) {
                console.error('Error deleting document from Cloudinary:', cloudinaryError);
            }
        }
        
        if (invoice.excelFileUrl) {
            try {
                const urlParts = invoice.excelFileUrl.split('/');
                const fileName = urlParts[urlParts.length - 1];
                const folderName = urlParts[urlParts.length - 2];
                const public_id = `${folderName}/${fileName.split('.')[0]}`;
                await cloudinary.v2.uploader.destroy(public_id, { resource_type: 'raw' });
            } catch (cloudinaryError) {
                console.error('Error deleting Excel file from Cloudinary:', cloudinaryError);
            }
        }
        
        await Invoice.findByIdAndDelete(id);
        
        res.status(200).json({ 
            success: true, 
            message: 'Invoice deleted successfully' 
        });
        
    } catch (error) {
        console.error('Delete invoice error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting invoice', 
            error: error.message 
        });
    }
};