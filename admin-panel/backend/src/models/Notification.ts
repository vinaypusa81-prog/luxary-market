import { Schema, model } from 'mongoose';

const NotificationSchema = new Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['NEW_ORDER', 'LOW_STOCK', 'CANCELLED_ORDER', 'NEW_CUSTOMER', 'SYSTEM'], required: true },
  isRead: { type: Boolean, default: false },
  metadata: { type: Schema.Types.Mixed }, // JSON for referencing orderId, sku, customerId
}, {
  timestamps: true,
});

export const Notification = model('Notification', NotificationSchema);
