import { Schema, model } from 'mongoose';

const SettingSchema = new Schema({
  websiteName: { type: String, default: 'LuxeMarket' },
  logo: { type: String },
  favicon: { type: String },
  contactEmail: { type: String, default: 'support@luxemarket.com' },
  contactPhone: { type: String, default: '+91 98765 43210' },
  contactAddress: { type: String, default: 'Bandra, Mumbai, MH, India' },
  taxSettings: {
    gstRate: { type: Number, default: 18.0 },
    enableTax: { type: Boolean, default: true }
  },
  shippingSettings: {
    flatRateCharge: { type: Number, default: 150 },
    freeShippingThreshold: { type: Number, default: 5000 },
  },
  paymentSettings: {
    stripeEnabled: { type: Boolean, default: true },
    razorpayEnabled: { type: Boolean, default: true },
    paypalEnabled: { type: Boolean, default: false },
    codEnabled: { type: Boolean, default: true }
  },
  socialLinks: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
  },
  themeSettings: {
    defaultTheme: { type: String, enum: ['light', 'dark'], default: 'light' },
    primaryColor: { type: String, default: '#8b0000' }
  }
}, {
  timestamps: true,
  capped: { max: 1 } // Only keep one configuration document
});

export const Setting = model('Setting', SettingSchema);
