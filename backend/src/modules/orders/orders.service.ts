import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/** OrdersService � Business logic for Orders feature */
@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}
}
