import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is already logged in on page load
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');

        if (savedUser && token) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    // ── Login ──────────────────────────────────────────────────
    const login = async (email, password) => {
        try {
            const response = await authAPI.login({ email, password });
            const { user, tokens } = response.data;

            // Save to localStorage
            localStorage.setItem('access_token', tokens.access);
            localStorage.setItem('refresh_token', tokens.refresh);
            localStorage.setItem('user', JSON.stringify(user));

            setUser(user);

            return { success: true, user };
        } catch (error) {
            const message = error.response?.data?.message
                || 'Login failed. Please try again.';
            return { success: false, message };
        }
    };

    // ── Register ───────────────────────────────────────────────
    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData);
            const { user, tokens } = response.data;

            // Save to localStorage
            localStorage.setItem('access_token', tokens.access);
            localStorage.setItem('refresh_token', tokens.refresh);
            localStorage.setItem('user', JSON.stringify(user));

            setUser(user);

            return { success: true, user };
        } catch (error) {
            const message = error.response?.data?.message
                || 'Registration failed. Please try again.';
            const errors = error.response?.data?.errors || {};
            return { success: false, message, errors };
        }
    };

    // ── Logout ─────────────────────────────────────────────────
    const logout = async () => {
        try {
            const refresh = localStorage.getItem('refresh_token');
            await authAPI.logout(refresh);
        } catch (error) {
            console.log('Logout error:', error);
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            setUser(null);
        }
    };

    // ── Check if user is authenticated ─────────────────────────
    const isAuthenticated = () => {
        return !!user && !!localStorage.getItem('access_token');
    };

    // ── Check user role ─────────────────────────────────────────
    const isLearner = () => user?.role === 'learner';
    const isConsultant = () => user?.role === 'consultant';
    const isAdmin = () => user?.role === 'admin';

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            register,
            logout,
            isAuthenticated,
            isLearner,
            isConsultant,
            isAdmin,
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider');
    }
    return context;
}