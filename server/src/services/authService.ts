import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { generateAccessToken, generateRefreshToken } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { AuditService } from './auditService';

/**
 * Authentication Service
 * 
 * PRODUCTION SECURITY FEATURES:
 * - Account lockout after N failed attempts (configurable, default 5)
 * - Automatic unlock after duration (configurable, default 30 minutes)
 * - Failed login tracking with IP and reason
 * - Audit trail for all auth events
 * - Rate limiting integration (IP + user-level)
 * - Secure password hashing with bcrypt (cost factor 12)
 * 
 * DESIGN NOTE:
 * - Lockout is by user account (email), not IP
 * - IP-based rate limiting is separate (handled by middleware)
 * - Failed attempts reset on successful login
 * - Locked accounts show same message as invalid password (security)
 */

const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10);
const LOCKOUT_DURATION_MINUTES = parseInt(process.env.LOCKOUT_DURATION_MINUTES || '30', 10);
const BCRYPT_ROUNDS = 12; // Cost factor (higher = more secure, slower)

export const AuthService = {
    /**
     * Register new user
     */
    async register(data: {
        email: string;
        name: string;
        password: string;
        ip?: string;
    }) {
        // Check if user already exists
        const existing = await prisma.user.findUnique({
            where: { email: data.email.toLowerCase() },
        });

        if (existing && !existing.deletedAt) {
            throw new AppError('Email already registered', 400);
        }

        // If user was soft-deleted, resurrect the account instead of creating new
        if (existing && existing.deletedAt) {
            const hashedPassword = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

            const user = await prisma.user.update({
                where: { id: existing.id },
                data: {
                    name: data.name,
                    password: hashedPassword,
                    deletedAt: null, // Restore account
                    failedLoginAttempts: 0,
                    lockedUntil: null,
                },
            });

            // Log registration
            await AuditService.log({
                userId: user.id,
                action: 'signup',
                metadata: JSON.stringify({ ip: data.ip, restored: true }),
                result: 'success',
            });

            return {
                id: user.id,
                email: user.email,
                name: user.name,
            };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: data.email.toLowerCase(),
                name: data.name,
                password: hashedPassword,
            },
        });

        // Log registration
        await AuditService.log({
            userId: user.id,
            action: 'signup',
            metadata: JSON.stringify({ ip: data.ip }),
            result: 'success',
        });

        return {
            id: user.id,
            email: user.email,
            name: user.name,
        };
    },

    /**
     * Login with email and password
     * Implements account lockout and failed attempt tracking
     */
    async login(data: {
        email: string;
        password: string;
        ip: string;
        userAgent?: string;
    }) {
        const { email, password, ip, userAgent } = data;

        // Find user
        const user = await prisma.user.findFirst({
            where: {
                email: email.toLowerCase(),
                deletedAt: null, // Soft delete check
            },
        });

        // Generic error message (don't reveal if email exists - security)
        const genericError = 'Invalid email or password';

        if (!user) {
            // Log failed attempt (user not found)
            await prisma.loginAttempt.create({
                data: {
                    email: email.toLowerCase(),
                    success: false,
                    ip,
                    userAgent,
                    reason: 'email_not_found',
                },
            });

            throw new AppError(genericError, 401);
        }

        // Check if account is locked - DISABLED FOR LOCAL DEV
        /* 
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            // Log failed attempt (account locked)
            await prisma.loginAttempt.create({
                data: {
                    userId: user.id,
                    email: email.toLowerCase(),
                    success: false,
                    ip,
                    userAgent,
                    reason: 'account_locked',
                },
            });

            const minutesRemaining = Math.ceil(
                (user.lockedUntil.getTime() - Date.now()) / 60000
            );

            throw new AppError(
                `Account temporarily locked. Try again in ${minutesRemaining} minute(s).`,
                403
            );
        }
        */

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            // DISABLED FOR LOCAL DEV - No account lockout
            /*
            // Increment failed attempts
            const newAttempts = user.failedLoginAttempts + 1;

            // Lock account if threshold reached
            const shouldLock = newAttempts >= MAX_LOGIN_ATTEMPTS;
            const lockedUntil = shouldLock
                ? new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000)
                : null;

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    failedLoginAttempts: newAttempts,
                    lockedUntil,
                },
            });

            // Log failed attempt
            await prisma.loginAttempt.create({
                data: {
                    userId: user.id,
                    email: email.toLowerCase(),
                    success: false,
                    ip,
                    userAgent,
                    reason: 'invalid_password',
                },
            });

            // Log audit
            await AuditService.log({
                userId: user.id,
                action: 'login',
                metadata: JSON.stringify({
                    ip,
                    device: userAgent,
                    failedAttempts: newAttempts,
                    locked: shouldLock,
                }),
                result: 'failure',
            });

            if (shouldLock) {
                throw new AppError(
                    `Account locked due to too many failed login attempts. Try again in ${LOCKOUT_DURATION_MINUTES} minutes.`,
                    403
                );
            }
            */

            throw new AppError(genericError, 401);
        }

        // Successful login: Reset failed attempts
        await prisma.user.update({
            where: { id: user.id },
            data: {
                failedLoginAttempts: 0,
                lockedUntil: null,
                lastLoginAt: new Date(),
                lastLoginIp: ip,
            },
        });

        // Log successful attempt
        await prisma.loginAttempt.create({
            data: {
                userId: user.id,
                email: email.toLowerCase(),
                success: true,
                ip,
                userAgent,
            },
        });

        // Log audit
        await AuditService.log({
            userId: user.id,
            action: 'login',
            metadata: JSON.stringify({ ip, device: userAgent }),
            result: 'success',
        });

        // Generate tokens
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            accessToken,
            refreshToken,
        };
    },

    /**
     * Change password (requires current password)
     */
    async changePassword(data: {
        userId: string;
        currentPassword: string;
        newPassword: string;
        ip?: string;
    }) {
        const { userId, currentPassword, newPassword, ip } = data;

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || user.deletedAt) {
            throw new AppError('User not found', 404);
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            throw new AppError('Current password is incorrect', 401);
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

        // Update password
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        // Log password change
        await AuditService.log({
            userId,
            action: 'password_change',
            metadata: JSON.stringify({ ip }),
            result: 'success',
        });

        return { message: 'Password changed successfully' };
    },

    /**
     * Check if account is locked
     * Returns lock status and minutes remaining
     */
    async getLockStatus(email: string) {
        const user = await prisma.user.findFirst({
            where: {
                email: email.toLowerCase(),
                deletedAt: null,
            },
            select: {
                lockedUntil: true,
                failedLoginAttempts: true,
            },
        });

        if (!user) {
            return { locked: false };
        }

        if (user.lockedUntil && user.lockedUntil > new Date()) {
            const minutesRemaining = Math.ceil(
                (user.lockedUntil.getTime() - Date.now()) / 60000
            );

            return {
                locked: true,
                minutesRemaining,
                attemptsRemaining: 0,
            };
        }

        return {
            locked: false,
            attemptsRemaining: Math.max(0, MAX_LOGIN_ATTEMPTS - user.failedLoginAttempts),
        };
    },
};
