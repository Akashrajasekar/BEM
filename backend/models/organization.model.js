import mongoose from 'mongoose' ;

const organizationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    domain: { type: String, required: true, unique: true },
    timestamps: true, //createdAt, updatedAt
    departments: { type: [String], default: [] }
});

const Organization = mongoose.model('Organization', organizationSchema)

export default Organization;