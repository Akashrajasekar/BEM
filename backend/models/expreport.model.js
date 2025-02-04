import mongoose from 'mongoose' ;

const expreportSchema = new mongoose.Schema({
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    department: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expenses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Expense', required: true }],
    totalAmount: { type: Number, required: true },
    currency: { type: String, required: true },
    convertedAmount: { type: Number },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    approverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ai_prediction: { type: String, enum: ['approved', 'rejected', 'pending'], default: 'pending' },
    policy_compliance: { type: Number, min: 0, max: 100 },
    approvedDate: { type: Date, default: null },
    comments: { type: String },
    timestamps: true
});

const Expreport = mongoose.model('Expreport', expreportSchema)

export default Expreport;