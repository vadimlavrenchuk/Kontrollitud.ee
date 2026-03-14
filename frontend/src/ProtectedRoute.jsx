// Kontrollitud.ee/frontend/src/ProtectedRoute.jsx
// Admin emails are NOT stored here — validation is done server-side via Firebase token.

import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || '';

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    const [adminStatus, setAdminStatus] = useState('checking'); // 'checking' | 'ok' | 'denied'

    useEffect(() => {
        if (loading) return;
        if (!user) {
            setAdminStatus('denied');
            return;
        }

        let cancelled = false;

        user.getIdToken()
            .then(token =>
                fetch(`${API_BASE}/api/admin/verify`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            )
            .then(res => {
                if (cancelled) return;
                setAdminStatus(res.ok ? 'ok' : 'denied');
            })
            .catch(() => {
                if (!cancelled) setAdminStatus('denied');
            });

        return () => { cancelled = true; };
    }, [user, loading]);

    if (loading || adminStatus === 'checking') {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div>Loading...</div>
            </div>
        );
    }

    if (!user) return <Navigate to="/auth" replace />;

    if (adminStatus === 'denied') {
        return (
            <div style={{ padding: '40px', textAlign: 'center', maxWidth: '600px', margin: '100px auto' }}>
                <h2>⛔ Access Denied</h2>
                <p>You don't have admin privileges.</p>
                <button
                    onClick={() => window.location.href = '/'}
                    style={{ marginTop: '20px', padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
                >
                    Go to Home
                </button>
            </div>
        );
    }

    return children;
}

export default ProtectedRoute;
