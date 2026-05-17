import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, role, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading Auth...</div>;
    }

    if (!user) {
        // Redirect completely unauthenticated users to the public login portal
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        // If logged in, but wrong role, push them to their designated dashboard
        if (role === 'admin') return <Navigate to="/admin" replace />;
        if (role === 'resident') return <Navigate to="/resident" replace />;
        return <Navigate to="/login" replace />; // Fallback
    }

    return children;
};
