import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/** NotificationsService � Business logic for Notifications feature */
@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}
}
