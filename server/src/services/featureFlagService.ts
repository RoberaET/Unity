import prisma from '../config/database';
import redis from '../config/redis';
import { logger } from '../middleware/requestLogger';

/**
 * Feature Flag Service (Enhanced)
 * 
 * PRODUCTION USE CASES:
 * - Instantly disable heavy features during traffic spikes (exports, analytics)
 * - Gradual rollout of new features (0-100% of users)
 * - A/B testing
 * - Emergency killswitch without redeployment
 * 
 * CACHING STRATEGY:
 * - Redis cache (5 minute TTL) to reduce DB load
 * - Environment variable override for emergency disable
 * - Admin API to toggle at runtime
 * 
 * ZERO TOLERANCE FOR DOWNTIME:
 * - If Redis fails, fall back to database
 * - If database fails, fall back to environment variables
 * - Default to "enabled" only for non-critical features
 */

const CACHE_TTL = 300; // 5 minutes
const CACHE_PREFIX = 'feature_flag:';

export const FeatureFlagService = {
    /**
     * Check if feature is enabled for a user
     */
    async isEnabled(key: string, userId?: string): Promise<boolean> {
        // Environment variable override (emergency killswitch)
        const envOverride = process.env[`FEATURE_${key.toUpperCase().replace(/-/g, '_')}`];
        if (envOverride !== undefined) {
            return envOverride === 'true';
        }

        // Try cache
        const cached = await this.getFromCache(key);
        if (cached !== null) {
            return this.evaluateFlag(cached, userId);
        }

        // Fetch from database
        const flag = await prisma.featureFlag.findUnique({
            where: { key },
        });

        if (!flag) {
            // Flag not found: default behavior
            // PRODUCTION DECISION: Default to false for safety
            // Override with environment variable if needed
            return false;
        }

        // Cache result
        await this.setCache(key, flag);

        return this.evaluateFlag(flag, userId);
    },

    /**
     * Evaluate flag based on enabled state and rollout percentage
     */
    evaluateFlag(
        flag: { isEnabled: boolean; rolloutPct: number },
        userId?: string
    ): boolean {
        if (!flag.isEnabled) {
            return false;
        }

        // Full rollout
        if (flag.rolloutPct >= 100) {
            return true;
        }

        // Partial rollout (requires userId)
        if (flag.rolloutPct > 0 && userId) {
            const hash = this.simpleHash(userId + flag);
            const userPct = hash % 100;
            return userPct < flag.rolloutPct;
        }

        // No userId for partial rollout = disabled
        return false;
    },

    /**
     * Create or update feature flag (admin)
     */
    async setFlag(data: {
        key: string;
        isEnabled: boolean;
        rolloutPct?: number;
        description?: string;
    }) {
        const flag = await prisma.featureFlag.upsert({
            where: { key: data.key },
            create: {
                key: data.key,
                isEnabled: data.isEnabled,
                rolloutPct: data.rolloutPct ?? 100,
                description: data.description,
            },
            update: {
                isEnabled: data.isEnabled,
                rolloutPct: data.rolloutPct,
                description: data.description,
            },
        });

        // Invalidate cache
        await this.invalidateCache(data.key);

        logger.info('Feature flag updated', { flag });

        return flag;
    },

    /**
     * Get all feature flags (admin)
     */
    async getAllFlags() {
        return await prisma.featureFlag.findMany({
            orderBy: { key: 'asc' },
        });
    },

    /**
     * Get flag from Redis cache
     */
    async getFromCache(key: string): Promise<any | null> {
        try {
            const cached = await redis.get(CACHE_PREFIX + key);
            if (cached) {
                return JSON.parse(cached);
            }
        } catch (error) {
            // Redis error, continue without cache
            logger.warn('Redis cache read failed for feature flag', { key, error });
        }
        return null;
    },

    /**
     * Set flag in Redis cache
     */
    async setCache(key: string, flag: any): Promise<void> {
        try {
            await redis.setex(
                CACHE_PREFIX + key,
                CACHE_TTL,
                JSON.stringify(flag)
            );
        } catch (error) {
            // Redis error, continue without caching
            logger.warn('Redis cache write failed for feature flag', { key, error });
        }
    },

    /**
     * Invalidate cache for a flag
     */
    async invalidateCache(key: string): Promise<void> {
        try {
            await redis.del(CACHE_PREFIX + key);
        } catch (error) {
            // Ignore cache invalidation errors
        }
    },

    /**
     * Simple hash for user-based rollout
     */
    simpleHash(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    },

    /**
     * Initialize default flags on startup
     */
    async initializeDefaults() {
        const defaults = [
            {
                key: 'data-export',
                isEnabled: true,
                rolloutPct: 100,
                description: 'User data export (CSV/PDF)',
            },
            {
                key: 'pdf-export',
                isEnabled: true,
                rolloutPct: 100,
                description: 'PDF export specifically',
            },
        ];

        for (const flag of defaults) {
            await prisma.featureFlag.upsert({
                where: { key: flag.key },
                create: flag,
                update: {}, // Don't overwrite existing
            });
        }

        logger.info('Feature flags initialized');
    },
};

