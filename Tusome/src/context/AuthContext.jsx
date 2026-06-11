import { createContext, useState } from 'react';
import { authAPI } from '../api/axios';

const AuthContext = createContext(null);
export { AuthContext };

function readStoredUser() {
    try {
        const raw = localStorage.getItem('tu_user');
        return raw && localStorage.getItem('tu_access') ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export default function AuthProvider({ children }) {
    // Lazy initializer reads localStorage once — no setState-in-effect needed.
    const [user, setUser] = useState(readStoredUser);

    // ── Login ──────────────────────────────────────────────────
    const login = async (identifier, password) => {
        try {
            const response = await authAPI.login({ identifier, password });
            const { access, refresh, user: loggedIn } = response.data;

            localStorage.setItem('tu_access', access);
            localStorage.setItem('tu_refresh', refresh);
            localStorage.setItem('tu_user', JSON.stringify(loggedIn || {}));

            setUser(loggedIn);
            return { success: true, user: loggedIn };
        } catch (error) {
            const message = error.response?.data?.detail
                || 'Login failed. Please try again.';
            return { success: false, message };
        }
    };

    // ── Register (then auto-login) ─────────────────────────────
    const register = async (userData) => {
        try {
            await authAPI.register(userData);
            return login(userData.email || userData.phone, userData.password);
        } catch (error) {
            const errors = error.response?.data || {};
            const message = errors.detail || 'Registration failed. Please try again.';
            return { success: false, message, errors };
        }
    };

    // ── Logout (client-side: discard tokens) ───────────────────
    const logout = () => {
        localStorage.removeItem('tu_access');
        localStorage.removeItem('tu_refresh');
        localStorage.removeItem('tu_user');
        setUser(null);
    };

    // ── Helpers ────────────────────────────────────────────────
    const isAuthenticated = () => !!user && !!localStorage.getItem('tu_access');
    const isStudent = () => user?.role === 'student';
    const isConsultant = () => user?.role === 'consultant';
    const isAdmin = () => user?.role === 'admin';

    return (
        <AuthContext.Provider value={{
            user,
            login,
            register,
            logout,
            isAuthenticated,
            isStudent,
            isConsultant,
            isAdmin,
        }}>
            {children}
        </AuthContext.Provider>
    );
}
