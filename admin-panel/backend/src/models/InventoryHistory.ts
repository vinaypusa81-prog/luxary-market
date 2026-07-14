import { Schema, model } from 'mongoose';

const InventoryHistorySchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  sku: { type: String, required: true },
  quantityChange: { type: Number, required: true }, // positive or negative
  newQuantity: { type: Number, required: true },
  type: { type: String, enum: ['RESTOCK', 'SALE', 'REFUND', 'ADJUSTMENT', 'DAMAGE'], required: true },
  reason: { type: String },
  performedBy: { type: String, default: 'SYSTEM' }, // Admin name or "SYSTEM"
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

export const InventoryHistory = model('InventoryHistory', InventoryHistorySchema);
