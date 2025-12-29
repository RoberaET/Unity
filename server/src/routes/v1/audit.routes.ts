import { Router } from 'express';
import { AuditService } from '../../services/auditService';
import { authenticate } from '../../middleware/auth';
import { z } from 'zod';

const router = Router();

/**
 * GET /api/v1/audit
 * Get audit logs for current user
 */
router.get('/', authenticate, async (req, res, next) => {
    try {
        const schema = z.object({
            page: z.string().optional().transform(val => val ? parseInt(val) : 1),
            limit: z.string().optional().transform(val => val ? parseInt(val) : 50),
        });

        const { page, limit } = schema.parse(req.query);

        const result = await AuditService.getUserLogs({
            userId: req.user!.id,
            page,
            limit
        });

        res.json(result);
    } catch (error) {
        next(error);
    }
});

export default router;
