import { Schema, model } from 'mongoose';

const CategorySchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  image: { type: String },
  parentId: { type: Schema.Types.ObjectId, ref: 'Category', default: null }, // nested categories
  level: { type: Number, default: 0 },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  isDeleted: { type: Boolean, default: false },
  postgresId: { type: String },
}, {
  timestamps: true,
});

CategorySchema.pre('find', function () {
  this.where({ isDeleted: { $ne: true } });
});
CategorySchema.pre('findOne', function () {
  this.where({ isDeleted: { $ne: true } });
});

export const Category = model('Category', CategorySchema);
