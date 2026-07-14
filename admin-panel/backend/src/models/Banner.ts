import { Schema, model } from 'mongoose';

const BannerSchema = new Schema({
  title: { type: String, required: true },
  image: { type: String, required: true },
  type: { type: String, enum: ['SLIDER', 'HERO', 'OFFER', 'SIDEBAR'], default: 'SLIDER' },
  link: { type: String }, // redirect path
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
}, {
  timestamps: true,
});

BannerSchema.pre('find', function () {
  this.where({ isDeleted: { $ne: true } });
});
BannerSchema.pre('findOne', function () {
  this.where({ isDeleted: { $ne: true } });
});

export const Banner = model('Banner', BannerSchema);
