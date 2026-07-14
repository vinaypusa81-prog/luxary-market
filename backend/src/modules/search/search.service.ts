import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/** SearchService — Business logic for Search feature */
@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}
}
