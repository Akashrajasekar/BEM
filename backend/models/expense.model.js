import mongoose from 'mongoose' ;

const expenseSchema = new mongoose.Schema({
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    department_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    department: { type: String, required: false },
    merchant: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, enum: ['INR','AED','USD'] },
    convertedAmount: { type: Number },
    category: { type: String, required: true },
    expenseDate: { type: Date, required: true },
    submissionStatus: { type: String, enum: ['Draft', 'Submitted'], default: 'Draft' },
    approvalStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    receiptUrl: { type: String, required: false },
    receiptHash: { type: String },
    isDuplicate: { type: Boolean, default: false },
    },{
        timestamps: true
    });

const Expense = mongoose.model('Expense', expenseSchema)

export default Expense;