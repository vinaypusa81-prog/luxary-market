import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/** PaymentsService — Business logic for Payments feature */
@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}
}
