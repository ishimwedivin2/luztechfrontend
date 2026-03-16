import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.success) {
                const userData = response.data;
                setUser(userData);
                localStorage.setItem('token', userData.token);
                localStorage.setItem('refreshToken', userData.refreshToken);
                localStorage.setItem('user', JSON.stringify(userData));
                return { success: true };
            }
            return { success: false, message: response.message };
        } catch (error) {
            return { success: false, message: error.message || 'Login failed' };
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            return response;
        } catch (error) {
            return { success: false, message: error.message || 'Registration failed' };
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error', error);
        } finally {
            setUser(null);
            localStorage.clear();
            window.location.href = '/login';
        }
    };

    const hasRole = (role) => {
        return user?.roles?.includes(role) || user?.roles?.includes(`ROLE_${role}`);
    };

    const isAdmin = () => hasRole('ADMIN');
    const isEmployee = () => hasRole('EMPLOYEE');
    const isSupportAgent = () => hasRole('SUPPORT_AGENT');

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, isAdmin, isEmployee, isSupportAgent, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
