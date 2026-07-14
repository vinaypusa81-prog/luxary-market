import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['ADMIN', 'MANAGER', 'EDITOR']).optional(),
  }),
});

export const productSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    category: z.string().min(2, 'Category is required'),
    brand: z.string().optional(),
    sku: z.string().min(2, 'SKU is required'),
    price: z.number().positive('Price must be greater than 0'),
    discountPrice: z.number().nonnegative().optional(),
    quantity: z.number().int().nonnegative().default(0),
    images: z.array(z.string()).optional(),
    thumbnail: z.string().optional(),
    color: z.array(z.string()).optional(),
    size: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    isFeatured: z.boolean().optional(),
    isTrending: z.boolean().optional(),
    isNewArrival: z.boolean().optional(),
    isBestSeller: z.boolean().optional(),
    shippingWeight: z.number().optional(),
    dimensions: z.object({
      length: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional()
    }).optional(),
    warranty: z.string().optional(),
    status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED', 'OUT_OF_STOCK']).optional(),
  }),
});

export const categorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required'),
    slug: z.string().min(2, 'Slug is required'),
    description: z.string().optional(),
    image: z.string().optional(),
    parentId: z.string().nullable().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
});

export const brandSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required'),
    slug: z.string().min(2, 'Slug is required'),
    logo: z.string().optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const couponSchema = z.object({
  body: z.object({
    code: z.string().min(2, 'Code must be at least 2 characters'),
    discountType: z.enum(['PERCENTAGE', 'FIXED']),
    discountValue: z.number().positive('Value must be positive'),
    minOrderAmount: z.number().nonnegative().optional(),
    maxDiscountAmount: z.number().nonnegative().optional(),
    expiryDate: z.string().transform((val) => new Date(val)),
    usageLimit: z.number().int().positive().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const bannerSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title is required'),
    image: z.string().min(2, 'Image is required'),
    type: z.enum(['SLIDER', 'HERO', 'OFFER', 'SIDEBAR']).optional(),
    link: z.string().optional(),
    order: z.number().int().optional(),
    isActive: z.boolean().optional(),
  }),
});
