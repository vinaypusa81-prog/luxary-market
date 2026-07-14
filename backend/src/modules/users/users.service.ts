import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, name: true, phone: true, avatar: true,
        role: true, emailVerified: true, phoneVerified: true, createdAt: true,
        updatedAt: true, lastLoginAt: true, isActive: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async updateProfile(id: string, data: { name?: string; phone?: string; avatar?: string }) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async getAddresses(userId: string) {
    return this.prisma.address.findMany({ where: { userId }, orderBy: { isDefault: 'desc' } });
  }

  async addAddress(userId: string, data: any) {
    if (data.isDefault) {
      await this.prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    return this.prisma.address.create({ data: { ...data, userId } });
  }

  async getOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true, payment: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
