import { Request, Response, NextFunction } from 'express';

/**
 * Caching Middleware for Read APIs
 * 
 * DESIGN DECISIONS:
 * - Set Cache-Control headers for edge caching (CDN, browser)
 * - ETag support for conditional requests (304 Not Modified)
 * - Configurable cache duration per route
 * - Never cache user-specific data without proper vary headers
 * 
 * EDGE CACHING STRATEGY:
 * - Public data (e.g., currency rates, public stats): long cache
 * - User-specific data: no-cache or private cache only
 * - Dynamic data: short cache with stale-while-revalidate
 * 
 * USAGE:
 *   app.get('/api/stats', cacheMiddleware(300), handler); // 5 minute cache
 */

interface CacheOptions {
    maxAge?: number; // seconds
    public?: boolean; // false = private (per-user cache only)
    staleWhileRevalidate?: number; // seconds
    mustRevalidate?: boolean;
}

/**
 * Create caching middleware with specified options
 */
export const cacheMiddleware = (maxAge: number = 300, options: Partial<CacheOptions> = {}) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        const {
            public: isPublic = false,
            staleWhileRevalidate = 0,
            mustRevalidate = false,
        } = options;

        // Build Cache-Control header
        const directives: string[] = [];

        if (isPublic) {
            directives.push('public');
        } else {
            directives.push('private');
        }

        directives.push(`max-age=${maxAge}`);

        if (staleWhileRevalidate > 0) {
            directives.push(`stale-while-revalidate=${staleWhileRevalidate}`);
        }

        if (mustRevalidate) {
            directives.push('must-revalidate');
        }

        res.setHeader('Cache-Control', directives.join(', '));

        // Add Vary header for user-specific caching
        if (!isPublic) {
            res.setHeader('Vary', 'Authorization');
        }

        next();
    };
};

/**
 * Preset: No caching (always fresh data)
 * Use for: User dashboards, real-time data, sensitive information
 */
export const noCache = (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
};

/**
 * Preset: Public static data (24 hour cache)
 * Use for: Public statistics, reference data, rarely changing content
 */
export const cachePublicStatic = cacheMiddleware(86400, {
    public: true,
    staleWhileRevalidate: 3600, // Serve stale for 1 hour while revalidating
});

/**
 * Preset: Public API data (5 minute cache)
 * Use for: API responses that change occasionally
 */
export const cachePublicAPI = cacheMiddleware(300, {
    public: true,
    staleWhileRevalidate: 60,
});

/**
 * Preset: Private user data (1 minute cache)
 * Use for: User-specific data that's expensive to compute
 */
export const cachePrivate = cacheMiddleware(60, {
    public: false,
});

/**
 * ETag support for conditional requests
 * 
 * This middleware:
 * 1. Computes hash of response body
 * 2. Sends 304 Not Modified if ETag matches
 * 3. Significantly reduces bandwidth for unchanged data
 * 
 * NOTE: Only use for JSON responses that don't change often
 * Adds computation overhead (hashing response body)
 */
export const etag = (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);

    res.json = function (body: any) {
        // Generate simple hash of response
        const bodyString = JSON.stringify(body);
        const hash = simpleHash(bodyString);
        const etag = `"${hash}"`;

        // Check if client has current version
        const clientEtag = req.headers['if-none-match'];

        if (clientEtag === etag) {
            // Client has current version, send 304
            return res.status(304).end();
        }

        // Send ETag header with response
        res.setHeader('ETag', etag);

        return originalJson(body);
    };

    next();
};

/**
 * Simple hash function for ETag generation
 * Not cryptographically secure, but fast for cache validation
 */
function simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
}
