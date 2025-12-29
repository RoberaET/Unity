
import api from '../lib/api';
import { User } from '../types/finance';

interface LoginResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

interface RegisterResponse {
    user: User;
}

export const AuthService = {
    // Check if running on localhost (dev or preview)
    isLocalDev(): boolean {
        return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    },

    // DEV ONLY: Bypass login that always works
    async devLogin(email?: string, name?: string): Promise<LoginResponse> {
        const response = await api.post('/dev/dev-login', { email, name });
        return response.data;
    },

    async login(email: string, password: string): Promise<LoginResponse> {
        // Always use dev bypass on localhost
        if (this.isLocalDev()) {
            console.log('🔧 Using dev bypass login (localhost detected)');
            return this.devLogin(email);
        }

        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    async register(email: string, name: string, password?: string): Promise<RegisterResponse> {
        // Always use dev bypass on localhost
        if (this.isLocalDev()) {
            console.log('🔧 Using dev bypass for signup (localhost detected)');
            return { user: (await this.devLogin(email, name)).user };
        }

        const response = await api.post('/auth/signup', { email, name, password });
        return response.data;
    },

    async logout(sessionId?: string) {
        // If we have a session ID, we can revoke it on the backend
        // For now, we typically just clear local storage
        if (sessionId) {
            await api.post('/auth/logout', { sessionId });
        }
    },

    async getMe(): Promise<{ user: User }> {
        const response = await api.get('/auth/me');
        return response.data;
    },

    async changePassword(currentPassword: string, newPassword: string) {
        const response = await api.post('/auth/change-password', { currentPassword, newPassword });
        return response.data;
    }
};
