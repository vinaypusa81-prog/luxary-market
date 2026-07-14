import { Schema, model } from 'mongoose';

const AuditLogSchema = new Schema({
  adminId: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  adminName: { type: String, required: true },
  action: { type: String, required: true }, // e.g. "CREATE_PRODUCT", "UPDATE_ORDER", "DELETE_COUPON"
  details: { type: String, required: true }, // Descriptive summary
  ipAddress: { type: String },
  userAgent: { type: String },
}, {
  timestamps: { createdAt: true, updatedAt: false }, // Only need creation time
});

export const AuditLog = model('AuditLog', AuditLogSchema);
