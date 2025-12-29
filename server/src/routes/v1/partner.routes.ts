import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { PartnerService } from '../../services/partnerService';
import { AppError } from '../../middleware/errorHandler';
import { z } from 'zod';

const router = Router();

// Validation Schemas
const sendRequestSchema = z.object({
    email: z.string().email(),
});

const respondRequestSchema = z.object({
    requestId: z.string(),
    accept: z.boolean(),
});

/**
 * Send partner request
 * POST /api/v1/partners/request
 */
router.post('/request', authenticate, async (req, res, next) => {
    try {
        const { email } = sendRequestSchema.parse(req.body);
        const result = await PartnerService.sendRequest(req.user!.id, email);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * Respond to partner request
 * POST /api/v1/partners/respond
 */
router.post('/respond', authenticate, async (req, res, next) => {
    try {
        const { requestId, accept } = respondRequestSchema.parse(req.body);
        console.log('🔵 Respond request:', { requestId, accept, userId: req.user!.id });
        const result = await PartnerService.respondToRequest(requestId, req.user!.id, accept);
        console.log('✅ Respond successful:', result);
        res.json(result);
    } catch (error) {
        console.error('❌ Respond error:', error);
        next(error);
    }
});

/**
 * Get all requests (sent & received)
 * GET /api/v1/partners/requests
 */
router.get('/requests', authenticate, async (req, res, next) => {
    try {
        const result = await PartnerService.getRequests(req.user!.id);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * Unpair
 * DELETE /api/v1/partners
 */
router.delete('/', authenticate, async (req, res, next) => {
    try {
        const result = await PartnerService.unpair(req.user!.id);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * Get Partner Info
 * GET /api/v1/partners
 */
router.get('/', authenticate, async (req, res, next) => {
    try {
        const partner = await PartnerService.getPartner(req.user!.id);
        res.json(partner);
    } catch (error) {
        next(error);
    }
});

export default router;
