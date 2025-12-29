import { Request, Response, NextFunction } from 'express';

/**
 * API Versioning Middleware
 * 
 * DESIGN DECISIONS:
 * - Extract version from URL path (/api/v1/*, /api/v2/*, etc.)
 * - Attach version to request object for route handlers
 * - Support deprecation warnings for old versions
 * - Validate version exists before routing
 * 
 * VERSIONING STRATEGY:
 * - v1: Current production API
 * - v2+: Future versions for breaking changes
 * - Unversioned /api/* deprecated but still supported for backward compat
 * 
 * MIGRATION PATH:
 * 1. New features go into latest version
 * 2. Breaking changes require new version
 * 3. Old versions supported for 6-12 months minimum
 * 4. Deprecation warnings sent in response headers
 */

declare global {
    namespace Express {
        interface Request {
            apiVersion?: string;
        }
    }
}

const SUPPORTED_VERSIONS = ['v1'];
const DEPRECATED_VERSIONS = ['v0']; // Example: if you have legacy unversioned endpoints

/**
 * Extract and validate API version from request path
 */
export const apiVersion = (req: Request, res: Response, next: NextFunction) => {
    // Extract version from path (e.g., /api/v1/auth/login -> v1)
    const match = req.path.match(/^\/api\/(v\d+)\//);

    if (match) {
        const version = match[1];

        // Check if version is supported
        if (!SUPPORTED_VERSIONS.includes(version) && !DEPRECATED_VERSIONS.includes(version)) {
            return res.status(404).json({
                error: 'API version not supported',
                supportedVersions: SUPPORTED_VERSIONS,
                requestedVersion: version,
            });
        }

        // Add deprecation warning for old versions
        if (DEPRECATED_VERSIONS.includes(version)) {
            res.setHeader('X-API-Deprecation', 'This API version is deprecated');
            res.setHeader('X-API-Sunset', '2025-12-31'); // Example sunset date
            res.setHeader('Link', '</api/v1>; rel="successor-version"');
        }

        req.apiVersion = version;
    } else {
        // No version in path (legacy/unversioned endpoint)
        // You can either:
        // 1. Treat as deprecated v0
        // 2. Reject with error
        // 3. Default to latest version

        // Option 1: Treat as deprecated
        req.apiVersion = 'v0';
        res.setHeader('X-API-Deprecation', 'Please use versioned API endpoints (e.g., /api/v1/...)');
    }

    next();
};

/**
 * Require specific API version
 * Use to restrict certain features to newer versions only
 */
export const requireVersion = (minVersion: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.apiVersion) {
            return res.status(400).json({
                error: 'API version required',
            });
        }

        const currentVersionNum = parseInt(req.apiVersion.substring(1), 10);
        const requiredVersionNum = parseInt(minVersion.substring(1), 10);

        if (currentVersionNum < requiredVersionNum) {
            return res.status(400).json({
                error: `This endpoint requires API version ${minVersion} or higher`,
                currentVersion: req.apiVersion,
            });
        }

        next();
    };
};

// Export alias for consistency
export const apiVersionMiddleware = apiVersion;
