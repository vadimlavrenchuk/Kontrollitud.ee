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
        displayName: '',
        plan: 'basic' // Default plan
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
            result = await signUpWithEmail(formData.email, formData.password, formData.displayName, formData.plan);
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
                    <h2>{isLogin ? 'Войти' : 'Регистрация'}</h2>
                    
                    <button 
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="google-btn"
                    >
                        Google
                    </button>
                    
                    <div className="separator">или</div>
                    
                    <form onSubmit={handleEmailAuth}>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Email"
                            required
                        />
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Пароль"
                            required
                            minLength={6}
                        />
                        <button type="submit" disabled={loading}>
                            {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
                        </button>
                    </form>
                    
                    <p className="switch-text">
                        {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
                        <button 
                            onClick={() => setIsLogin(!isLogin)}
                            className="switch-button"
                            type="button"
                        >
                            {isLogin ? 'Регистрация' : 'Войти'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default AuthPage;

