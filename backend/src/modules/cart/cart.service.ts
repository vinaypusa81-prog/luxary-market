import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/** CartService � Business logic for Cart feature */
@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}
}
