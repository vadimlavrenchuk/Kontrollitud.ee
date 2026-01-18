// Kontrollitud.ee/frontend/src/Login.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './styles/Login.scss';

function Login() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${apiUrl}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Invalid password');
            }

            // Store token in localStorage
            localStorage.setItem('adminToken', data.token);
            
            // Dispatch custom event to notify App component
            window.dispatchEvent(new Event('authChange'));
            
            // Redirect to admin dashboard
            navigate('/admin');

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <i className="fas fa-shield-alt"></i>
                        <h1>Admin Login</h1>
                        <p>Enter your password to access the admin dashboard</p>
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            <i className="fas fa-exclamation-circle"></i>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="password">
                                <i className="fas fa-lock"></i> Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="form-input"
                                placeholder="Enter admin password"
                                autoFocus
                            />
                        </div>

                        <button type="submit" disabled={loading} className="btn-login">
                            {loading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i> Logging in...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-sign-in-alt"></i> Login
                                </>
                            )}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>
                            <i className="fas fa-info-circle"></i>
                            Default password: <code>admin123</code>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
