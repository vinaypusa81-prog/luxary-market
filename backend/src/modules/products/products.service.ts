import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFiltersDto } from './dto/product-filters.dto';
import { Prisma, ProductStatus, Role } from '@prisma/client';
import { slugify } from '../../common/utils/slugify';

/**
 * ProductsService — Business logic layer for product management.
 * Handles CRUD, filtering, sorting, and product-related operations.
 */
@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  // ── List Products with Advanced Filtering ─────────────────────

  async findAll(filters: ProductFiltersDto) {
    const {
      search, category, brand, minPrice, maxPrice,
      sizes, colors, material, discount, rating, inStock,
      sortBy = 'createdAt', sortOrder = 'desc',
      page = 1, limit = 24,
    } = filters;

    const where: Prisma.ProductWhereInput = {
      status: ProductStatus.ACTIVE,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { tags: { has: search } },
          { brand: { name: { contains: search, mode: 'insensitive' } } },
        ],
      }),
      ...(category && { category: { slug: category } }),
      ...(brand && { brand: { slug: brand } }),
      ...(minPrice !== undefined && { basePrice: { gte: minPrice } }),
      ...(maxPrice !== undefined && { basePrice: { lte: maxPrice } }),
      ...(colors?.length && { attributes: { path: ['color'], array_contains: colors } }),
      ...(material && { material: { contains: material, mode: 'insensitive' } }),
      ...(discount && { discountPercent: { gte: discount } }),
      ...(rating && { avgRating: { gte: rating } }),
      ...(inStock && { inventory: { availableStock: { gt: 0 } } }),
    };

    const orderBy = this.buildOrderBy(sortBy, sortOrder);
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.productsRepository.findMany({ where, orderBy, skip, take: limit }),
      this.productsRepository.count(where),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  // ── Get Single Product ────────────────────────────────────────

  async findBySlug(slug: string, userId?: string) {
    const product = await this.productsRepository.findBySlug(slug);
    if (!product || product.status !== ProductStatus.ACTIVE) {
      throw new NotFoundException(`Product "${slug}" not found`);
    }

    // Increment view count asynchronously
    this.productsRepository.incrementViewCount(product.id).catch(() => {});

    return product;
  }

  // ── Create Product ────────────────────────────────────────────

  async create(dto: CreateProductDto, userId: string, role: Role) {
    const slug = await this.generateUniqueSlug(dto.name);

    const data: Prisma.ProductCreateInput = {
      name: dto.name,
      slug,
      description: dto.description,
      shortDesc: dto.shortDesc,
      sku: dto.sku || `SKU-${Date.now()}`,
      barcode: dto.barcode,
      basePrice: dto.basePrice,
      salePrice: dto.salePrice,
      discountPercent: dto.salePrice ? ((dto.basePrice - dto.salePrice) / dto.basePrice) * 100 : null,
      taxRate: dto.taxRate || 18.0,
      images: dto.images || [],
      tags: dto.tags || [],
      material: dto.material,
      attributes: dto.attributes,
      metaTitle: dto.metaTitle || dto.name,
      metaDesc: dto.metaDesc || dto.shortDesc,
      status: role === Role.ADMIN ? ProductStatus.ACTIVE : ProductStatus.DRAFT,
      category: { connect: { id: dto.categoryId } },
      ...(dto.brandId && { brand: { connect: { id: dto.brandId } } }),
      ...(dto.sellerId && { seller: { connect: { id: dto.sellerId } } }),
      // Create inventory record
      inventory: {
        create: {
          totalStock: dto.stock || 0,
          availableStock: dto.stock || 0,
          reservedStock: 0,
        },
      },
      // Create variants if provided
      ...(dto.variants?.length && {
        variants: {
          create: dto.variants.map((v) => ({
            sku: v.sku || `${dto.sku || 'SKU'}-${v.color || ''}-${v.size || ''}`,
            name: v.name,
            color: v.color,
            size: v.size,
            price: v.price,
            salePrice: v.salePrice,
            stock: v.stock || 0,
            images: v.images || [],
          })),
        },
      }),
    };

    return this.productsRepository.create(data);
  }

  // ── Update Product ────────────────────────────────────────────

  async update(id: string, dto: UpdateProductDto, userId: string, role: Role) {
    const product = await this.productsRepository.findById(id);
    if (!product) throw new NotFoundException('Product not found');

    // Sellers can only update their own products
    if (role === Role.SELLER && product.sellerId !== userId) {
      throw new ForbiddenException('You can only update your own products');
    }

    const data: Prisma.ProductUpdateInput = {
      ...(dto.name && { name: dto.name }),
      ...(dto.description && { description: dto.description }),
      ...(dto.basePrice && { basePrice: dto.basePrice }),
      ...(dto.salePrice !== undefined && {
        salePrice: dto.salePrice,
        discountPercent: dto.salePrice && dto.basePrice
          ? ((dto.basePrice - dto.salePrice) / dto.basePrice) * 100
          : null,
      }),
      ...(dto.images && { images: dto.images }),
      ...(dto.status && { status: dto.status as ProductStatus }),
      ...(dto.tags && { tags: dto.tags }),
    };

    return this.productsRepository.update(id, data);
  }

  // ── Delete Product ────────────────────────────────────────────

  async remove(id: string) {
    const product = await this.productsRepository.findById(id);
    if (!product) throw new NotFoundException('Product not found');

    // Soft delete by archiving
    return this.productsRepository.update(id, { status: ProductStatus.ARCHIVED });
  }

  // ── Get Trending Products ─────────────────────────────────────

  async getTrending(limit = 12) {
    return this.productsRepository.findMany({
      where: { status: ProductStatus.ACTIVE, isTrending: true },
      orderBy: { soldCount: 'desc' },
      take: limit,
    });
  }

  // ── Get New Arrivals ──────────────────────────────────────────

  async getNewArrivals(limit = 12) {
    return this.productsRepository.findMany({
      where: { status: ProductStatus.ACTIVE, isNew: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // ── Get Featured Products ─────────────────────────────────────

  async getFeatured(limit = 12) {
    return this.productsRepository.findMany({
      where: { status: ProductStatus.ACTIVE, isFeatured: true },
      orderBy: { avgRating: 'desc' },
      take: limit,
    });
  }

  // ── Private Helpers ────────────────────────────────────────────

  private buildOrderBy(sortBy: string, sortOrder: string) {
    const dir = sortOrder === 'asc' ? 'asc' : 'desc';
    const sortMap: Record<string, Prisma.ProductOrderByWithRelationInput> = {
      price: { basePrice: dir },
      rating: { avgRating: dir },
      newest: { createdAt: 'desc' },
      popularity: { soldCount: 'desc' },
      discount: { discountPercent: 'desc' },
      relevance: { viewCount: 'desc' },
    };
    return sortMap[sortBy] || { createdAt: dir };
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    let slug = slugify(name);
    let suffix = 0;
    while (true) {
      const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
      const existing = await this.productsRepository.count({ slug: candidate } as any);
      if (!existing) return candidate;
      suffix++;
    }
  }
}
