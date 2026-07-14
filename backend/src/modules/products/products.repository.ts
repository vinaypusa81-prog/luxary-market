import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma, ProductStatus } from '@prisma/client';

/**
 * ProductsRepository — Data access layer for products following
 * the Repository Pattern. All DB queries live here; business logic in service.
 */
@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(params: {
    where?: Prisma.ProductWhereInput;
    orderBy?: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[];
    skip?: number;
    take?: number;
    include?: Prisma.ProductInclude;
  }) {
    return this.prisma.product.findMany({
      ...params,
      include: params.include ?? {
        brand: { select: { id: true, name: true, slug: true, logo: true } },
        category: { select: { id: true, name: true, slug: true } },
        variants: { where: { isActive: true }, orderBy: { price: 'asc' } },
        inventory: true,
      },
    });
  }

  async count(where?: Prisma.ProductWhereInput) {
    return this.prisma.product.count({ where });
  }

  async findBySlug(slug: string) {
    return this.prisma.product.findUnique({
      where: { slug },
      include: {
        brand: true,
        category: true,
        variants: { where: { isActive: true } },
        inventory: true,
        reviews: {
          where: { status: 'APPROVED' },
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        relatedProducts: {
          include: {
            related: {
              include: {
                brand: { select: { name: true } },
                variants: { take: 1 },
              },
            },
          },
          where: { type: 'related' },
          take: 8,
        },
        seller: { select: { id: true, businessName: true, rating: true } },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { variants: true, inventory: true },
    });
  }

  async create(data: Prisma.ProductCreateInput) {
    return this.prisma.product.create({ data, include: { variants: true } });
  }

  async update(id: string, data: Prisma.ProductUpdateInput) {
    return this.prisma.product.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }

  async incrementViewCount(productId: string) {
    return this.prisma.product.update({
      where: { id: productId },
      data: { viewCount: { increment: 1 } },
    });
  }

  async updateRating(productId: string) {
    const agg = await this.prisma.review.aggregate({
      where: { productId, status: 'APPROVED' },
      _avg: { rating: true },
      _count: { rating: true },
    });
    return this.prisma.product.update({
      where: { id: productId },
      data: {
        avgRating: agg._avg.rating || 0,
        reviewCount: agg._count.rating || 0,
      },
    });
  }
}
