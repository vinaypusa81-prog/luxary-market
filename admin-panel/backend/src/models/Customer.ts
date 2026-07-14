import { Schema, model } from 'mongoose';

const AddressSchema = new Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  line1: { type: String, required: true },
  line2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
});

const CustomerSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String },
  status: { type: String, enum: ['ACTIVE', 'BLOCKED'], default: 'ACTIVE' },
  addresses: [AddressSchema],
  wishlist: [{ type: String }], // Array of Product SKUs or IDs
  totalSpending: { type: Number, default: 0 },
  orderCount: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false },
  postgresId: { type: String }, // Postgres user ID
}, {
  timestamps: true,
});

CustomerSchema.pre('find', function () {
  this.where({ isDeleted: { $ne: true } });
});
CustomerSchema.pre('findOne', function () {
  this.where({ isDeleted: { $ne: true } });
});

export const Customer = model('Customer', CustomerSchema);
export { AddressSchema };
