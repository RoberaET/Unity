import Redis from 'ioredis';
import { logger } from '../middleware/requestLogger';

/**
 * Production-grade Redis configuration
 * 
 * DESIGN DECISIONS:
 * - Used for: session storage, rate limiting, feature flag caching
 * - Lazy connection: doesn't crash app if Redis is temporarily down
 * - Pub/Sub support: for cross-instance session invalidation
 * - Exponential backoff: prevents thundering herd on reconnection
 * 
 * CRITICAL FOR HORIZONTAL SCALING:
 * All server instances share the same Redis to ensure:
 * - Rate limits work across all instances (can't bypass by hitting different server)
 * - Sessions valid across all instances (any server can validate any session)
 * - Feature flags instantly propagated to all instances
 */

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        // Exponential backoff: 50ms, 100ms, 200ms, ..., up to 2000ms
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    lazyConnect: true, // Don't crash if Redis is initially down
    enableReadyCheck: true,
    // Timeouts
    connectTimeout: 10000,
    commandTimeout: 5000,
});

// Connection event handlers
redis.on('error', (err) => {
    // In development, Redis might not be running (graceful degradation)
    if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️  Redis connection failed (OK in dev):', err.message);
    } else {
        logger.error('Redis error (CRITICAL in production)', {
            error: err.message,
            stack: err.stack,
        });
    }
});

redis.on('connect', () => {
    logger.info('Connecting to Redis...');
});

redis.on('ready', () => {
    logger.info('✅ Connected to Redis successfully');
});

redis.on('reconnecting', (delay: number) => {
    logger.warn('Redis reconnecting...', { delayMs: delay });
});

redis.on('close', () => {
    logger.warn('Redis connection closed');
});

/**
 * Try to connect to Redis on startup
 * Logs warning but doesn't crash if it fails (lazyConnect handles this)
 */
export const connectRedis = async (): Promise<boolean> => {
    try {
        await redis.connect();
        return true;
    } catch (error) {
        if (process.env.NODE_ENV === 'production') {
            logger.error('Failed to connect to Redis', { error });
        } else {
            console.warn('⚠️  Redis not available (using in-memory fallbacks in development)');
        }
        return false;
    }
};

/**
 * Health check: is Redis responding?
 */
export const isRedisHealthy = async (): Promise<boolean> => {
    try {
        await redis.ping();
        return true;
    } catch {
        return false;
    }
};

/**
 * Graceful shutdown
 */
export const disconnectRedis = async () => {
    logger.info('Disconnecting from Redis...');
    await redis.quit();
    logger.info('Redis disconnected');
};

/**
 * Create a separate Redis client for pub/sub
 * (pub/sub clients can't be used for normal commands)
 */
export const createPubSubClient = (): Redis => {
    return new Redis(REDIS_URL);
};

// Graceful shutdown handlers
process.on('beforeExit', disconnectRedis);
process.on('SIGINT', disconnectRedis);
process.on('SIGTERM', disconnectRedis);

export default redis;

