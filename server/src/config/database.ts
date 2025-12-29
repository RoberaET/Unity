import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client Instance
 * 
 * PRODUCTION CONSIDERATIONS:
 * - Connection pooling handled by Prisma automatically
 * - Singleton pattern ensures one client instance
 * - Graceful shutdown implemented in server index.ts
 */

const prisma = new PrismaClient({
    log: ['error', 'warn'],
});

export default prisma;
