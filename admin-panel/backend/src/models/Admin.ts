import { Schema, model } from 'mongoose';

const AdminSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'MANAGER', 'EDITOR'], default: 'ADMIN' },
  permissions: [{ type: String }],
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
}, {
  timestamps: true,
});

// Soft Delete Middleware
AdminSchema.pre('find', function () {
  this.where({ isDeleted: { $ne: true } });
});
AdminSchema.pre('findOne', function () {
  this.where({ isDeleted: { $ne: true } });
});

export const Admin = model('Admin', AdminSchema);
