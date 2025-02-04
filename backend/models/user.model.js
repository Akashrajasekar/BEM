import mongoose from 'mongoose' ;

const userSchema = new mongoose.Schema({
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['submitter', 'approver', 'admin'], required: true },
    department: { type: String, required: true },
    manager_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    profile_picture: { type: String },
    auth_provider: { type: String, enum: ['google', 'microsoft', 'github'], required: true },
    timestamps: true
});

const User = mongoose.model('User', userSchema)

export default User;