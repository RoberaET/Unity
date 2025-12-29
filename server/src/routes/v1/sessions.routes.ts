import { Router } from 'express';
import { SessionService } from '../../services/sessionService';
import { authenticate } from '../../middleware/auth';
import { z } from 'zod';

const router = Router();

/**
 * GET /api/v1/sessions
 * List all active sessions for current user
 */
router.get('/', authenticate, async (req, res, next) => {
    try {
        const sessions = await SessionService.getUserSessions(req.user!.id);

        res.json({ sessions });
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/v1/sessions/:sessionId
 * Revoke a specific session
 */
router.delete('/:sessionId', authenticate, async (req, res, next) => {
    try {
        const { sessionId } = req.params;

        await SessionService.revokeSession({ sessionId, userId: req.user!.id });

        res.json({ message: 'Session revoked successfully' });
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/v1/sessions
 * Logout from all devices (revoke all sessions)
 */
router.delete('/', authenticate, async (req, res, next) => {
    try {
        await SessionService.revokeAllSessions(req.user!.id);

        res.json({ message: 'All sessions revoked successfully' });
    } catch (error) {
        next(error);
    }
});

export default router;
