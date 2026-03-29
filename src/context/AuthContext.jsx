import { createContext, useContext, useState, useCallback } from 'react';
import { loginUser, registerUser } from '../api/auth';

const AuthContext = createContext(null);

const TOKEN_KEY = 'dt_token';
const USER_KEY = 'dt_user';

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem(USER_KEY)); }
        catch { return null; }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const persist = (tok, usr) => {
        localStorage.setItem(TOKEN_KEY, tok);
        localStorage.setItem(USER_KEY, JSON.stringify(usr));
        setToken(tok);
        setUser(usr);
    };

    const login = useCallback(async (email, password) => {
        setLoading(true); setError('');
        try {
            const { data } = await loginUser({ email, password });
            persist(data.token, data.user);
            return true;
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
            return false;
        } finally { setLoading(false); }
    }, []);

    const register = useCallback(async (name, email, password) => {
        setLoading(true); setError('');
        try {
            const { data } = await registerUser({ name, email, password });
            persist(data.token, data.user);
            return true;
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
            return false;
        } finally { setLoading(false); }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ token, user, loading, error, login, register, logout, setError }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
