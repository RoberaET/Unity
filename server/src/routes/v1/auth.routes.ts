import { Router } from 'express';
import { AuthService } from '../../services/authService';
import { SessionService } from '../../services/sessionService';
import { authenticate, optionalAuth } from '../../middleware/auth';
import { authLimiter, signupLimiter } from '../../middleware/rateLimiter';
import { z } from 'zod';

const router = Router();

/**
 * POST /api/v1/auth/signup
 * Register a new user account
 */
router.post('/signup', signupLimiter, async (req, res, next) => {
    try {
        const schema = z.object({
            email: z.string().email(),
            name: z.string().min(1),
            password: z.string().min(6), // Relaxed from 8 to 6
        });

        const data = schema.parse(req.body);

        const user = await AuthService.register({
            ...data,
            ip: req.ip || 'unknown',
        });

        res.status(201).json({ user });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/v1/auth/login
 * Login with email and password
 */
router.post('/login', authLimiter, async (req, res, next) => {
    try {
        const schema = z.object({
            email: z.string().email(),
            password: z.string(),
        });

        const data = schema.parse(req.body);

        const result = await AuthService.login({
            ...data,
            ip: req.ip || 'unknown',
            userAgent: req.get('user-agent') || 'unknown',
        });

        // Create session for device tracking
        await SessionService.createSession({
            userId: result.user.id,
            refreshToken: result.refreshToken,
            ip: req.ip || 'unknown',
            userAgent: req.get('user-agent') || 'unknown',
        });

        res.json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/v1/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req, res, next) => {
    try {
        const schema = z.object({
            refreshToken: z.string(),
        });

        const { refreshToken } = schema.parse(req.body);

        // Manual token verification and new access token generation
        const { verifyRefreshToken, generateAccessToken } = require('../middleware/auth');
        const payload = verifyRefreshToken(refreshToken);
        const accessToken = generateAccessToken(payload.userId);

        res.json({ accessToken });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/v1/auth/logout
 * Logout current session
 */
router.post('/logout', authenticate, async (req, res, next) => {
    try {
        const schema = z.object({
            sessionId: z.string(),
        });

        const { sessionId } = schema.parse(req.body);

        await SessionService.revokeSession({ sessionId, userId: req.user!.id });

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/v1/auth/me
 * Get current authenticated user
 */
router.get('/me', authenticate, (req, res) => {
    res.json({
        user: {
            id: req.user!.id,
            email: req.user!.email,
            role: req.user!.role,
        },
    });
});

/**
 * POST /api/v1/auth/change-password
 * Change user password
 */
router.post('/change-password', authenticate, async (req, res, next) => {
    try {
        const schema = z.object({
            currentPassword: z.string(),
            newPassword: z.string().min(8),
        });

        const data = schema.parse(req.body);

        await AuthService.changePassword({
            userId: req.user!.id,
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
            ip: req.ip || 'unknown',
        });

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        next(error);
    }
});

export default router;
