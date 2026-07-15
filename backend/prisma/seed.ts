import { PrismaClient, Role, ProductStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed database script...');

  // ── 1. Clean Database (optional but helpful) ─────────────────
  // We clean tables in reverse order of foreign keys
  await prisma.review.deleteMany().catch(() => {});
  await prisma.cartItem.deleteMany().catch(() => {});
  await prisma.wishlistItem.deleteMany().catch(() => {});
  await prisma.orderItem.deleteMany().catch(() => {});
  await prisma.order.deleteMany().catch(() => {});
  await prisma.inventory.deleteMany().catch(() => {});
  await prisma.productVariant.deleteMany().catch(() => {});
  await prisma.product.deleteMany().catch(() => {});
  await prisma.category.deleteMany().catch(() => {});
  await prisma.brand.deleteMany().catch(() => {});
  await prisma.wallet.deleteMany().catch(() => {});
  await prisma.rewardPoints.deleteMany().catch(() => {});
  await prisma.user.deleteMany().catch(() => {});

  // ── 2. Create Users ──────────────────────────────────────────
  console.log('Creating users...');
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash('SecurePass123!', salt);

  const admin = await prisma.user.create({
    data: {
      name: 'LuxeMarket Admin',
      email: 'admin@luxemarket.com',
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
      emailVerified: new Date(),
      wallet: { create: { balance: 100000 } },
      rewardPoints: { create: { points: 1000, lifetimeEarned: 1000 } },
    },
  });

  const seller = await prisma.user.create({
    data: {
      name: 'ForceStyle Fashion',
      email: 'seller@forcestyle.com',
      passwordHash,
      role: Role.SELLER,
      isActive: true,
      emailVerified: new Date(),
      seller: {
        create: {
          businessName: 'ForceStyle Apparel Ltd',
          businessEmail: 'seller@forcestyle.com',
          gstin: '27AAAAA1111A1Z1',
          panNumber: 'ABCDE1234F',
          status: 'ACTIVE',
          bankAccount: {
            accountNumber: '1234567890',
            ifsc: 'HDFC0000123',
            bankName: 'HDFC Bank',
          },
        },
      },
    },
  });

  const sellerRecord = await prisma.seller.findUnique({
    where: { userId: seller.id },
  });

  if (!sellerRecord) {
    throw new Error('Seller record was not created successfully');
  }

  const customer = await prisma.user.create({
    data: {
      name: 'Vinay Kumar',
      email: 'vinay@example.com',
      passwordHash,
      role: Role.CUSTOMER,
      isActive: true,
      emailVerified: new Date(),
      wallet: { create: { balance: 5000 } },
      rewardPoints: { create: { points: 250, lifetimeEarned: 250 } },
      addresses: {
        create: [
          {
            fullName: 'Vinay Kumar',
            phone: '9876543210',
            line1: '123, Luxury Tower',
            line2: 'Bandra West',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400050',
            isDefault: true,
          },
        ],
      },
    },
  });

  // ── 3. Create Categories ──────────────────────────────────────
  console.log('Creating categories...');
  const womenCat = await prisma.category.create({
    data: { name: 'Women', slug: 'women', description: 'Women clothing and couture' },
  });

  const menCat = await prisma.category.create({
    data: { name: 'Men', slug: 'men', description: 'Men tailored styles' },
  });

  // ── 4. Create Brands ──────────────────────────────────────────
  console.log('Creating brands...');
  const brand1 = await prisma.brand.create({
    data: { name: 'ForceStyle', slug: 'forcestyle', description: 'Urban premium wear' },
  });

  const brand2 = await prisma.brand.create({
    data: { name: 'Royal Weaves', slug: 'royal-weaves', description: 'Fine handcrafted traditional ethnic styles' },
  });

  // ── 5. Create Products & Variants & Inventory ────────────────
  console.log('Creating products, variants and inventory...');

  // Product 1: Men's Knit Polo
  const p1 = await prisma.product.create({
    data: {
      name: 'Slim Fit Knit Polo Shirt',
      slug: 'slim-fit-knit-polo-shirt',
      description: 'Upgrade your smart-casual look with this knit polo shirt. Features short sleeves, structured collar, and soft organic cotton build.',
      shortDesc: 'Premium organic cotton knit polo shirt.',
      basePrice: 1899,
      salePrice: 1139,
      discountPercent: 40,
      sku: 'POLO-KNIT-001',
      images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'],
      status: ProductStatus.ACTIVE,
      isTrending: true,
      categoryId: menCat.id,
      brandId: brand1.id,
      sellerId: sellerRecord.id,
      inventory: {
        create: { totalStock: 100, availableStock: 100, reservedStock: 0 },
      },
      variants: {
        create: [
          { name: 'Knit Polo - Blue / S', sku: 'POLO-KNIT-BLUE-S', price: 1899, salePrice: 1139, color: 'Blue', size: 'S', stock: 30 },
          { name: 'Knit Polo - Blue / M', sku: 'POLO-KNIT-BLUE-M', price: 1899, salePrice: 1139, color: 'Blue', size: 'M', stock: 40 },
          { name: 'Knit Polo - Black / L', sku: 'POLO-KNIT-BLK-L', price: 1899, salePrice: 1139, color: 'Black', size: 'L', stock: 30 },
        ],
      },
    },
  });

  // Product 2: Women's Anarkali Suit Set
  const p2 = await prisma.product.create({
    data: {
      name: 'Embellished Silk Anarkali Suit Set',
      slug: 'embellished-silk-anarkali-suit-set',
      description: 'Experience absolute luxury with this Banarasi silk Anarkali set. Adorned with hand zari embroidery and chiffon dupatta.',
      shortDesc: 'Banarasi silk ethnic kurta set.',
      basePrice: 12999,
      salePrice: 7799,
      discountPercent: 40,
      sku: 'ANAR-SILK-002',
      images: ['https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80'],
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      categoryId: womenCat.id,
      brandId: brand2.id,
      sellerId: sellerRecord.id,
      inventory: {
        create: { totalStock: 45, availableStock: 45, reservedStock: 0 },
      },
      variants: {
        create: [
          { name: 'Anarkali Set - Gold / M', sku: 'ANAR-GLD-M', price: 12999, salePrice: 7799, color: 'Gold', size: 'M', stock: 20 },
          { name: 'Anarkali Set - Gold / L', sku: 'ANAR-GLD-L', price: 12999, salePrice: 7799, color: 'Gold', size: 'L', stock: 25 },
        ],
      },
    },
  });

  // ── 6. Create Reviews ─────────────────────────────────────────
  console.log('Creating reviews...');
  await prisma.review.create({
    data: {
      rating: 5,
      body: 'Excellent quality fabric! Fitting is perfect.',
      status: 'APPROVED',
      productId: p2.id,
      userId: customer.id,
    },
  });

  console.log('✅ Seed database script completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
