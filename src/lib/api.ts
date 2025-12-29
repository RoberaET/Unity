import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for Auth Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 (Unauthorized) - could implement refresh logic here
        if (error.response?.status === 401 && !originalRequest?._retry) {
            // For now, just logout or rely on AuthContext to handle it
            // localStorage.removeItem('token');
            // window.location.href = '/auth/login';
        }

        return Promise.reject(error);
    }
);

export default api;
