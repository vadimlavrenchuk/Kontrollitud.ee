import React, { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faList, faHandshake, faNewspaper, faPlusCircle, 
    faSignInAlt, faChevronDown, faShieldAlt, 
    faClipboardList, faSignOutAlt 
} from '@fortawesome/free-solid-svg-icons';

import './App.css';
import logo from './assets/logokontroll.webp';

// Импорты страниц
const CompanyList = lazy(() => import('./CompanyList.jsx'));
const CompanyDetails = lazy(() => import('./CompanyDetails.jsx'));
const AuthPage = lazy(() => import('./AuthPage.jsx'));

const AddBusiness = lazy(() => import('./AddBusiness.jsx'));
const EditCompany = lazy(() => import('./EditCompany.jsx'));
const AdminDashboard = lazy(() => import('./AdminDashboard.jsx'));
const UserDashboard = lazy(() => import('./UserDashboard.jsx'));
const CatalogPage = lazy(() => import('./pages/CatalogPage.jsx'));
const PartnersPage = lazy(() => import('./pages/PartnersPage.jsx'));
const BlogPage = lazy(() => import('./pages/BlogPage.jsx'));
const BlogPostDetail = lazy(() => import('./pages/BlogPostDetail.jsx'));
const AboutPage = lazy(() => import('./pages/AboutPage.jsx'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess.jsx'));
const PaymentCancelled = lazy(() => import('./pages/PaymentCancelled.jsx'));
const PaymentPage = lazy(() => import('./pages/PaymentPage.jsx'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage.jsx'));
const TermsOfUsePage = lazy(() => import('./pages/TermsOfUsePage.jsx'));

import ProtectedRoute from './ProtectedRoute.jsx';
import RequireAuth from './RequireAuth.jsx';
import { AuthProvider, useAuth } from './AuthContext.jsx';

// Lazy load Footer и PWA для уменьшения critical path
const Footer = lazy(() => import('./Footer.jsx'));
const PWAInstall = lazy(() => import('./components/PWAInstall.jsx').then(m => ({ default: m.default })));
const PWAInstallButton = lazy(() => import('./components/PWAInstall.jsx').then(m => ({ default: m.PWAInstallButton })));
const PWAProvider = lazy(() => import('./components/PWAInstall.jsx').then(m => ({ default: m.PWAProvider })));

// Вспомогательный компонент для прокрутки вверх при смене страницы
const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
    return null;
};

// Компонент для роутов с доступом к location
const AppRoutes = () => {
    const location = useLocation();
    
    // Улучшенный loader компонент для предотвращения CLS
    const SuspenseLoader = () => (
        <div className="page-loader" style={{
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div className="spinner" />
        </div>
    );
    
    return (
        <Suspense fallback={<SuspenseLoader />}>
            <Routes>
                <Route path="/" element={<CompanyList />} />
                <Route 
                    path="/catalog" 
                    element={<CatalogPage />} 
                    key={location.pathname + location.search}
                />
                <Route path="/partners" element={<PartnersPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsOfUsePage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:id" element={<BlogPostDetail />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/payment-cancelled" element={<PaymentCancelled />} />
                
                <Route path="/payment" element={<RequireAuth><PaymentPage /></RequireAuth>} />
                <Route path="/add-business" element={<RequireAuth><AddBusiness /></RequireAuth>} />
                <Route path="/dashboard" element={<RequireAuth><UserDashboard /></RequireAuth>} />
                <Route path="/edit-business/:id" element={<RequireAuth><EditCompany /></RequireAuth>} />
                <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                
                <Route path="/companies/:slugOrId" element={<CompanyDetails />} />
                <Route path="/company/:slugOrId" element={<CompanyDetails />} />
                <Route path="*" element={<div className="container"><h2>404</h2></div>} />
            </Routes>
        </Suspense>
    );
};

function AppContent() {
    const { t, i18n } = useTranslation();
    const { user, logout, isAuthenticated } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    
    const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@kontrollitud.ee';
    const isAdmin = user && user.email === ADMIN_EMAIL;
    
    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('language', lng);
    };

    useEffect(() => {
        document.documentElement.lang = i18n.language;
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [i18n.language]);

    // Закрытие меню при клике по ссылке (для мобилок)
    const closeMenus = () => {
        setShowMobileMenu(false);
        setShowUserMenu(false);
    };

    return (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ScrollToTop />
            <div className={`app-main ${showMobileMenu ? 'nav-open' : ''}`}>
                <Helmet>
                    <title>Kontrollitud.ee - {t('app_title')}</title>
                </Helmet>
                
                {/* Announcement Bar */}
                <div className="announcement-bar">
                    <span className="pulse-icon">⚡</span>
                    <span className="announcement-text">{t('announcement_text') || 'Новые компании добавляются каждый день!'}</span>
                </div>
                
                <header className={`sticky-navbar ${isScrolled ? 'scrolled' : ''}`}>
                    <div className="navbar-container">
                        <div className="navbar-brand">
                            <Link to="/" className="logo-link" onClick={closeMenus}>
                                <img src={logo} alt="Logo" className="logo-image" />
                                <h1 className="logo-text">{t('app_title')}</h1>
                            </Link>
                        </div>

                        <div className="navbar-right">
                            {/* Десктопное меню */}
                            <nav className="desktop-nav">
                                <CatalogLink closeMenus={closeMenus} className="catalog-btn">
                                    <FontAwesomeIcon icon={faList} /> {t('catalog')}
                                </CatalogLink>
                                <Link to="/partners" className="business-btn"><FontAwesomeIcon icon={faHandshake} /> {t('for_business')}</Link>
                                <Link to="/blog" className="blog-btn"><FontAwesomeIcon icon={faNewspaper} /> {t('blog')}</Link>
                                <Link to="/add-business" className="add-btn"><FontAwesomeIcon icon={faPlusCircle} /> {t('add_business')}</Link>
                            </nav>

                            {/* Блок пользователя */}
                            <div className="user-section">
                                {!isAuthenticated ? (
                                    <Link to="/auth" className="login-link"><FontAwesomeIcon icon={faSignInAlt} /> <span>{t('login')}</span></Link>
                                ) : (
                                    <div className="user-menu-container">
                                        <button className="user-profile-button" onClick={() => setShowUserMenu(!showUserMenu)}>
                                            <div className="user-avatar-placeholder">{(user.displayName || user.email)?.[0]?.toUpperCase()}</div>
                                            <FontAwesomeIcon icon={faChevronDown} className={showUserMenu ? 'rotated' : ''} />
                                        </button>
                                        
                                        {showUserMenu && (
                                            <div className="user-dropdown">
                                                {isAdmin && <Link to="/admin" onClick={closeMenus}><FontAwesomeIcon icon={faShieldAlt} /> Admin</Link>}
                                                <Link to="/dashboard" onClick={closeMenus}><FontAwesomeIcon icon={faClipboardList} /> {t('my_dashboard')}</Link>
                                                <div className="dropdown-divider"></div>
                                                <Suspense fallback={<button className="install-pwa-button">📱 PWA</button>}>
                                                    <PWAInstallButton />
                                                </Suspense>
                                                <button onClick={() => { logout(); closeMenus(); }} className="logout-item"><FontAwesomeIcon icon={faSignOutAlt} /> {t('logout')}</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Переключатель языков */}
                            <div className="lang-selector">
                                {['et', 'en', 'ru'].map(lng => (
                                    <button key={lng} onClick={() => changeLanguage(lng)} className={i18n.language === lng ? 'active' : ''}>
                                        {lng.toUpperCase()}
                                    </button>
                                ))}
                            </div>

                            {/* Бургер */}
                            <button className={`hamburger ${showMobileMenu ? 'is-active' : ''}`} onClick={() => setShowMobileMenu(!showMobileMenu)}>
                                <span></span><span></span><span></span>
                            </button>
                        </div>
                    </div>

                    {/* Мобильное меню */}
                    <div className={`mobile-nav ${showMobileMenu ? 'active' : ''}`}>
                        <CatalogLink closeMenus={closeMenus}>
                            {t('catalog')}
                        </CatalogLink>
                        <Link to="/partners" onClick={closeMenus}>{t('for_business')}</Link>
                        <Link to="/blog" onClick={closeMenus}>{t('blog')}</Link>
                        <Link to="/add-business" onClick={closeMenus}>{t('add_business')}</Link>
                        {!isAuthenticated && <Link to="/auth" onClick={closeMenus}>{t('login')}</Link>}
                        
                        {/* Переключатель языков в мобильном меню */}
                        <div className="mobile-lang-selector">
                            <div className="lang-label">{t('language') || 'Язык'}:</div>
                            <div className="lang-buttons">
                                {['et', 'en', 'ru'].map(lng => (
                                    <button 
                                        key={lng} 
                                        onClick={() => { changeLanguage(lng); closeMenus(); }} 
                                        className={i18n.language === lng ? 'active' : ''}
                                    >
                                        {lng === 'et' ? '🇪🇪 Eesti' : lng === 'en' ? '🇬🇧 English' : '🇷🇺 Русский'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="app-content-root">
                    <AppRoutes />
                </main>
                
                <Suspense fallback={<div style={{ minHeight: '200px' }} />}>
                    <Footer />
                </Suspense>
                <Suspense fallback={null}>
                    <PWAInstall />
                </Suspense>
            </div>
        </BrowserRouter>
    );
}

// Компонент для ссылки на каталог с сбросом фильтров
const CatalogLink = ({ children, closeMenus, className = '' }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const handleClick = (e) => {
        e.preventDefault();
        
        // Если мы уже на странице каталога, сбрасываем все параметры
        if (location.pathname === '/catalog') {
            navigate('/catalog', { replace: true });
        } else {
            navigate('/catalog');
        }
        
        if (closeMenus) {
            closeMenus();
        }
    };
    
    return (
        <a href="/catalog" onClick={handleClick} className={className}>
            {children}
        </a>
    );
};

function App() {
    return (
        <AuthProvider>
            <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
                <PWAProvider>
                    <AppContent />
                </PWAProvider>
            </Suspense>
        </AuthProvider>
    );
}

export default App;