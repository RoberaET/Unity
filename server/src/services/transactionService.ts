import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuditService } from './auditService';

/**
 * Transaction Service - Financial Data Management
 * 
 * CRITICAL FEATURES FOR FINANCE APP:
 * - Soft delete only (never hard delete financial records)
 * - Audit trail for all operations
 * - Support for restoration (undo delete)
 * - Admin-only hard delete (with special audit log)
 * 
 * PRODUCTION SAFEGUARDS:
 * - All queries exclude soft-deleted by default
 * - Transactions are immutable after creation (updates limited)
 * - Delete requires confirmation
 * - Backup-friendly (soft deletes preserved in backups)
 */

export const TransactionService = {
    /**
     * Create new transaction
     */
    async create(data: {
        userId: string;
        type: 'income' | 'expense' | 'transfer';
        amount: number;
        currency?: string;
        category?: string;
        description?: string;
        date?: Date;
    }) {
        const transaction = await prisma.transaction.create({
            data: {
                userId: data.userId,
                type: data.type,
                amount: data.amount,
                currency: data.currency,
                category: data.category,
                description: data.description,
                date: data.date || new Date(),
            },
        });

        // Log creation
        await AuditService.log({
            userId: data.userId,
            action: 'transaction_create',
            metadata: JSON.stringify({
                transactionId: transaction.id,
                type: data.type,
                amount: data.amount,
            }),
        });

        return transaction;
    },

    /**
     * Get user transactions (exclude soft-deleted)
     */
    async getUserTransactions(data: {
        userId: string;
        page?: number;
        limit?: number;
        type?: string;
        startDate?: Date;
        endDate?: Date;
        includeDeleted?: boolean; // Admin only
    }) {
        const {
            userId,
            page = 1,
            limit = 50,
            type,
            startDate,
            endDate,
            includeDeleted = false,
        } = data;

        const skip = (page - 1) * limit;

        const where: any = { userId };

        if (!includeDeleted) {
            where.deletedAt = null;
        }

        if (type) {
            where.type = type;
        }

        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = startDate;
            if (endDate) where.date.lte = endDate;
        }

        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where,
                orderBy: { date: 'desc' },
                skip,
                take: limit,
            }),
            prisma.transaction.count({ where }),
        ]);

        return {
            transactions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    /**
     * Get single transaction by ID
     */
    async getById(transactionId: string, userId: string) {
        const transaction = await prisma.transaction.findFirst({
            where: {
                id: transactionId,
                userId,
                deletedAt: null,
            },
        });

        if (!transaction) {
            throw new AppError('Transaction not found', 404);
        }

        return transaction;
    },

    /**
     * Update transaction (limited fields)
     */
    async update(data: {
        transactionId: string;
        userId: string;
        category?: string;
        description?: string;
    }) {
        const { transactionId, userId, ...updates } = data;

        // Verify ownership
        const existing = await this.getById(transactionId, userId);

        const transaction = await prisma.transaction.update({
            where: { id: transactionId },
            data: updates,
        });

        // Log update
        await AuditService.log({
            userId,
            action: 'transaction_update',
            metadata: JSON.stringify({
                transactionId,
                changes: updates,
            }),
        });

        return transaction;
    },

    /**
     * Soft delete transaction
     */
    async softDelete(transactionId: string, userId: string) {
        // Verify ownership
        await this.getById(transactionId, userId);

        const transaction = await prisma.transaction.update({
            where: { id: transactionId },
            data: { deletedAt: new Date() },
        });

        // Log deletion
        await AuditService.log({
            userId,
            action: 'transaction_delete',
            metadata: JSON.stringify({
                transactionId,
                softDelete: true,
            }),
        });

        return { message: 'Transaction deleted successfully' };
    },

    /**
     * Restore soft-deleted transaction
     */
    async restore(transactionId: string, userId: string) {
        const transaction = await prisma.transaction.findFirst({
            where: {
                id: transactionId,
                userId,
            },
        });

        if (!transaction) {
            throw new AppError('Transaction not found', 404);
        }

        if (!transaction.deletedAt) {
            throw new AppError('Transaction is not deleted', 400);
        }

        const restored = await prisma.transaction.update({
            where: { id: transactionId },
            data: { deletedAt: null },
        });

        // Log restoration
        await AuditService.log({
            userId,
            action: 'transaction_restore',
            metadata: JSON.stringify({ transactionId }),
        });

        return restored;
    },

    /**
     * Hard delete (permanent) - Admin only
     * Use with extreme caution!
     */
    async hardDelete(transactionId: string, adminUserId: string) {
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
        });

        if (!transaction) {
            throw new AppError('Transaction not found', 404);
        }

        await prisma.transaction.delete({
            where: { id: transactionId },
        });

        // Log hard deletion (critical audit event)
        await AuditService.log({
            userId: transaction.userId,
            action: 'transaction_hard_delete',
            metadata: JSON.stringify({
                transactionId,
                deletedBy: adminUserId,
                originalData: transaction,
            }),
        });

        return { message: 'Transaction permanently deleted' };
    },

    /**
     * Get transaction statistics for user
     */
    async getStats(userId: string, startDate?: Date, endDate?: Date) {
        const where: any = {
            userId,
            deletedAt: null,
        };

        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = startDate;
            if (endDate) where.date.lte = endDate;
        }

        const transactions = await prisma.transaction.findMany({
            where,
            select: {
                type: true,
                amount: true,
            },
        });

        const stats = {
            totalIncome: 0,
            totalExpense: 0,
            netBalance: 0,
            transactionCount: transactions.length,
        };

        transactions.forEach((t) => {
            if (t.type === 'income') {
                stats.totalIncome += t.amount;
            } else if (t.type === 'expense') {
                stats.totalExpense += t.amount;
            }
        });

        stats.netBalance = stats.totalIncome - stats.totalExpense;

        return stats;
    },
};
