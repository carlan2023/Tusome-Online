import { useContext } from 'react';
import { AuthContext } from './AuthContext';

/** Hook lives in its own file so React Fast Refresh stays happy. */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider');
    }
    return context;
}
