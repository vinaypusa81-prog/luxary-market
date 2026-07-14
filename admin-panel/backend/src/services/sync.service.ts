import { prisma } from '../config/prisma';
import { ProductStatus as PrismaProductStatus, OrderStatus as PrismaOrderStatus, PaymentStatus as PrismaPaymentStatus, PaymentMethod as PrismaPaymentMethod } from '@prisma/client';
import { slugify } from '../utils/slugify';

export class SyncService {
  // ── Sync Category ───────────────────────────────────────────
  static async syncCategoryToPostgres(mongoCategory: any) {
    try {
      console.log(`🔄 Syncing Category to Postgres: ${mongoCategory.name}`);
      const pgCategory = await prisma.category.upsert({
        where: { slug: mongoCategory.slug },
        update: {
          name: mongoCategory.name,
          description: mongoCategory.description,
          image: mongoCategory.image,
          isActive: mongoCategory.status === 'ACTIVE',
        },
        create: {
          name: mongoCategory.name,
          slug: mongoCategory.slug,
          description: mongoCategory.description,
          image: mongoCategory.image,
          isActive: mongoCategory.status === 'ACTIVE',
        },
      });

      // Update Mongo category with PG ID
      if (mongoCategory.postgresId !== pgCategory.id) {
        mongoCategory.postgresId = pgCategory.id;
        await mongoCategory.save();
      }
      return pgCategory.id;
    } catch (err: any) {
      console.error('❌ Error syncing Category to Postgres:', err.message);
      return null;
    }
  }

  // ── Sync Brand ──────────────────────────────────────────────
  static async syncBrandToPostgres(mongoBrand: any) {
    try {
      console.log(`🔄 Syncing Brand to Postgres: ${mongoBrand.name}`);
      const pgBrand = await prisma.brand.upsert({
        where: { slug: mongoBrand.slug },
        update: {
          name: mongoBrand.name,
          logo: mongoBrand.logo,
          description: mongoBrand.description,
          isActive: mongoBrand.isActive,
        },
        create: {
          name: mongoBrand.name,
          slug: mongoBrand.slug,
          logo: mongoBrand.logo,
          description: mongoBrand.description,
          isActive: mongoBrand.isActive,
        },
      });

      if (mongoBrand.postgresId !== pgBrand.id) {
        mongoBrand.postgresId = pgBrand.id;
        await mongoBrand.save();
      }
      return pgBrand.id;
    } catch (err: any) {
      console.error('❌ Error syncing Brand to Postgres:', err.message);
      return null;
    }
  }

  // ── Sync Product ────────────────────────────────────────────
  static async syncProductToPostgres(mongoProduct: any) {
    try {
      console.log(`🔄 Syncing Product to Postgres: ${mongoProduct.name} (SKU: ${mongoProduct.sku})`);

      // 1. Get or sync category
      let pgCategoryId = mongoProduct.categoryId;
      if (!pgCategoryId) {
        const pgCategory = await prisma.category.findUnique({
          where: { slug: slugify(mongoProduct.category) }
        });
        if (pgCategory) {
          pgCategoryId = pgCategory.id;
        } else {
          // Create temp category in Postgres
          const newPgCat = await prisma.category.create({
            data: {
              name: mongoProduct.category,
              slug: slugify(mongoProduct.category),
              isActive: true
            }
          });
          pgCategoryId = newPgCat.id;
        }
        mongoProduct.categoryId = pgCategoryId;
        await mongoProduct.save();
      }

      // 2. Get or sync brand
      let pgBrandId = mongoProduct.brandId;
      if (mongoProduct.brand && !pgBrandId) {
        const pgBrand = await prisma.brand.findUnique({
          where: { slug: slugify(mongoProduct.brand) }
        });
        if (pgBrand) {
          pgBrandId = pgBrand.id;
        } else {
          const newPgBrand = await prisma.brand.create({
            data: {
              name: mongoProduct.brand,
              slug: slugify(mongoProduct.brand),
              isActive: true
            }
          });
          pgBrandId = newPgBrand.id;
        }
        mongoProduct.brandId = pgBrandId;
        await mongoProduct.save();
      }

      // Map product statuses
      let status: PrismaProductStatus = PrismaProductStatus.DRAFT;
      if (mongoProduct.status === 'ACTIVE') status = PrismaProductStatus.ACTIVE;
      else if (mongoProduct.status === 'INACTIVE') status = PrismaProductStatus.INACTIVE;
      else if (mongoProduct.status === 'ARCHIVED') status = PrismaProductStatus.ARCHIVED;
      else if (mongoProduct.status === 'OUT_OF_STOCK') status = PrismaProductStatus.OUT_OF_STOCK;

      // 3. Upsert product
      const pgProduct = await prisma.product.upsert({
        where: { sku: mongoProduct.sku },
        update: {
          name: mongoProduct.name,
          description: mongoProduct.description,
          basePrice: mongoProduct.price,
          salePrice: mongoProduct.discountPrice || null,
          discountPercent: mongoProduct.discountPrice ? Math.round(((mongoProduct.price - mongoProduct.discountPrice) / mongoProduct.price) * 100) : null,
          status,
          images: mongoProduct.images || [],
          tags: mongoProduct.tags || [],
          isFeatured: mongoProduct.isFeatured || false,
          isTrending: mongoProduct.isTrending || false,
          isNew: mongoProduct.isNewArrival || false,
          categoryId: pgCategoryId,
          brandId: pgBrandId || null,
          weight: mongoProduct.shippingWeight || null,
          dimensions: mongoProduct.dimensions ? mongoProduct.dimensions : undefined,
        },
        create: {
          name: mongoProduct.name,
          slug: slugify(mongoProduct.name),
          sku: mongoProduct.sku,
          description: mongoProduct.description,
          basePrice: mongoProduct.price,
          salePrice: mongoProduct.discountPrice || null,
          discountPercent: mongoProduct.discountPrice ? Math.round(((mongoProduct.price - mongoProduct.discountPrice) / mongoProduct.price) * 100) : null,
          status,
          images: mongoProduct.images || [],
          tags: mongoProduct.tags || [],
          isFeatured: mongoProduct.isFeatured || false,
          isTrending: mongoProduct.isTrending || false,
          isNew: mongoProduct.isNewArrival || false,
          categoryId: pgCategoryId,
          brandId: pgBrandId || null,
          weight: mongoProduct.shippingWeight || null,
          dimensions: mongoProduct.dimensions ? mongoProduct.dimensions : undefined,
        },
      });

      // Upsert Inventory in Postgres
      await prisma.inventory.upsert({
        where: { productId: pgProduct.id },
        update: {
          availableStock: mongoProduct.quantity,
          totalStock: mongoProduct.quantity,
        },
        create: {
          productId: pgProduct.id,
          availableStock: mongoProduct.quantity,
          totalStock: mongoProduct.quantity,
        },
      });

      if (mongoProduct.postgresId !== pgProduct.id) {
        mongoProduct.postgresId = pgProduct.id;
        await mongoProduct.save();
      }

      console.log(`✅ Product synced to Postgres: ${pgProduct.id}`);
      return pgProduct.id;
    } catch (err: any) {
      console.error('❌ Error syncing Product to Postgres:', err);
      return null;
    }
  }

  // ── Delete Product from Postgres ────────────────────────────
  static async deleteProductFromPostgres(sku: string) {
    try {
      console.log(`🔄 Deleting Product from Postgres (SKU: ${sku})`);
      const pgProduct = await prisma.product.findUnique({ where: { sku } });
      if (pgProduct) {
        // Soft delete / Archive in Postgres
        await prisma.product.update({
          where: { id: pgProduct.id },
          data: { status: PrismaProductStatus.ARCHIVED },
        });
        console.log(`✅ Archived product in Postgres: ${pgProduct.id}`);
      }
    } catch (err: any) {
      console.error('❌ Error deleting/archiving Product from Postgres:', err.message);
    }
  }

  // ── Sync Order Status to Postgres ───────────────────────────
  static async syncOrderStatusToPostgres(orderId: string, status: string, paymentStatus?: string) {
    try {
      console.log(`🔄 Syncing Order Status to Postgres for orderId: ${orderId}`);
      
      // Map statuses
      let orderStatus: PrismaOrderStatus = PrismaOrderStatus.PENDING;
      if (status === 'CONFIRMED') orderStatus = PrismaOrderStatus.CONFIRMED;
      else if (status === 'PACKED') orderStatus = PrismaOrderStatus.PROCESSING;
      else if (status === 'SHIPPED') orderStatus = PrismaOrderStatus.SHIPPED;
      else if (status === 'OUT_FOR_DELIVERY') orderStatus = PrismaOrderStatus.OUT_FOR_DELIVERY;
      else if (status === 'DELIVERED') orderStatus = PrismaOrderStatus.DELIVERED;
      else if (status === 'CANCELLED') orderStatus = PrismaOrderStatus.CANCELLED;
      else if (status === 'REFUNDED') orderStatus = PrismaOrderStatus.REFUNDED;

      const updateData: any = { orderStatus };
      
      if (paymentStatus) {
        let payStatus: PrismaPaymentStatus = PrismaPaymentStatus.PENDING;
        if (paymentStatus === 'COMPLETED') payStatus = PrismaPaymentStatus.COMPLETED;
        else if (paymentStatus === 'FAILED') payStatus = PrismaPaymentStatus.FAILED;
        else if (paymentStatus === 'REFUNDED') payStatus = PrismaPaymentStatus.REFUNDED;
        updateData.paymentStatus = payStatus;
      }

      const pgOrder = await prisma.order.findUnique({
        where: { orderNumber: orderId }
      });

      if (pgOrder) {
        await prisma.order.update({
          where: { id: pgOrder.id },
          data: updateData
        });
        console.log(`✅ Order status updated in Postgres: ${pgOrder.id}`);
      }
    } catch (err: any) {
      console.error('❌ Error updating Order status in Postgres:', err.message);
    }
  }

  // ── Sync Coupon to Postgres ─────────────────────────────────
  static async syncCouponToPostgres(mongoCoupon: any) {
    try {
      console.log(`🔄 Syncing Coupon to Postgres: ${mongoCoupon.code}`);
      const pgCoupon = await prisma.coupon.upsert({
        where: { code: mongoCoupon.code },
        update: {
          name: mongoCoupon.code,
          type: mongoCoupon.discountType === 'PERCENTAGE' ? 'PERCENTAGE' : 'FIXED_AMOUNT',
          value: mongoCoupon.discountValue,
          minOrderAmount: mongoCoupon.minOrderAmount,
          maxDiscount: mongoCoupon.maxDiscountAmount || null,
          expiresAt: mongoCoupon.expiryDate,
          usageLimit: mongoCoupon.usageLimit,
          isActive: mongoCoupon.isActive,
        },
        create: {
          code: mongoCoupon.code,
          name: mongoCoupon.code,
          type: mongoCoupon.discountType === 'PERCENTAGE' ? 'PERCENTAGE' : 'FIXED_AMOUNT',
          value: mongoCoupon.discountValue,
          minOrderAmount: mongoCoupon.minOrderAmount,
          maxDiscount: mongoCoupon.maxDiscountAmount || null,
          expiresAt: mongoCoupon.expiryDate,
          usageLimit: mongoCoupon.usageLimit,
          isActive: mongoCoupon.isActive,
        },
      });

      if (mongoCoupon.postgresId !== pgCoupon.id) {
        mongoCoupon.postgresId = pgCoupon.id;
        await mongoCoupon.save();
      }
      return pgCoupon.id;
    } catch (err: any) {
      console.error('❌ Error syncing Coupon to Postgres:', err.message);
      return null;
    }
  }
}
