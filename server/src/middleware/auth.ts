import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { AppError } from './errorHandler';

/**
 * Authentication Middleware
 * 
 * DESIGN DECISIONS:
 * - JWT tokens for stateless authentication (horizontal scaling friendly)
 * - Short-lived access tokens (15 minutes) for security
 * - Refresh tokens for long-lived sessions (stored in database)
 * - User lookup on every request (ensures account lockout/deletion is respected)
 * 
 * TOKEN SECURITY:
 * - Only validates signature, expiry, and structure
 * - Always checks soft delete status (deletedAt field)
 * - Locks out suspended accounts immediately
 */

// Extend Express Request to include authenticated user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: string;
            };
        }
    }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Required authentication: Throws error if no valid token
 * Use for protected routes that require login
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('No authentication token provided', 401);
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify JWT signature and expiry
        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err: any) {
            if (err.name === 'TokenExpiredError') {
                throw new AppError('Token expired, please refresh', 401);
            }
            throw new AppError('Invalid token', 401);
        }

        // Lookup user in database (ensures account still exists and active)
        const user = await prisma.user.findFirst({
            where: {
                id: decoded.userId,
                deletedAt: null, // Soft delete check
            },
            select: {
                id: true,
                email: true,
                role: true,
                lockedUntil: true,
            },
        });

        if (!user) {
            throw new AppError('User not found or has been deleted', 401);
        }

        // Check if account is locked
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            throw new AppError('Account is temporarily locked. Please try again later.', 403);
        }

        // Attach user to request object for downstream handlers
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
        };

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Optional authentication: Attaches user if token is valid, but doesn't fail if missing
 * Use for routes that work for both authenticated and anonymous users
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // No token provided, continue as anonymous
            return next();
        }

        const token = authHeader.substring(7);

        // Try to verify token
        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch {
            // Invalid token, continue as anonymous (don't throw error)
            return next();
        }

        // Lookup user
        const user = await prisma.user.findFirst({
            where: {
                id: decoded.userId,
                deletedAt: null,
            },
            select: {
                id: true,
                email: true,
                role: true,
                lockedUntil: true,
            },
        });

        if (user && (!user.lockedUntil || user.lockedUntil <= new Date())) {
            // Valid user, attach to request
            req.user = {
                id: user.id,
                email: user.email,
                role: user.role,
            };
        }

        next();
    } catch (error) {
        // Even on error, continue as anonymous (optional auth should never block)
        next();
    }
};

/**
 * Require admin role
 * Use after authenticate() middleware
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return next(new AppError('Authentication required', 401));
    }

    if (req.user.role !== 'ADMIN') {
        return next(new AppError('Admin access required', 403));
    }

    next();
};

/**
 * Generate JWT access token (short-lived)
 */
export const generateAccessToken = (userId: string): string => {
    const expiresIn = process.env.JWT_EXPIRES_IN || '15m';

    return jwt.sign(
        { userId },
        JWT_SECRET,
        { expiresIn: expiresIn as any }
    );
};

/**
 * Generate refresh token (long-lived, stored in database)
 */
export const generateRefreshToken = (userId: string): string => {
    const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
    const secret = process.env.REFRESH_TOKEN_SECRET || JWT_SECRET;

    return jwt.sign(
        { userId, type: 'refresh' },
        secret,
        { expiresIn: expiresIn as any }
    );
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): { userId: string } => {
    const secret = process.env.REFRESH_TOKEN_SECRET || JWT_SECRET;

    try {
        const decoded: any = jwt.verify(token, secret);

        if (decoded.type !== 'refresh') {
            throw new Error('Not a refresh token');
        }

        return { userId: decoded.userId };
    } catch (err) {
        throw new AppError('Invalid refresh token', 401);
    }
};
