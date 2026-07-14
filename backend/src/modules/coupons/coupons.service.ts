import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/** CouponsService � Business logic for Coupons feature */
@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}
}
