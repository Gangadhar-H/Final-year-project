// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import API from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Hydrate from localStorage on first render
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });

    // Keep localStorage in sync with user state
    useEffect(() => {
        if (user) localStorage.setItem('user', JSON.stringify(user));
        else localStorage.removeItem('user');
    }, [user]);

    // Login: send credentials, receive { admin, role }, then merge and store
    const login = async (credentials) => {
        const res = await API.post('/admin/login', credentials);
        const { admin, role } = res.data;
        const userObj = { ...admin, role };
        setUser(userObj);
        return role;
    };

    // Logout: clear user state (and localStorage via effect)
    const logout = () => {
        setUser(null);
        // Optionally call backend to clear cookie: await API.post('/auth/logout');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
