// AuthContext.jsx - Context for managing authentication state
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, subscribeToAuthChanges, logOut } from './firebase';

const API_BASE = import.meta.env.VITE_API_URL || '';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Subscribe to auth state changes
        const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
            if (firebaseUser) {
                // User is signed in
                const token = await firebaseUser.getIdToken();
                
                // Store token for API requests
                localStorage.setItem('authToken', token);
                localStorage.setItem('userEmail', firebaseUser.email);
                
                setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL,
                    emailVerified: firebaseUser.emailVerified,
                    getIdToken: () => firebaseUser.getIdToken(),
                });

                // Check admin status via backend (no emails in frontend code)
                try {
                    const res = await fetch(`${API_BASE}/api/admin/verify`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setIsAdmin(res.ok);
                } catch {
                    setIsAdmin(false);
                }
            } else {
                // User is signed out
                localStorage.removeItem('authToken');
                localStorage.removeItem('userEmail');
                setUser(null);
                setIsAdmin(false);
            }
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    const logout = async () => {
        setLoading(true);
        try {
            await logOut();
            setUser(null);
            setIsAdmin(false);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const refreshToken = async () => {
        if (auth.currentUser) {
            const token = await auth.currentUser.getIdToken(true);
            localStorage.setItem('authToken', token);
            return token;
        }
        return null;
    };

    const value = {
        user,
        loading,
        error,
        logout,
        refreshToken,
        isAuthenticated: !!user,
        isAdmin,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
