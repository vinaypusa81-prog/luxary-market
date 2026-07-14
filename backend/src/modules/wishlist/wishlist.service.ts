import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/** WishlistService � Business logic for Wishlist feature */
@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}
}
