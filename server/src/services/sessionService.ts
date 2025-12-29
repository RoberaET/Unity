import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { verifyRefreshToken } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { AuditService } from './auditService';

/**
 * Session Management Service
 * 
 * PURPOSE:
 * - Track all active sessions (devices) for each user
 * - Allow users to see where they're logged in
 * - Enable remote logout ("revoke session from another device")
 * - Support "logout everywhere" functionality
 * 
 * DESIGN:
 * - Refresh tokens stored as hashed values (never plaintext)
 * - Sessions include device info (parsed from user-agent)
 * - Expired sessions cleaned up periodically
 * - Session revocation propagated across all server instances via DB
 */

const REFRESH_TOKEN_EXPIRES_IN_DAYS = 7; // Match JWT config

export const SessionService = {
    /**
     * Create new session on login
     */
    async createSession(data: {
        userId: string;
        refreshToken: string;
        ip: string;
        userAgent?: string;
    }) {
        const { userId, refreshToken, ip, userAgent } = data;

        // Hash refresh token before storing
        const hashedToken = await bcrypt.hash(refreshToken, 10);

        // Parse device name from user-agent
        const deviceName = parseDeviceName(userAgent || '');

        // Calculate expiry
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_IN_DAYS);

        const session = await prisma.session.create({
            data: {
                userId,
                refreshToken: hashedToken,
                deviceName,
                ip,
                userAgent,
                expiresAt,
            },
        });

        // Log session creation
        await AuditService.log({
            userId,
            action: 'session_create',
            metadata: JSON.stringify({ ip, device: deviceName }),
        });

        return session;
    },

    /**
     * Update session last active timestamp
     * Call this on token refresh
     */
    async updateSessionActivity(sessionId: string) {
        await prisma.session.update({
            where: { id: sessionId },
            data: { lastActiveAt: new Date() },
        });
    },

    /**
     * Get all active sessions for a user
     */
    async getUserSessions(userId: string) {
        const sessions = await prisma.session.findMany({
            where: {
                userId,
                revokedAt: null, // Not manually revoked
                expiresAt: {
                    gt: new Date(), // Not expired
                },
            },
            select: {
                id: true,
                deviceName: true,
                ip: true,
                lastActiveAt: true,
                createdAt: true,
            },
            orderBy: {
                lastActiveAt: 'desc',
            },
        });

        return sessions;
    },

    /**
     * Revoke specific session (logout from one device)
     */
    async revokeSession(data: { sessionId: string; userId: string }) {
        const { sessionId, userId } = data;

        // Verify session belongs to user
        const session = await prisma.session.findFirst({
            where: {
                id: sessionId,
                userId,
            },
        });

        if (!session) {
            throw new AppError('Session not found', 404);
        }

        // Revoke session
        await prisma.session.update({
            where: { id: sessionId },
            data: { revokedAt: new Date() },
        });

        // Log session revocation
        await AuditService.log({
            userId,
            action: 'session_revoke',
            metadata: JSON.stringify({
                sessionId,
                device: session.deviceName,
            }),
        });

        return { message: 'Session revoked successfully' };
    },

    /**
     * Revoke all sessions for a user (logout everywhere)
     * Useful for:
     * - Password change (security best practice)
     * - "I lost my phone" scenario
     * - Suspected account compromise
     */
    async revokeAllSessions(userId: string, exceptSessionId?: string) {
        const where: any = {
            userId,
            revokedAt: null,
        };

        // Optionally keep current session active
        if (exceptSessionId) {
            where.id = { not: exceptSessionId };
        }

        await prisma.session.updateMany({
            where,
            data: { revokedAt: new Date() },
        });

        // Log mass revocation
        await AuditService.log({
            userId,
            action: 'session_revoke_all',
            metadata: JSON.stringify({ exceptSessionId }),
        });

        return { message: 'All sessions revoked successfully' };
    },

    /**
     * Validate refresh token and return session
     * Used on token refresh endpoint
     */
    async validateRefreshToken(token: string) {
        // Decode token to get userId
        const { userId } = verifyRefreshToken(token);

        // Find active sessions for this user
        const sessions = await prisma.session.findMany({
            where: {
                userId,
                revokedAt: null,
                expiresAt: {
                    gt: new Date(),
                },
            },
        });

        // Check if token matches any session (bcrypt compare)
        for (const session of sessions) {
            const matches = await bcrypt.compare(token, session.refreshToken);
            if (matches) {
                return session;
            }
        }

        throw new AppError('Invalid or expired refresh token', 401);
    },

    /**
     * Cleanup expired and revoked sessions (run periodically)
     */
    async cleanupSessions(olderThanDays: number = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

        const result = await prisma.session.deleteMany({
            where: {
                OR: [
                    { expiresAt: { lt: new Date() } }, // Expired
                    {
                        revokedAt: {
                            not: null,
                            lt: cutoffDate, // Revoked >30 days ago
                        },
                    },
                ],
            },
        });

        return {
            deleted: result.count,
        };
    },
};

/**
 * Parse device/browser name from user-agent string
 * Simple implementation - can be enhanced with user-agent parsing library
 */
function parseDeviceName(userAgent: string): string {
    if (!userAgent) return 'Unknown Device';

    // Simple parsing (enhance with ua-parser-js or similar if needed)
    if (userAgent.includes('iPhone')) return 'iPhone';
    if (userAgent.includes('iPad')) return 'iPad';
    if (userAgent.includes('Android')) return 'Android Device';
    if (userAgent.includes('Windows')) return 'Windows PC';
    if (userAgent.includes('Macintosh')) return 'Mac';
    if (userAgent.includes('Linux')) return 'Linux PC';

    // Parse browser
    if (userAgent.includes('Chrome')) return 'Chrome Browser';
    if (userAgent.includes('Firefox')) return 'Firefox Browser';
    if (userAgent.includes('Safari')) return 'Safari Browser';
    if (userAgent.includes('Edge')) return 'Edge Browser';

    return 'Unknown Device';
}
