import React, { createContext, useState, useEffect } from 'react';
import axios from '../utils/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is authenticated on mount
    useEffect(() => {
        const checkAuthStatus = async () => {
            setLoading(true);
            try {
                // Check if there's a token stored
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    setLoading(false);
                    return;
                }

                // Validate token by fetching user data
                const response = await axios.get('/api/v1/admin/profile');
                setCurrentUser(response.data.admin);
            } catch (err) {
                console.error('Authentication check failed:', err);
                // Clear invalid tokens
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
            } finally {
                setLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    // Login function
    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('/api/v1/admin/login', { email, password });

            // Save tokens
            localStorage.setItem('accessToken', response.data.accessToken || '');
            localStorage.setItem('refreshToken', response.data.refreshToken || '');

            // Set current user
            setCurrentUser(response.data.admin);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Logout function
    const logout = async () => {
        setLoading(true);
        try {
            // Optional: Call logout endpoint if your API has one
            // await axios.post('/api/v1/admin/logout');
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            // Clear local storage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setCurrentUser(null);
            setLoading(false);
        }
    };

    const value = {
        currentUser,
        loading,
        error,
        login,
        logout,
        isAuthenticated: !!currentUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};