import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load env variables
dotenv.config({ path: path.join(__dirname, '../.env') });

import { connectMongoDB } from './config/db';
import { prisma } from './config/prisma';

// Mongoose Models
import { Admin } from './models/Admin';
import { Product } from './models/Product';
import { Category } from './models/Category';
import { Brand } from './models/Brand';
import { Order } from './models/Order';
import { Customer } from './models/Customer';
import { Coupon } from './models/Coupon';
import { Review } from './models/Review';
import { Banner } from './models/Banner';
import { Setting } from './models/Setting';
import { Notification } from './models/Notification';
import { AuditLog } from './models/AuditLog';
import { InventoryHistory } from './models/InventoryHistory';

// Sync service to seed PostgreSQL too
import { SyncService } from './services/sync.service';

async function seed() {
  console.log('🌱 Starting Admin Panel seeding script...');

  // Wait 2 seconds for DB connections to stabilize
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // 1. Clear MongoDB Collections
  console.log('🧹 Clearing Mongoose collections...');
  await Admin.deleteMany({});
  await Product.deleteMany({});
  await Category.deleteMany({});
  await Brand.deleteMany({});
  await Order.deleteMany({});
  await Customer.deleteMany({});
  await Coupon.deleteMany({});
  await Review.deleteMany({});
  await Banner.deleteMany({});
  await Setting.deleteMany({});
  await Notification.deleteMany({});
  await AuditLog.deleteMany({});
  await InventoryHistory.deleteMany({});
  console.log('🧹 MongoDB cleared.');

  // 2. Clear & Seed PostgreSQL via Prisma service script logic
  // We clean Postgres using raw SQL or Prisma calls if needed, or simply write new synced items
  console.log('🧹 Cleaning Postgres tables related to sync catalog (optional)...');
  await prisma.review.deleteMany().catch(() => {});
  await prisma.orderItem.deleteMany().catch(() => {});
  await prisma.order.deleteMany().catch(() => {});
  await prisma.inventory.deleteMany().catch(() => {});
  await prisma.productVariant.deleteMany().catch(() => {});
  await prisma.product.deleteMany().catch(() => {});
  await prisma.category.deleteMany().catch(() => {});
  await prisma.brand.deleteMany().catch(() => {});
  console.log('🐘 Postgres tables cleared.');

  // 3. Create Admin Users in MongoDB
  console.log('👤 Seeding Admins...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('SecurePass123!', salt);

  const primaryAdmin = await Admin.create({
    name: 'LuxeMarket Admin',
    email: 'admin@luxemarket.com',
    passwordHash,
    role: 'ADMIN',
    permissions: ['all'],
    isActive: true,
  });

  const managerAdmin = await Admin.create({
    name: 'Inventory Manager',
    email: 'manager@luxemarket.com',
    passwordHash,
    role: 'MANAGER',
    permissions: ['products', 'inventory'],
    isActive: true,
  });
  console.log('✅ Seeding Admins completed.');

  // 4. Create Settings
  console.log('⚙️ Seeding Settings...');
  await Setting.create({
    websiteName: 'LuxeMarket Storefront',
    contactEmail: 'contact@luxemarket.com',
    contactPhone: '+91 99999 88888',
    contactAddress: 'Luxury Hub, Nariman Point, Mumbai, India',
    taxSettings: { gstRate: 18.0, enableTax: true },
    shippingSettings: { flatRateCharge: 150, freeShippingThreshold: 5000 },
    paymentSettings: { stripeEnabled: true, razorpayEnabled: true, paypalEnabled: false, codEnabled: true },
    socialLinks: { facebook: 'https://facebook.com/luxemarket', instagram: 'https://instagram.com/luxemarket', twitter: '' },
    themeSettings: { defaultTheme: 'light', primaryColor: '#8b0000' }
  });
  console.log('✅ Settings seeded.');

  // 5. Seed Banners
  console.log('🖼️ Seeding Banners...');
  await Banner.create([
    { title: 'Summer Couture Festival', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80', type: 'SLIDER', link: '/products?collection=summer', order: 1 },
    { title: 'The Tailored Men Standard', image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=1600&q=80', type: 'SLIDER', link: '/products?category=men', order: 2 },
    { title: 'Mid-Season Offer: 40% OFF', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80', type: 'OFFER', link: '/sale', order: 3 }
  ]);
  console.log('✅ Banners seeded.');

  // 6. Seed Coupons
  console.log('🎟️ Seeding Coupons...');
  const couponData = [
    { code: 'LUXURY10', discountType: 'PERCENTAGE', discountValue: 10, minOrderAmount: 2000, expiryDate: new Date('2026-12-31') },
    { code: 'WELCOME500', discountType: 'FIXED', discountValue: 500, minOrderAmount: 5000, expiryDate: new Date('2026-12-31') }
  ];
  for (const c of couponData) {
    const mongoCoupon = await Coupon.create(c);
    await SyncService.syncCouponToPostgres(mongoCoupon);
  }
  console.log('✅ Coupons seeded.');

  // 7. Seed Categories and Brands
  console.log('📁 Seeding Categories & Brands...');
  const catWomen = await Category.create({ name: 'Women', slug: 'women', description: 'Women clothing and couture', status: 'ACTIVE' });
  const catMen = await Category.create({ name: 'Men', slug: 'men', description: 'Men tailored styles', status: 'ACTIVE' });
  const catAccessories = await Category.create({ name: 'Accessories', slug: 'accessories', description: 'Bags, sunglasses, belts', status: 'ACTIVE' });

  await SyncService.syncCategoryToPostgres(catWomen);
  await SyncService.syncCategoryToPostgres(catMen);
  await SyncService.syncCategoryToPostgres(catAccessories);

  const brandForce = await Brand.create({ name: 'ForceStyle', slug: 'forcestyle', description: 'Urban premium wear', isActive: true });
  const brandRoyal = await Brand.create({ name: 'Royal Weaves', slug: 'royal-weaves', description: 'Banarasi silk ethnic styles', isActive: true });

  await SyncService.syncBrandToPostgres(brandForce);
  await SyncService.syncBrandToPostgres(brandRoyal);
  console.log('✅ Categories & Brands completed.');

  // 8. Seed Products
  console.log('👕 Seeding Products...');
  const products = [
    {
      name: 'Slim Fit Knit Polo Shirt',
      description: 'Upgrade your smart-casual look with this knit polo shirt. Features short sleeves, structured collar, and soft organic cotton build.',
      category: 'Men',
      brand: 'ForceStyle',
      sku: 'POLO-KNIT-001',
      price: 1899,
      discountPrice: 1139,
      quantity: 100,
      images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'],
      thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&q=80',
      color: ['Blue', 'Black'],
      size: ['S', 'M', 'L'],
      tags: ['polo', 'knit', 'cotton', 'men'],
      rating: 4.6,
      isTrending: true,
      shippingWeight: 0.3,
      status: 'ACTIVE'
    },
    {
      name: 'Embellished Silk Anarkali Suit Set',
      description: 'Experience absolute luxury with this Banarasi silk Anarkali set. Adorned with hand zari embroidery and chiffon dupatta.',
      category: 'Women',
      brand: 'Royal Weaves',
      sku: 'ANAR-SILK-002',
      price: 12999,
      discountPrice: 7799,
      quantity: 45,
      images: ['https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80'],
      thumbnail: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=200&q=80',
      color: ['Gold', 'Red'],
      size: ['M', 'L'],
      tags: ['ethnic', 'anarkali', 'silk', 'women'],
      rating: 4.9,
      isFeatured: true,
      shippingWeight: 1.2,
      status: 'ACTIVE'
    },
    {
      name: 'Leather Weekend Duffle Bag',
      description: 'Handcrafted genuine leather duffle bag with brass fittings. Perfect cabin size for short business trips or weekend getaways.',
      category: 'Accessories',
      brand: 'ForceStyle',
      sku: 'BAG-LEATHER-003',
      price: 5999,
      discountPrice: 4499,
      quantity: 15,
      images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80'],
      thumbnail: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&q=80',
      color: ['Brown', 'Tan'],
      size: ['One Size'],
      tags: ['bag', 'leather', 'travel'],
      rating: 4.8,
      isBestSeller: true,
      shippingWeight: 1.8,
      status: 'ACTIVE'
    }
  ];

  const dbProducts = [];
  for (const p of products) {
    const mongoProd = await Product.create(p);
    await SyncService.syncProductToPostgres(mongoProd);
    dbProducts.push(mongoProd);
    
    // Seed initial Inventory history
    await InventoryHistory.create({
      productId: mongoProd._id,
      productName: mongoProd.name,
      sku: mongoProd.sku,
      quantityChange: mongoProd.quantity,
      newQuantity: mongoProd.quantity,
      type: 'RESTOCK',
      reason: 'Initial database seeding Restock',
      performedBy: 'SYSTEM'
    });
  }
  console.log('✅ Products seeded.');

  // 9. Seed Customers
  console.log('👤 Seeding Customers...');
  const customerUser = await prisma.user.create({
    data: {
      name: 'Vinay Kumar',
      email: 'vinay@example.com',
      passwordHash: await bcrypt.hash('SecurePass123!', salt),
      role: 'CUSTOMER',
      isActive: true,
      wallet: { create: { balance: 5000 } },
      rewardPoints: { create: { points: 250, lifetimeEarned: 250 } }
    }
  });

  const c1 = await Customer.create({
    name: 'Vinay Kumar',
    email: 'vinay@example.com',
    phone: '9876543210',
    status: 'ACTIVE',
    addresses: [{
      fullName: 'Vinay Kumar',
      phone: '9876543210',
      line1: '123, Luxury Tower',
      line2: 'Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      isDefault: true
    }],
    wishlist: ['POLO-KNIT-001'],
    totalSpending: 2099,
    orderCount: 1,
    postgresId: customerUser.id
  });
  console.log('✅ Customers seeded.');

  // 10. Seed Orders
  console.log('📦 Seeding Orders...');
  const orderId = `LM-${Math.floor(10000 + Math.random() * 90000)}`;

  // Create Postgres Address first for Vinay Kumar
  const pgAddress = await prisma.address.create({
    data: {
      userId: customerUser.id,
      fullName: 'Vinay Kumar',
      phone: '9876543210',
      line1: '123, Luxury Tower',
      line2: 'Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400050',
      isDefault: true,
    }
  });

  // Create Postgres Order
  const pgOrder = await prisma.order.create({
    data: {
      orderNumber: orderId,
      userId: customerUser.id,
      addressId: pgAddress.id,
      status: 'PENDING',
      subtotal: 1899,
      shipping: 150,
      tax: 341.82,
      discount: 290,
      total: 2099,
      items: {
        create: [
          {
            productId: dbProducts[0].postgresId!,
            quantity: 1,
            name: 'Slim Fit Knit Polo Shirt',
            sku: 'POLO-KNIT-001',
            unitPrice: 1899,
            totalPrice: 1899,
          }
        ]
      },
      payment: {
        create: {
          amount: 2099,
          method: 'COD',
          status: 'PENDING',
        }
      }
    }
  });

  // Create MongoDB Order
  await Order.create({
    orderId,
    postgresId: pgOrder.id,
    customerName: 'Vinay Kumar',
    email: 'vinay@example.com',
    phone: '9876543210',
    customerId: c1._id,
    products: [{
      productId: dbProducts[0]._id,
      postgresProductId: dbProducts[0].postgresId!,
      name: 'Slim Fit Knit Polo Shirt',
      sku: 'POLO-KNIT-001',
      price: 1899,
      quantity: 1,
      color: 'Blue',
      size: 'M',
      thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&q=80'
    }],
    subtotal: 1899,
    shipping: 150,
    tax: 341.82,
    discount: 290,
    total: 2099,
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    orderStatus: 'PENDING',
    shippingAddress: {
      fullName: 'Vinay Kumar',
      phone: '9876543210',
      line1: '123, Luxury Tower',
      line2: 'Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
    },
    timeline: [
      { status: 'PENDING', title: 'Order Placed', description: 'Thank you for shopping at LuxeMarket! We have received your order.' }
    ]
  });
  console.log('✅ Orders seeded.');

  // 11. Seed Reviews
  console.log('⭐️ Seeding Reviews...');
  const pgReview = await prisma.review.create({
    data: {
      rating: 5,
      body: 'Excellent quality fabric! Fitting is perfect.',
      status: 'APPROVED',
      productId: dbProducts[1].postgresId!,
      userId: customerUser.id,
    }
  });

  await Review.create({
    productId: dbProducts[1]._id,
    postgresProductId: dbProducts[1].postgresId!,
    productName: dbProducts[1].name,
    customerId: c1._id,
    customerName: 'Vinay Kumar',
    rating: 5,
    body: 'Excellent quality fabric! Fitting is perfect.',
    status: 'APPROVED',
    postgresId: pgReview.id
  });
  console.log('✅ Reviews seeded.');

  // 12. Seed Notifications
  console.log('🔔 Seeding Notifications...');
  await Notification.create([
    { title: 'New Order Received', message: `Order ${orderId} has been successfully placed by Vinay Kumar.`, type: 'NEW_ORDER', metadata: { orderId } },
    { title: 'Low Stock Warning', message: 'Leather Weekend Duffle Bag is running low on stock (15 units remaining).', type: 'LOW_STOCK', metadata: { sku: 'BAG-LEATHER-003' } }
  ]);
  console.log('✅ Notifications seeded.');

  // Log Audit Log activity
  await AuditLog.create({
    adminId: primaryAdmin._id,
    adminName: primaryAdmin.name,
    action: 'SEED_DATABASE',
    details: 'Initial system database seed performed successfully.',
    ipAddress: '127.0.0.1'
  });

  console.log('🎉 Seeding script completed successfully! Exiting in 1s...');
  setTimeout(() => mongoose.connection.close(), 1000);
}

// Perform Seeding
connectMongoDB().then(() => {
  seed();
});
