import axios from 'axios';

// ── Base URL ───────────────────────────────────────────────────
const BASE_URL = 'http://127.0.0.1:8000/api';

// ── Create axios instance ──────────────────────────────────────
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ── Request interceptor ────────────────────────────────────────
// Automatically adds JWT token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response interceptor ───────────────────────────────────────
// Handles expired tokens automatically
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refresh = localStorage.getItem('refresh_token');
                const response = await axios.post(
                    `${BASE_URL}/auth/token/refresh/`,
                    { refresh }
                );

                const { access } = response.data;
                localStorage.setItem('access_token', access);
                originalRequest.headers.Authorization = `Bearer ${access}`;

                return api(originalRequest);
            } catch (err) {
                // Refresh token expired — log user out
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

// ── Auth API calls ─────────────────────────────────────────────
export const authAPI = {

    // Landing page data
    getLanding: () =>
        api.get('/auth/landing/'),

    // Register new user
    register: (userData) =>
        api.post('/auth/register/', userData),

    // Login
    login: (credentials) =>
        api.post('/auth/login/', credentials),

    // Logout
    logout: (refreshToken) =>
        api.post('/auth/logout/', { refresh_token: refreshToken }),

    // Get current user profile
    getProfile: () =>
        api.get('/auth/profile/'),

    // Update profile
    updateProfile: (data) =>
        api.put('/auth/profile/', data),

    // Change password
    changePassword: (data) =>
        api.post('/auth/change-password/', data),
};

export default api;