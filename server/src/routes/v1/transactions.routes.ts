import { Router } from 'express';
import { TransactionService } from '../../services/transactionService';
import { authenticate } from '../../middleware/auth';
import { cachePrivate } from '../../middleware/cache';
import { z } from 'zod';

const router = Router();

/**
 * GET /api/v1/transactions
 * List all transactions for current user
 */
router.get('/', authenticate, async (req, res, next) => {
    try {
        const transactions = await TransactionService.getUserTransactions({
            userId: req.user!.id,
        });

        res.json(transactions);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/v1/transactions/stats
 * Get transaction statistics
 */
router.get('/stats', authenticate, async (req, res, next) => {
    try {
        const stats = await TransactionService.getStats(req.user!.id);

        res.json(stats);
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/v1/transactions
 * Create a new transaction
 */
router.post('/', authenticate, async (req, res, next) => {
    try {
        const schema = z.object({
            walletId: z.string(),
            type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
            amount: z.number().positive(),
            currency: z.string(),
            categoryId: z.string(),
            description: z.string().optional(),
            date: z.string().transform(str => new Date(str)),
        });

        const data = schema.parse(req.body);

        const transaction = await TransactionService.create({
            userId: req.user!.id,
            type: data.type.toLowerCase() as 'income' | 'expense' | 'transfer',
            amount: data.amount,
            currency: data.currency,
            category: data.categoryId,
            description: data.description,
            date: data.date,
        });

        res.status(201).json({ transaction });
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/v1/transactions/:id
 * Soft delete a transaction
 */
router.delete('/:id', authenticate, async (req, res, next) => {
    try {
        await TransactionService.softDelete(req.params.id, req.user!.id);

        res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        next(error);
    }
});

export default router;
