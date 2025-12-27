// RequireAuth.jsx - Component to protect routes requiring authentication
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

function RequireAuth({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                flexDirection: 'column',
                gap: '20px'
            }}>
                <div style={{
                    width: '60px',
                    height: '60px',
                    border: '4px solid #e5e7eb',
                    borderTopColor: '#667eea',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Loading...</p>
            </div>
        );
    }

    if (!user) {
        // Redirect to auth page, but save the location they were trying to access
        return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
    }

    return children;
}

export default RequireAuth;
