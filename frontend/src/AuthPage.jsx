// AuthPage.jsx - Modern Login/Register page with Social Auth
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faGoogle, 
    faFacebook 
} from '@fortawesome/free-brands-svg-icons';
import { 
    faEnvelope, 
    faLock, 
    faUser,
    faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { 
    signInWithGoogle, 
    signInWithFacebook, 
    signInWithEmail, 
    signUpWithEmail 
} from './firebase';
import './styles/AuthPage.scss';

function AuthPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        displayName: ''
    });

    // Get the redirect path from location state, default to home
    const from = location.state?.from || '/';

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        const { user, error } = await signInWithGoogle();
        setLoading(false);

        if (error) {
            toast.error(`❌ ${error}`);
        } else if (user) {
            toast.success(`✅ ${t('welcome_back')}, ${user.displayName || user.email}!`);
            navigate(from, { replace: true });
        }
    };

    const handleFacebookSignIn = async () => {
        setLoading(true);
        const { user, error } = await signInWithFacebook();
        setLoading(false);

        if (error) {
            toast.error(`❌ ${error}`);
        } else if (user) {
            toast.success(`✅ ${t('welcome_back')}, ${user.displayName || user.email}!`);
            navigate(from, { replace: true });
        }
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        
        if (!isLogin && formData.password !== formData.confirmPassword) {
            toast.error(t('passwords_dont_match'));
            return;
        }

        if (formData.password.length < 6) {
            toast.error(t('password_too_short'));
            return;
        }

        setLoading(true);

        let result;
        if (isLogin) {
            result = await signInWithEmail(formData.email, formData.password);
        } else {
            result = await signUpWithEmail(formData.email, formData.password, formData.displayName);
        }

        setLoading(false);

        if (result.error) {
            // Friendly error messages
            let errorMessage = result.error;
            if (result.error.includes('email-already-in-use')) {
                errorMessage = t('email_already_in_use');
            } else if (result.error.includes('invalid-email')) {
                errorMessage = t('invalid_email');
            } else if (result.error.includes('user-not-found') || result.error.includes('wrong-password')) {
                errorMessage = t('invalid_credentials');
            } else if (result.error.includes('weak-password')) {
                errorMessage = t('password_too_short');
            }
            toast.error(`❌ ${errorMessage}`);
        } else if (result.user) {
            const message = isLogin ? t('welcome_back') : t('account_created');
            toast.success(`✅ ${message}, ${result.user.displayName || result.user.email}!`);
            navigate(from, { replace: true });
        }
    };

    return (
        <div className="auth-page">
            <Helmet>
                <title>{isLogin ? t('login') : t('register')} - Kontrollitud.ee</title>
            </Helmet>

            <div className="auth-container">
                <button onClick={() => navigate(-1)} className="back-button">
                    <FontAwesomeIcon icon={faArrowLeft} />
                    <span>{t('back')}</span>
                </button>

                <div className="auth-card">
                    <div className="auth-header">
                        <h1>{isLogin ? t('login') : t('register')}</h1>
                        <p>{isLogin ? t('login_subtitle') : t('register_subtitle')}</p>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="social-auth">
                        <button 
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="social-button google-button"
                        >
                            <FontAwesomeIcon icon={faGoogle} />
                            <span>{t('continue_with_google')}</span>
                        </button>

                        <button 
                            onClick={handleFacebookSignIn}
                            disabled={loading}
                            className="social-button facebook-button"
                        >
                            <FontAwesomeIcon icon={faFacebook} />
                            <span>{t('continue_with_facebook')}</span>
                        </button>
                    </div>

                    <div className="divider">
                        <span>{t('or')}</span>
                    </div>

                    {/* Email/Password Form */}
                    <form onSubmit={handleEmailAuth} className="auth-form">
                        {!isLogin && (
                            <div className="form-group">
                                <label htmlFor="displayName">
                                    <FontAwesomeIcon icon={faUser} />
                                    {t('full_name')}
                                </label>
                                <input
                                    type="text"
                                    id="displayName"
                                    name="displayName"
                                    value={formData.displayName}
                                    onChange={handleInputChange}
                                    placeholder={t('enter_name')}
                                    required={!isLogin}
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="email">
                                <FontAwesomeIcon icon={faEnvelope} />
                                {t('email')}
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder={t('enter_email')}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">
                                <FontAwesomeIcon icon={faLock} />
                                {t('password')}
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder={t('enter_password')}
                                required
                                minLength={6}
                            />
                        </div>

                        {!isLogin && (
                            <div className="form-group">
                                <label htmlFor="confirmPassword">
                                    <FontAwesomeIcon icon={faLock} />
                                    {t('confirm_password')}
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    placeholder={t('confirm_password_placeholder')}
                                    required={!isLogin}
                                    minLength={6}
                                />
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="submit-button"
                        >
                            {loading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    {isLogin ? t('logging_in') : t('creating_account')}
                                </>
                            ) : (
                                isLogin ? t('login') : t('register')
                            )}
                        </button>
                    </form>

                    <div className="auth-switch">
                        <p>
                            {isLogin ? t('dont_have_account') : t('already_have_account')}
                            <button 
                                onClick={() => setIsLogin(!isLogin)}
                                className="switch-button"
                            >
                                {isLogin ? t('register') : t('login')}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AuthPage;
