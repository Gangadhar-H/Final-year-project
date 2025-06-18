// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import API from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Hydrate from localStorage on first render
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Keep localStorage in sync with user state
    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

    // Generic login function that handles both admin and teacher
    const login = async (credentials, role = 'admin') => {
        try {
            setLoading(true);
            setError(null);

            let response;
            let userObj;

            if (role === 'admin') {
                response = await API.post('/admin/login', credentials);
                const { admin, role: userRole } = response.data;
                userObj = { ...admin, role: userRole };
            } else if (role === 'teacher') {
                response = await API.post('/teacher/login', credentials);
                const { teacher, role: userRole } = response.data;
                userObj = { ...teacher, role: userRole };
            } else if (role === 'student') {
                response = await API.post('/student/login', credentials);
                const { student, role: userRole } = response.data;
                userObj = { ...student, role: userRole };
            } else {
                throw new Error('Invalid role specified');
            }

            setUser(userObj);
            return userObj.role;

        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Login failed';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Auto-detect login based on credentials (fallback approach)
    const autoLogin = async (credentials) => {
        try {
            setLoading(true);
            setError(null);

            // Try teacher login first
            try {
                const teacherResponse = await API.post('/teacher/login', credentials);
                const { teacher, role } = teacherResponse.data;
                const userObj = { ...teacher, role };
                setUser(userObj);
                return role; // ✅ Important!
            } catch (teacherError) {
                // If teacher login fails, try admin
                try {
                    const adminResponse = await API.post('/admin/login', credentials);
                    const { admin, role } = adminResponse.data;
                    const userObj = { ...admin, role };
                    setUser(userObj);
                    return role; // ✅ Important!
                } catch (adminError) {
                    // If admin login also fails, try student
                    const studentResponse = await API.post('/student/login', credentials);
                    const { student, role } = studentResponse.data;
                    const userObj = { ...student, role };
                    setUser(userObj);
                    return role; // ✅ Important!
                }
            }

        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Login failed';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };



    // Logout function with role-specific API calls
    const logout = async () => {
        try {
            setLoading(true);

            if (user?.role === 'admin') {
                await API.post('/admin/logout');
            } else if (user?.role === 'teacher') {
                await API.post('/teacher/logout');
            } else if (user?.role === 'student') {
                await API.post('/student/logout');
            }

        } catch (err) {
            console.error('Logout error:', err);
            // Continue with local logout even if API call fails
        } finally {
            setUser(null);
            setLoading(false);
        }
    };

    // Check if user is authenticated
    const isAuthenticated = () => {
        return !!user;
    };

    // Check if user has specific role
    const hasRole = (role) => {
        return user?.role === role;
    };

    // Get user role
    const getUserRole = () => {
        return user?.role || null;
    };

    // Clear error
    const clearError = () => {
        setError(null);
    };

    // Update user profile (for profile updates)
    const updateUser = (updatedUserData) => {
        if (user) {
            const updatedUser = { ...user, ...updatedUserData };
            setUser(updatedUser);
        }
    };

    const contextValue = {
        user,
        loading,
        error,
        login,
        autoLogin,
        logout,
        isAuthenticated,
        hasRole,
        getUserRole,
        clearError,
        updateUser
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};