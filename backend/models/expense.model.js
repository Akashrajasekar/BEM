import mongoose from 'mongoose' ;

const expenseSchema = new mongoose.Schema({
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    department: { type: String, required: true },
    merchant: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, enum: ['INR','AED','USD'] },
    convertedAmount: { type: Number },
    category: { type: String, required: true },
    expenseDate: { type: Date, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    ai_prediction: { type: String, enum: ['approved', 'rejected', 'pending'], default: 'pending' },
    policy_compliance: { type: Number, min: 0, max: 100 },
    receiptUrl: { type: String, required: true },
    isDuplicate: { type: Boolean, default: false },
    comments: [
        {
        approverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        message: { type: String },
        timestamp: { type: Date, default: Date.now }
        }
    ],
    timestamps: true
});

const Expense = mongoose.model('Expense', expenseSchema)

export default Expense;