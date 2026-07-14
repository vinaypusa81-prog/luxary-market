import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/** SellerService � Business logic for Seller feature */
@Injectable()
export class SellerService {
  constructor(private readonly prisma: PrismaService) {}
}
