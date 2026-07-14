import { Schema, model } from 'mongoose';

const BrandSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  logo: { type: String },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  postgresId: { type: String },
}, {
  timestamps: true,
});

BrandSchema.pre('find', function () {
  this.where({ isDeleted: { $ne: true } });
});
BrandSchema.pre('findOne', function () {
  this.where({ isDeleted: { $ne: true } });
});

export const Brand = model('Brand', BrandSchema);
