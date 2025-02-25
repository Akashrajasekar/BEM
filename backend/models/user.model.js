// user.model.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization'},
    name: { type: String, required: true },
    email: { type: String, required: true },
    access: { type: String, enum: ['employee', 'manager', 'admin'], required: true },
    role: { type: String, required: true },
    department: { type: String, required: true },
    manager_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    department_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    Alloted_Limit: { type: Number },
    password: { type: String, required: true },
    isPasswordReset: { type: Boolean, default: false }
}, {
    timestamps: true
});

// Modified comparePassword method to handle both temporary and hashed passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    // If password hasn't been reset yet, compare as plain text
    if (!this.isPasswordReset) {
        return candidatePassword === this.password;
    }
    // If password has been reset, compare using bcrypt
    return bcrypt.compare(candidatePassword, this.password);
};

// Pre-save middleware to hash password only after reset
userSchema.pre('save', async function(next) {
    // Only hash the password if isPasswordReset is true and password is modified
    if (this.isPasswordReset && this.isModified('password')) {
        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        } catch (error) {
            return next(error);
        }
    }
    next();
});

const User = mongoose.model('User', userSchema);
export default User;