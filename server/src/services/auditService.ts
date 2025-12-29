import prisma from '../config/database';

/**
 * Audit Service - Activity Logging
 * 
 * PURPOSE:
 * - Track all significant user actions for compliance and debugging
 * - Provide transparency (users can see their own activity log)
 * - Support security investigations (who did what, when, from where)
 * 
 * LOGGED ACTIONS:
 * - login, logout, signup
 * - password_change
 * - session_create, session_revoke
 * - transaction_create, transaction_update, transaction_delete
 * - data_export (CSV, PDF)
 * - settings_change
 * 
 * RETENTION: Consider implementing auto-deletion of old logs (e.g., >1 year)
 */

export const AuditService = {
    /**
     * Log an activity
     */
    async log(data: {
        userId: string;
        action: string;
        metadata?: string; // JSON string with additional context
        result?: 'success' | 'failure';
    }) {
        try {
            await prisma.activityLog.create({
                data: {
                    userId: data.userId,
                    action: data.action,
                    metadata: data.metadata,
                    result: data.result || 'success',
                },
            });
        } catch (error) {
            // Never let audit logging failure break the main operation
            console.error('Failed to log activity:', error);
        }
    },

    /**
     * Get activity logs for a user (paginated)
     */
    async getUserLogs(data: {
        userId: string;
        page?: number;
        limit?: number;
        action?: string; // Filter by specific action
    }) {
        const { userId, page = 1, limit = 50, action } = data;
        const skip = (page - 1) * limit;

        const where: any = { userId };
        if (action) {
            where.action = action;
        }

        const [logs, total] = await Promise.all([
            prisma.activityLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                select: {
                    id: true,
                    action: true,
                    metadata: true,
                    result: true,
                    createdAt: true,
                },
            }),
            prisma.activityLog.count({ where }),
        ]);

        return {
            logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    /**
     * Delete old logs (retention policy)
     * Call this from a scheduled job (e.g., daily cron)
     */
    async cleanupOldLogs(olderThanDays: number = 365) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

        const result = await prisma.activityLog.deleteMany({
            where: {
                createdAt: {
                    lt: cutoffDate,
                },
            },
        });

        return {
            deleted: result.count,
            cutoffDate,
        };
    },
};
