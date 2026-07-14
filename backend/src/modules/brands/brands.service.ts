import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/** BrandsService — Business logic for Brands feature */
@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) {}
}
