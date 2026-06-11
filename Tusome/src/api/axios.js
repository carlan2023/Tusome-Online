import axios from 'axios';

// ── Base URL ───────────────────────────────────────────────────
// Same source of truth as config/api.js: VITE_API_URL in production,
// local Django in development.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

// ── Create axios instance ──────────────────────────────────────
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ── Request interceptor ────────────────────────────────────────
// Automatically adds the JWT token to every request.
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('tu_access');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response interceptor ───────────────────────────────────────
// Refreshes an expired access token once, then retries the request.
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refresh = localStorage.getItem('tu_refresh');
                const response = await axios.post(
                    `${BASE_URL}/auth/refresh/`,
                    { refresh }
                );

                const { access } = response.data;
                localStorage.setItem('tu_access', access);
                originalRequest.headers.Authorization = `Bearer ${access}`;

                return api(originalRequest);
            } catch {
                // Refresh token expired — log the user out.
                localStorage.removeItem('tu_access');
                localStorage.removeItem('tu_refresh');
                localStorage.removeItem('tu_user');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

// ── Auth API calls (matched to backend/accounts/urls.py) ──────
export const authAPI = {
    // Register new user (email or phone + password)
    register: (userData) => api.post('/auth/register/', userData),

    // Login with { identifier, password } → { access, refresh, user }
    login: (credentials) => api.post('/auth/login/', credentials),

    // Current user profile
    getProfile: () => api.get('/auth/me/'),

    // Update own profile (full_name, phone)
    updateProfile: (data) => api.patch('/auth/me/', data),

    // Account verification
    verifyEmail: (token) => api.post('/auth/verify/email/', { token }),
    verifyOtp: (code) => api.post('/auth/verify/otp/', { code }),
    resendVerification: (channel) => api.post('/auth/verify/resend/', { channel }),

    // Password recovery
    forgotPassword: (identifier) => api.post('/auth/password/forgot/', { identifier }),
    resetPassword: (payload) => api.post('/auth/password/reset/', payload),
};

export default api;
