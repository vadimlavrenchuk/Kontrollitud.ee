// Kontrollitud.ee/frontend/src/Login.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faExclamationCircle, faLock, faSpinner, faSignInAlt, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
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
                        <FontAwesomeIcon icon={faShieldAlt} />
                        <h1>Admin Login</h1>
                        <p>Enter your password to access the admin dashboard</p>
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            <FontAwesomeIcon icon={faExclamationCircle} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="password">
                                <FontAwesomeIcon icon={faLock} /> Password
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
                                    <FontAwesomeIcon icon={faSpinner} spin /> Logging in...
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faSignInAlt} /> Login
                                </>
                            )}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>
                            <FontAwesomeIcon icon={faInfoCircle} />
                            Default password: <code>admin123</code>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
