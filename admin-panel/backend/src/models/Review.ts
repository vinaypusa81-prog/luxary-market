import { Schema, model } from 'mongoose';

const ReviewSchema = new Schema({
  productId: { type: String, required: true }, // Mongoose Product ID
  postgresProductId: { type: String }, // Postgres Product CUID
  productName: { type: String, required: true },
  customerId: { type: String },
  customerName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  body: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  reply: { type: String }, // Admin response
  replyAt: { type: Date },
  isDeleted: { type: Boolean, default: false },
  postgresId: { type: String },
}, {
  timestamps: true,
});

ReviewSchema.pre('find', function () {
  this.where({ isDeleted: { $ne: true } });
});
ReviewSchema.pre('findOne', function () {
  this.where({ isDeleted: { $ne: true } });
});

export const Review = model('Review', ReviewSchema);
