import mongoose from 'mongoose' ;

const deleteduserSchema = new mongoose.Schema({
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization'},
    name: { type: String, required: true },
    email: { type: String, required: true },
    access: { type: String, enum: ['employee', 'manager', 'admin'], required: true },
    role: { type: String, required: true },
    department: { type: String, required: true },
    manager_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    password: { type: String, default: "true" },
    isPasswordReset: {type: Boolean, default:false}
}, {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  });

const Deleteduser = mongoose.model('Deleteduser', deleteduserSchema)

export default Deleteduser;