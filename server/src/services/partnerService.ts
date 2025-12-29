import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuditService } from './auditService';

/**
 * Partner Service - Couples Finance Management
 * 
 * Handles locking/unlocking financial pairing between two users.
 */
export const PartnerService = {
    /**
     * Send a partnership request to another user by email
     */
    async sendRequest(fromUserId: string, toEmail: string) {
        // 1. Find target user
        const toUser = await prisma.user.findUnique({
            where: { email: toEmail },
        });

        if (!toUser) {
            throw new AppError('User not found. Ask them to sign up first!', 404);
        }

        if (toUser.id === fromUserId) {
            throw new AppError('You cannot pair with yourself.', 400);
        }

        // 2. Check if already paired
        if (toUser.partnerId) {
            throw new AppError('This user is already paired with someone else.', 400);
        }

        const fromUser = await prisma.user.findUnique({
            where: { id: fromUserId },
        });

        if (fromUser?.partnerId) {
            throw new AppError('You are already paired. Unpair first.', 400);
        }

        // 3. Check for existing pending request
        const existingRequest = await prisma.partnerRequest.findUnique({
            where: {
                fromUserId_toUserId: {
                    fromUserId,
                    toUserId: toUser.id,
                },
            },
        });

        if (existingRequest && existingRequest.status === 'pending') {
            throw new AppError('You already sent a request to this user.', 400);
        }

        // 4. Create request
        await prisma.partnerRequest.create({
            data: {
                fromUserId,
                toUserId: toUser.id,
                status: 'pending',
            },
        });

        // Log it
        await AuditService.log({
            userId: fromUserId,
            action: 'partner_request_sent',
            metadata: JSON.stringify({ toEmail }),
        });

        return { message: 'Partner request sent successfully!' };
    },

    /**
     * Respond to a received request (Accept/Decline)
     */
    async respondToRequest(requestId: string, userId: string, accept: boolean) {
        const request = await prisma.partnerRequest.findUnique({
            where: { id: requestId },
        });

        if (!request) {
            throw new AppError('Request not found', 404);
        }

        if (request.toUserId !== userId) {
            throw new AppError('Not authorized to respond to this request', 403);
        }

        if (request.status !== 'pending') {
            throw new AppError('Request already processed', 400);
        }

        if (!accept) {
            // Decline
            await prisma.partnerRequest.update({
                where: { id: requestId },
                data: { status: 'declined' },
            });
            return { message: 'Request declined' };
        }

        // Accept transaction
        return await prisma.$transaction(async (tx) => {
            // Check double booking again just in case
            const user = await tx.user.findUnique({ where: { id: userId } });
            const sender = await tx.user.findUnique({ where: { id: request.fromUserId } });

            if (user?.partnerId || sender?.partnerId) {
                throw new AppError('One of you is already paired.', 400);
            }

            // Update request
            await tx.partnerRequest.update({
                where: { id: requestId },
                data: { status: 'accepted' },
            });

            // Update users
            await tx.user.update({
                where: { id: userId },
                data: { partnerId: request.fromUserId },
            });

            await tx.user.update({
                where: { id: request.fromUserId },
                data: { partnerId: userId },
            });

            // Log it
            await AuditService.log({
                userId,
                action: 'partner_request_accepted',
                metadata: JSON.stringify({ partnerId: request.fromUserId }),
            });

            return { message: 'You are now paired!' };
        });
    },

    /**
     * Get pending requests for the current user
     */
    async getRequests(userId: string) {
        const received = await prisma.partnerRequest.findMany({
            where: {
                toUserId: userId,
                status: 'pending',
            },
            include: {
                fromUser: {
                    select: { id: true, name: true, email: true },
                },
            },
        });

        const sent = await prisma.partnerRequest.findMany({
            where: {
                fromUserId: userId,
                status: 'pending',
            },
            include: {
                toUser: {
                    select: { id: true, name: true, email: true },
                },
            },
        });

        return { received, sent };
    },

    /**
     * Unpair from current partner
     */
    async unpair(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { partner: true },
        });

        if (!user || !user.partnerId) {
            throw new AppError('You are not paired', 400);
        }

        const partnerId = user.partnerId;

        // Transaction to unpair both
        await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: { partnerId: null },
            }),
            prisma.user.update({
                where: { id: partnerId },
                data: { partnerId: null },
            }),
        ]);

        await AuditService.log({
            userId,
            action: 'partner_unpaired',
            metadata: JSON.stringify({ exPartnerId: partnerId }),
        });

        return { message: 'Unpaired successfully.' };
    },

    /**
     * Get current partner info
     */
    async getPartner(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                partner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        createdAt: true,
                    },
                },
            },
        });

        return user?.partner || null;
    }
};
