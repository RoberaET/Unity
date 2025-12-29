import { User } from '@/types/finance';

// Types mimicking the Prisma schema
export interface DbUser extends User {
    password?: string; // Hashed in real app
    role: 'USER' | 'ADMIN';
    avatar?: string;
    currency?: any; // Stored as string, cast to Currency type
}

export interface PasswordResetCode {
    id: string;
    code: string; // We'll store plain text for this mock, but 'hashed' in concept
    userId: string;
    expiresAt: string; // ISO string
    usedAt?: string; // ISO string
    createdBy: string;
    createdAt: string;
}

export interface SystemLog {
    id: string;
    action: string;
    details?: string;
    timestamp: string;
}

export interface Pairing {
    id: string;
    user1Id: string;
    user2Id: string;
    createdAt: string;
}

export interface PartnerRequest {
    id: string;
    fromUserId: string;
    fromUserName: string;
    toUserId: string;
    toUserName: string;
    status: 'pending' | 'accepted' | 'declined';
    createdAt: string;
}

const STORAGE_KEYS = {
    USERS: 'pf_db_users',
    CODES: 'pf_db_codes',
    LOGS: 'pf_db_logs',
    PAIRINGS: 'pf_db_pairings',
    PARTNER_REQUESTS: 'pf_db_partner_requests',
};

// Helper: Delay to simulate network
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper: Safe UUID generation
const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

class MockBackendService {
    private getUsers(): DbUser[] {
        const data = localStorage.getItem(STORAGE_KEYS.USERS);
        return data ? JSON.parse(data) : [];
    }

    private saveUsers(users: DbUser[]) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }

    private getCodes(): PasswordResetCode[] {
        const data = localStorage.getItem(STORAGE_KEYS.CODES);
        return data ? JSON.parse(data) : [];
    }

    private saveCodes(codes: PasswordResetCode[]) {
        localStorage.setItem(STORAGE_KEYS.CODES, JSON.stringify(codes));
    }

    private getLogs(): SystemLog[] {
        const data = localStorage.getItem(STORAGE_KEYS.LOGS);
        return data ? JSON.parse(data) : [];
    }

    private saveLogs(logs: SystemLog[]) {
        localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    }

    private getPairings(): Pairing[] {
        const data = localStorage.getItem(STORAGE_KEYS.PAIRINGS);
        return data ? JSON.parse(data) : [];
    }

    private savePairings(pairings: Pairing[]) {
        localStorage.setItem(STORAGE_KEYS.PAIRINGS, JSON.stringify(pairings));
    }

    private getPartnerRequests(): PartnerRequest[] {
        const data = localStorage.getItem(STORAGE_KEYS.PARTNER_REQUESTS);
        return data ? JSON.parse(data) : [];
    }

    private savePartnerRequests(requests: PartnerRequest[]) {
        localStorage.setItem(STORAGE_KEYS.PARTNER_REQUESTS, JSON.stringify(requests));
    }

    private log(action: string, details?: string) {
        const logs = this.getLogs();
        logs.unshift({
            id: generateId(),
            action,
            details,
            timestamp: new Date().toISOString(),
        });
        this.saveLogs(logs);
    }

    // --- Public API ---

    async initialize() {
        // Create default admin if not exists
        const users = this.getUsers();
        if (!users.find(u => u.role === 'ADMIN')) {
            const admin: DbUser = {
                id: 'admin-001',
                name: 'System Admin',
                email: 'admin@finance.com',
                password: 'admin', // Very secure
                role: 'ADMIN',
                createdAt: new Date(),
            };
            users.push(admin);
            this.saveUsers(users);
            this.log('SYSTEM_INIT', 'Created default admin account');
        }
    }

    async getAllUsers(): Promise<DbUser[]> {
        await delay(300);
        return this.getUsers().map(({ password, ...u }) => ({ ...u })); // Omit password
    }

    async deleteUser(userId: string): Promise<void> {
        await delay(500);
        const users = this.getUsers();
        const filtered = users.filter(u => u.id !== userId);
        this.saveUsers(filtered);
        this.log('USER_DELETED', `User ID: ${userId}`);
    }

    async generateResetCode(adminId: string, targetEmail: string): Promise<string> {
        await delay(500);
        const users = this.getUsers();
        const targetUser = users.find(u => u.email === targetEmail);
        if (!targetUser) throw new Error('User not found');

        const codes = this.getCodes();

        // Generate 6 digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        const newCode: PasswordResetCode = {
            id: generateId(),
            code,
            userId: targetUser.id,
            createdBy: adminId,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 mins
        };

        codes.push(newCode);
        this.saveCodes(codes);
        this.log('RESET_CODE_GENERATED', `For: ${targetEmail} By: ${adminId}`);

        return code;
    }

    async verifyAndResetPassword(email: string, code: string, newPassword: string): Promise<void> {
        await delay(800);
        const users = this.getUsers();
        const codes = this.getCodes();

        const user = users.find(u => u.email === email);
        if (!user) throw new Error('User not found');

        // Find valid code
        const validCode = codes.find(c =>
            c.userId === user.id &&
            c.code === code &&
            !c.usedAt &&
            new Date(c.expiresAt) > new Date()
        );

        if (!validCode) throw new Error('Invalid or expired reset code');

        // Update User Password
        user.password = newPassword;
        this.saveUsers(users);

        // Mark Code Used
        validCode.usedAt = new Date().toISOString();
        this.saveCodes(codes);

        this.log('PASSWORD_RESET', `User: ${email} used reset code`);
    }

    async getAllLogs(): Promise<SystemLog[]> {
        await delay(200);
        return this.getLogs();
    }

    async getActiveCodes(): Promise<(PasswordResetCode & { email: string })[]> {
        await delay(200);
        const codes = this.getCodes();
        const users = this.getUsers();

        return codes.filter(c => !c.usedAt && new Date(c.expiresAt) > new Date()).map(c => {
            const user = users.find(u => u.id === c.userId);
            return { ...c, email: user?.email || 'Unknown' };
        });
    }

    // --- Notifications ---
    async createNotification(title: string, body: string, severity: 'info' | 'warning' | 'critical', userId?: string): Promise<void> {
        await delay(300);
        const notes = await this.getNotifications();
        notes.unshift({
            id: generateId(),
            title,
            body,
            severity,
            userId, // Optional: if present, only for this user. If null, for everyone (broadcast)
            createdAt: new Date().toISOString(),
        });
        localStorage.setItem('pf_db_notifications', JSON.stringify(notes));
        this.log('NOTIFICATION_SENT', `Title: ${title} to ${userId || 'BROADCAST'}`);
    }

    async getNotifications(userId?: string): Promise<any[]> {
        await delay(200);
        const data = localStorage.getItem('pf_db_notifications');
        const allNotes = data ? JSON.parse(data) : [];
        // Return broadcasts (no userId) + user specific notes
        if (!userId) return allNotes;
        return allNotes.filter((n: any) => !n.userId || n.userId === userId);
    }


    // --- Partner Request System ---
    async sendPartnerRequest(fromUserId: string, toEmail: string): Promise<{ success: boolean; error?: string }> {
        await delay(300);
        const users = this.getUsers();
        const fromUser = users.find(u => u.id === fromUserId);
        const toUser = users.find(u => u.email.toLowerCase() === toEmail.toLowerCase());

        // Debug logging
        console.log('=== PARTNER REQUEST DEBUG ===');
        console.log('All users:', users.map(u => ({ id: u.id, name: u.name, email: u.email })));
        console.log('Searching for email:', toEmail);
        console.log('Searching for (lowercased):', toEmail.toLowerCase());

        // Check each user
        users.forEach(u => {
            console.log(`User: ${u.name}`);
            console.log(`  - Email: "${u.email}"`);
            console.log(`  - Email (lowercased): "${u.email.toLowerCase()}"`);
            console.log(`  - Match? ${u.email.toLowerCase() === toEmail.toLowerCase()}`);
        });

        console.log('From user:', fromUser?.email);
        console.log('Found user:', toUser);

        if (!fromUser) {
            return { success: false, error: 'You must be logged in' };
        }

        if (!toUser) {
            return { success: false, error: 'No user found with that email' };
        }

        if (toUser.id === fromUserId) {
            return { success: false, error: 'You cannot send a request to yourself' };
        }

        // Check if already paired
        const pairings = this.getPairings();
        const existingPairing = pairings.find(p =>
            (p.user1Id === fromUserId && p.user2Id === toUser.id) ||
            (p.user1Id === toUser.id && p.user2Id === fromUserId)
        );

        if (existingPairing) {
            return { success: false, error: 'You are already paired with this user' };
        }

        // Check for existing pending request
        const requests = this.getPartnerRequests();
        const existingRequest = requests.find(r =>
            r.status === 'pending' &&
            ((r.fromUserId === fromUserId && r.toUserId === toUser.id) ||
                (r.fromUserId === toUser.id && r.toUserId === fromUserId))
        );

        if (existingRequest) {
            return { success: false, error: 'A pending request already exists' };
        }

        // Create new request
        const newRequest: PartnerRequest = {
            id: generateId(),
            fromUserId: fromUser.id,
            fromUserName: fromUser.name,
            toUserId: toUser.id,
            toUserName: toUser.name,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };

        requests.push(newRequest);
        this.savePartnerRequests(requests);
        this.log('PARTNER_REQUEST_SENT', `From: ${fromUser.name} To: ${toUser.name}`);

        // Notify recipient
        await this.createNotification(
            '🤝 Partner Request',
            `${fromUser.name} wants to pair with you!`,
            'info',
            toUser.id
        );

        return { success: true };
    }

    async respondToRequest(requestId: string, accept: boolean): Promise<{ success: boolean; error?: string; partner?: DbUser }> {
        await delay(300);
        const requests = this.getPartnerRequests();
        const request = requests.find(r => r.id === requestId);

        if (!request) {
            return { success: false, error: 'Request not found' };
        }

        if (request.status !== 'pending') {
            return { success: false, error: 'Request has already been responded to' };
        }

        // Update request status
        request.status = accept ? 'accepted' : 'declined';
        this.savePartnerRequests(requests);

        if (accept) {
            // Create pairing
            const pairings = this.getPairings();
            const newPairing: Pairing = {
                id: generateId(),
                user1Id: request.fromUserId,
                user2Id: request.toUserId,
                createdAt: new Date().toISOString(),
            };
            pairings.push(newPairing);
            this.savePairings(pairings);

            this.log('PARTNER_REQUEST_ACCEPTED', `${request.toUserName} accepted ${request.fromUserName}`);

            // Notify sender
            await this.createNotification(
                '🎉 Request Accepted!',
                `${request.toUserName} accepted your partner request!`,
                'info',
                request.fromUserId
            );

            // Return partner info
            const users = this.getUsers();
            const partner = users.find(u => u.id === request.fromUserId);
            if (partner) {
                const { password: _, ...safePartner } = partner;
                return { success: true, partner: safePartner };
            }
        } else {
            this.log('PARTNER_REQUEST_DECLINED', `${request.toUserName} declined ${request.fromUserName}`);
        }

        return { success: true };
    }

    async getUserRequests(userId: string): Promise<PartnerRequest[]> {
        await delay(200);
        const requests = this.getPartnerRequests();
        return requests.filter(r => r.toUserId === userId);
    }

    async getSentRequests(userId: string): Promise<PartnerRequest[]> {
        await delay(200);
        const requests = this.getPartnerRequests();
        return requests.filter(r => r.fromUserId === userId);
    }

    async cancelRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
        await delay(200);
        const requests = this.getPartnerRequests();
        const request = requests.find(r => r.id === requestId);

        if (!request) {
            return { success: false, error: 'Request not found' };
        }

        if (request.status !== 'pending') {
            return { success: false, error: 'Only pending requests can be canceled' };
        }

        // Remove request
        const updatedRequests = requests.filter(r => r.id !== requestId);
        this.savePartnerRequests(updatedRequests);
        this.log('PARTNER_REQUEST_CANCELED', `Request from ${request.fromUserName} to ${request.toUserName}`);

        return { success: true };
    }


    async getPartner(userId: string): Promise<DbUser | null> {
        await delay(200);
        const pairings = this.getPairings();
        const pairing = pairings.find(p => p.user1Id === userId || p.user2Id === userId);

        if (!pairing) return null;

        const partnerId = pairing.user1Id === userId ? pairing.user2Id : pairing.user1Id;
        const users = this.getUsers();
        const partner = users.find(u => u.id === partnerId);

        if (partner) {
            const { password: _, ...safePartner } = partner;
            return safePartner;
        }

        return null;
    }

    async unpairUser(userId: string): Promise<void> {
        await delay(200);
        const pairings = this.getPairings();
        const updatedPairings = pairings.filter(p => p.user1Id !== userId && p.user2Id !== userId);
        this.savePairings(updatedPairings);
        this.log('USERS_UNPAIRED', `User: ${userId}`);
    }
    async registerUser(email: string, name: string, password?: string): Promise<DbUser> {
        await delay(500);
        const users = this.getUsers();
        if (users.find(u => u.email === email)) {
            throw new Error('User already exists');
        }

        const newUser: DbUser = {
            id: generateId(),
            email,
            name,
            password: password || 'password',
            role: 'USER',
            createdAt: new Date(),
        };

        users.push(newUser);
        this.saveUsers(users);
        this.log('USER_REGISTERED', `Email: ${email}`);

        // Return without password
        const { password: _, ...safeUser } = newUser;
        return safeUser;
    }

    async updateProfile(userId: string, data: { name?: string; email?: string; avatar?: string; currency?: string }): Promise<DbUser> {
        await delay(500);
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) throw new Error('User not found');

        const updatedUser = { ...users[userIndex], ...data };
        users[userIndex] = updatedUser;
        this.saveUsers(users);

        this.log('USER_UPDATE', `User ID: ${userId}`);
        const { password: _, ...safeUser } = updatedUser;
        return safeUser;
    }

    async changePassword(userId: string, oldPass: string, newPass: string): Promise<void> {
        await delay(500);
        const users = this.getUsers();
        const user = users.find(u => u.id === userId);

        if (!user) throw new Error('User not found');
        if (user.password !== oldPass) throw new Error('Incorrect current password');

        user.password = newPass;
        this.saveUsers(users);
        this.log('PASSWORD_CHANGE', `User ID: ${userId}`);
    }
}

export const mockBackend = new MockBackendService();
mockBackend.initialize();
