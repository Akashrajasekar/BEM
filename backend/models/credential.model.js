import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const credentialSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    isPasswordReset: { type: Boolean, default: false } // Track if the password has been reset
}, {
    timestamps: true // Correct placement of the timestamps option
});


// Hash password before saving
credentialSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

const Credential = mongoose.model('Credential', credentialSchema);

export default Credential;
