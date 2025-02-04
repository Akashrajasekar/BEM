import mongoose from 'mongoose' ;

const approvalSchema = new mongoose.Schema({
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expreport', required: true },
    approverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], required: true },
    comments: { type: String },
    approved_amount: { type: Number },
    approved_at: { type: Date, default: Date.now },
    timestamps: true
});

const Approval = mongoose.model('Approval', approvalSchema)

export default Approval;