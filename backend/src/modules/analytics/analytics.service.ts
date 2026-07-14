import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/** AnalyticsService � Business logic for Analytics feature */
@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}
}
