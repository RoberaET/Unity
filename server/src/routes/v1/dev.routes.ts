import { Router } from 'express';
import prisma from '../../config/database';
import bcrypt from 'bcryptjs';

const router = Router();

/**
 * DEV ONLY: Reset test user
 * This endpoint bypasses all auth and creates/resets a clean test user
 */
router.post('/reset-test-user', async (req, res) => {
    try {
        const testEmail = 'rebika4553@liorashop.com';
        const testPassword = 'butela';
        const testName = 'Rebika';

        // Delete existing user if exists
        await prisma.user.deleteMany({
            where: { email: testEmail }
        });

        // Create fresh user with hashed password
        const hashedPassword = await bcrypt.hash(testPassword, 12);

        const user = await prisma.user.create({
            data: {
                email: testEmail,
                name: testName,
                password: hashedPassword,
                role: 'USER',
                failedLoginAttempts: 0,
                lockedUntil: null,
            }
        });

        res.json({
            success: true,
            message: '✅ Test user reset successfully!',
            user: {
                email: user.email,
                name: user.name,
                password: testPassword // Only show in dev mode
            }
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * DEV ONLY: Direct login bypass (no validation)
 * Always returns a valid token for the test user
 */
router.post('/dev-login', async (req, res) => {
    try {
        const { email, name } = req.body;
        const userEmail = email || 'rebika4553@liorashop.com';
        const userName = name || userEmail.split('@')[0];

        // Find or create user
        let user = await prisma.user.findUnique({
            where: { email: userEmail }
        });

        if (!user) {
            const hashedPassword = await bcrypt.hash('butela', 12);
            user = await prisma.user.create({
                data: {
                    email: userEmail,
                    name: userName,
                    password: hashedPassword,
                    role: 'USER',
                    failedLoginAttempts: 0,
                    lockedUntil: null,
                }
            });
        }

        // Reset lockout if any
        await prisma.user.update({
            where: { id: user.id },
            data: {
                failedLoginAttempts: 0,
                lockedUntil: null,
            }
        });

        // Generate tokens
        const { generateAccessToken, generateRefreshToken } = require('../../middleware/auth');
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            accessToken,
            refreshToken,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
