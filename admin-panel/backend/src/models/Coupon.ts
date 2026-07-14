import { Schema, model } from 'mongoose';

const CouponSchema = new Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType: { type: String, enum: ['PERCENTAGE', 'FIXED'], required: true },
  discountValue: { type: Number, required: true },
  minOrderAmount: { type: Number, default: 0 },
  maxDiscountAmount: { type: Number },
  expiryDate: { type: Date, required: true },
  usageLimit: { type: Number, default: 100 },
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  postgresId: { type: String },
}, {
  timestamps: true,
});

CouponSchema.pre('find', function () {
  this.where({ isDeleted: { $ne: true } });
});
CouponSchema.pre('findOne', function () {
  this.where({ isDeleted: { $ne: true } });
});

export const Coupon = model('Coupon', CouponSchema);
