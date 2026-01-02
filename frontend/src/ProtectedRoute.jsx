// Kontrollitud.ee/frontend/src/ProtectedRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

// Список email-адресов админов
const ADMIN_EMAILS = [
    'vadim5239@gmail.com',
    'vadimlavrenchuk@yahoo.com',
    'admin@kontrollitud.ee'
];

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    
    // Show loading state while checking auth
    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <div>Loading...</div>
            </div>
        );
    }
    
    // Check if user is authenticated
    if (!user) {
        return <Navigate to="/auth" replace />;
    }
    
    // Check if user is admin
    const isAdmin = ADMIN_EMAILS.includes(user.email);
    
    if (!isAdmin) {
        return (
            <div style={{ 
                padding: '40px', 
                textAlign: 'center',
                maxWidth: '600px',
                margin: '100px auto'
            }}>
                <h2>⛔ Access Denied</h2>
                <p>You don't have admin privileges.</p>
                <p>Current email: <strong>{user.email}</strong></p>
                <button 
                    onClick={() => window.location.href = '/'} 
                    style={{
                        marginTop: '20px',
                        padding: '10px 20px',
                        fontSize: '16px',
                        cursor: 'pointer'
                    }}
                >
                    Go to Home
                </button>
            </div>
        );
    }
    
    return children;
}

export default ProtectedRoute;
