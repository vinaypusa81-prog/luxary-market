import { Schema, model } from 'mongoose';

const OrderItemSchema = new Schema({
  productId: { type: String, required: true }, // Mongoose Product ID
  postgresProductId: { type: String }, // Postgres Product ID
  name: { type: String, required: true },
  sku: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  color: { type: String },
  size: { type: String },
  thumbnail: { type: String },
});

const OrderTimelineSchema = new Schema({
  status: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  timestamp: { type: Date, default: Date.now },
});

const OrderSchema = new Schema({
  orderId: { type: String, required: true, unique: true }, // LM-XXXXX format
  postgresId: { type: String }, // Postgres Order CUID
  customerName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  customerId: { type: String }, // Mongoose Customer ID or Postgres User CUID
  products: [OrderItemSchema],
  subtotal: { type: Number, required: true },
  shipping: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['STRIPE', 'RAZORPAY', 'PAYPAL', 'COD', 'WALLET'], default: 'COD' },
  paymentStatus: { type: String, enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'], default: 'PENDING' },
  orderStatus: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REFUNDED'],
    default: 'PENDING'
  },
  shippingAddress: {
    fullName: { type: String },
    phone: { type: String },
    line1: { type: String },
    line2: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String }
  },
  trackingNumber: { type: String },
  deliveryPartner: { type: String },
  estimatedDelivery: { type: Date },
  timeline: [OrderTimelineSchema],
  isDeleted: { type: Boolean, default: false },
}, {
  timestamps: true,
});

OrderSchema.pre('find', function () {
  this.where({ isDeleted: { $ne: true } });
});
OrderSchema.pre('findOne', function () {
  this.where({ isDeleted: { $ne: true } });
});

export const Order = model('Order', OrderSchema);
export { OrderItemSchema, OrderTimelineSchema };
