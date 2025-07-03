import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
    itemDescription: { type: String, required: true },
    quantity: { type: Number, required: true },
    pricePerUnit: { type: Number, required: true },
    amount: { type: Number, required: true },
    hsnSac: { type: String },
    gstRate: { type: Number },
    dcNo: { type: String }
});

const invoiceSchema = new mongoose.Schema({
    apiKey: { type: String, required: true },
    vendorName: { type: String, required: true },
    vendorAddress: { type: String },
    vendorGstin: { type: String },
    vendorPhone: { type: String },
    vendorEmail: { type: String },
    
    billingAddress: { type: String },
    deliveryAddress: { type: String },
    
    invoiceNumber: { type: String, required: true },
    invoiceDate: { type: Date, required: true },
    poNumber: { type: String },
    poDate: { type: Date },
    custDcNo: { type: String },
    dcDate: { type: Date },
    vehicleNo: { type: String },
    modeOfTransport: { type: String },
    
    items: [invoiceItemSchema],
    
    subTotal: { type: Number, required: true },
    cgstAmount: { type: Number, default: 0 },
    sgstAmount: { type: Number, default: 0 },
    igstAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    
    totalAmountInWords: { type: String },
    taxAmountInWords: { type: String },
    
    paymentTerms: { type: String },
    bankDetails: {
        bankName: { type: String },
        accountNumber: { type: String },
        ifscCode: { type: String },
        branch: { type: String }
    },
    
    panNumber: { type: String },
    eWayBillNo: { type: String },
    remarks: { type: String },
    
    documentUrl: { type: String, required: true },
    documentHash: { type: String, required: true },
    excelFileUrl: { type: String },
    
    processingStatus: { type: String, enum: ['Processing', 'Completed', 'Failed'], default: 'Processing' },
    
}, {
    timestamps: true
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;