import { Schema, model } from 'mongoose';

const ProductSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true }, // slug or name
  categoryId: { type: String }, // Postgres category ID reference for sync
  brand: { type: String },
  brandId: { type: String }, // Postgres brand ID reference for sync
  sku: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  quantity: { type: Number, default: 0 },
  images: [{ type: String }],
  thumbnail: { type: String },
  color: [{ type: String }],
  size: [{ type: String }],
  tags: [{ type: String }],
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  shippingWeight: { type: Number }, // in kg
  dimensions: {
    length: { type: Number },
    width: { type: Number },
    height: { type: Number }
  },
  warranty: { type: String },
  status: { type: String, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED', 'OUT_OF_STOCK'], default: 'ACTIVE' },
  isDeleted: { type: Boolean, default: false },
  postgresId: { type: String }, // Reference to Postgres DB product ID
}, {
  timestamps: true,
});

// Indexes
ProductSchema.index({ sku: 1 });
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Soft Delete Middleware
ProductSchema.pre('find', function () {
  this.where({ isDeleted: { $ne: true } });
});
ProductSchema.pre('findOne', function () {
  this.where({ isDeleted: { $ne: true } });
});

export const Product = model('Product', ProductSchema);
