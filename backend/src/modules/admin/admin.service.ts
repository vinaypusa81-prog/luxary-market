import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/** AdminService � Business logic for Admin feature */
@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}
}
