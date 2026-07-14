import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/** CategoriesService — Business logic for Categories feature */
@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}
}
