import api from '../lib/api';
import { User } from '../types/finance';

export interface PartnerRequest {
    id: string;
    fromUserId: string;
    fromUser: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
    };
    toUserId: string;
    toUser: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
    };
    status: 'pending' | 'accepted' | 'declined';
    createdAt: string;
}

export const PartnerService = {
    async sendRequest(email: string) {
        const response = await api.post('/partners/request', { email });
        return response.data;
    },

    async respondToRequest(requestId: string, accept: boolean) {
        const response = await api.post('/partners/respond', { requestId, accept });
        return response.data;
    },

    async getRequests() {
        // Backend returns { received: [], sent: [] }
        const response = await api.get<{ received: PartnerRequest[], sent: PartnerRequest[] }>('/partners/requests');
        return response.data;
    },

    async unpair() {
        const response = await api.delete('/partners');
        return response.data;
    },

    async getPartner() {
        const response = await api.get<User | null>('/partners');
        return response.data;
    }
};
