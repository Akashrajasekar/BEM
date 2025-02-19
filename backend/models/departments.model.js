import mongoose from 'mongoose' ;

const departmentSchema = new mongoose.Schema({
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization'},
    name: { type: String, required: true },
    manager_id: { type: mongoose.Schema.Types.ObjectId, ref:'User' },
    total_budget: {type: Number},
    // Categories field as an array with enum values
    categories: {
      type: [String], // Array of strings
      enum: ["Travel", "Meals", "Office Supplies", "Training", "Healthcare", "Others"], // Allowed values
      default: ["Others"], // Optional default categories
    },
}, {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  });

const Department = mongoose.model('Department', departmentSchema)

export default Department;