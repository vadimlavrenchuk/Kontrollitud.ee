// Kontrollitud.ee/frontend/src/ProtectedRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    
    return children;
}

export default ProtectedRoute;
