import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

// Test connection
prisma.$connect()
  .then(() => {
    console.log('🐘 PostgreSQL (Prisma) connected successfully.');
  })
  .catch((err: any) => {
    console.error('❌ PostgreSQL connection error:', err);
  });
