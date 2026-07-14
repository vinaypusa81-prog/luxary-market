import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';

/**
 * LuxeMarket — NestJS Bootstrap
 * Configures security, validation, swagger, and starts the server.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'error', 'verbose'],
    bufferLogs: true,
  });
  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);
  const port = configService.get<number>('APP_PORT', 4000);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  // ── Security Headers ─────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: nodeEnv === 'production',
      crossOriginEmbedderPolicy: false,
    }),
  );

  // ── GZIP Compression ─────────────────────────────────────────
  app.use(compression());

  // ── CORS ─────────────────────────────────────────────────────
  app.enableCors({
    origin: configService.get<string>('APP_URL', 'http://localhost:3000'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // ── Global API Prefix ─────────────────────────────────────────
  app.setGlobalPrefix('api/v1', { exclude: ['health', 'graphql'] });

  // ── Global Validation Pipe ────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw on unknown properties
      transform: true, // Auto-transform payloads to DTO types
      transformOptions: {
        enableImplicitConversion: true,
      },
      stopAtFirstError: false,
    }),
  );

  // ── Swagger API Documentation ─────────────────────────────────
  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('LuxeMarket API')
      .setDescription(
        'Enterprise Fashion eCommerce REST API — Full documentation',
      )
      .setVersion('1.0.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
        'JWT-auth',
      )
      .addTag('Auth', 'Authentication & authorization endpoints')
      .addTag('Users', 'User management endpoints')
      .addTag('Products', 'Product catalog endpoints')
      .addTag('Categories', 'Category management endpoints')
      .addTag('Brands', 'Brand management endpoints')
      .addTag('Cart', 'Shopping cart endpoints')
      .addTag('Orders', 'Order management endpoints')
      .addTag('Payments', 'Payment processing endpoints')
      .addTag('Reviews', 'Product review endpoints')
      .addTag('Wishlist', 'Wishlist management endpoints')
      .addTag('Coupons', 'Coupon & discount endpoints')
      .addTag('Search', 'Search & discovery endpoints')
      .addTag('Notifications', 'Push & in-app notification endpoints')
      .addTag('Admin', 'Admin panel endpoints')
      .addTag('Seller', 'Seller portal endpoints')
      .addTag('Analytics', 'Analytics & reporting endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
      },
    });
    logger.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
  }

  // ── Graceful Shutdown ─────────────────────────────────────────
  app.enableShutdownHooks();

  await app.listen(port);
  logger.log(`🚀 LuxeMarket API running at: http://localhost:${port}/api/v1`);
  logger.log(`🌐 Environment: ${nodeEnv}`);
}

bootstrap();
