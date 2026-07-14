import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

/**
 * PrismaService — Singleton Prisma client with connection lifecycle management,
 * query logging in development, and graceful shutdown handling.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly configService: ConfigService) {
    super({
      log:
        configService.get('NODE_ENV') === 'development'
          ? [
              { emit: 'event', level: 'query' },
              { emit: 'stdout', level: 'error' },
              { emit: 'stdout', level: 'warn' },
            ]
          : ['error'],
      errorFormat: 'pretty',
    });

    // Register database synchronization middleware to notify Admin Express Server

    this.$use(async (params, next) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await next(params);

      if (
        params.model &&
        ['User', 'Order', 'Review'].includes(params.model) &&
        ['create', 'update'].includes(params.action)
      ) {
        const syncSecret =
          this.configService.get<string>('STORE_SYNC_SECRET') ||
          'your-store-sync-webhook-secret-change-in-production';
        const syncUrl = 'http://localhost:5001/api/sync/webhook';

        fetch(syncUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-sync-secret': syncSecret,
          },
          body: JSON.stringify({
            model: params.model,
            action: params.action,
            data: result as unknown,
          }),
        }).catch((err: unknown) => {
          const errorMsg = err instanceof Error ? err.message : String(err);
          // Silent catch to prevent catalog write blocking
          this.logger.error(
            `❌ Sync webhook failed for ${params.model}: ${errorMsg}`,
          );
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return result;
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Database connected');
    } catch (error) {
      this.logger.error('❌ Database connection failed', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }

  /**
   * Clean the database (only for testing environments)
   */
  async cleanDatabase() {
    if (this.configService.get('NODE_ENV') !== 'test') {
      throw new Error('cleanDatabase() can only be called in test environment');
    }
    const tablenames = await this.$queryRaw<{ tablename: string }[]>`
      SELECT tablename FROM pg_tables
      WHERE schemaname='public'
    `;
    await this.$executeRaw`SET session_replication_role = 'replica'`;
    for (const { tablename } of tablenames) {
      await this.$executeRawUnsafe(
        `TRUNCATE TABLE "public"."${tablename}" CASCADE`,
      );
    }
    await this.$executeRaw`SET session_replication_role = 'origin'`;
  }
}
