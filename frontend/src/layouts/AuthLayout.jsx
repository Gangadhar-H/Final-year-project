import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AuthLayout = () => {
    const { isAuthenticated, loading } = useAuth();

    // Show loading indicator
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // Redirect if already authenticated
    if (isAuthenticated) {
        return <Navigate to="/admin" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-center text-primary-600 mb-8">
                    College Management System
                </h1>
                <Outlet />
            </div>
        </div>
    );
};

export default AuthLayout;