import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/** ReviewsService — Business logic for Reviews feature */
@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}
}
