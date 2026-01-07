// Kontrollitud.ee/frontend/src/App.jsx

import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import './App.css';
import logo from './assets/logokontroll.jpg';

// 🟢 ОБЯЗАТЕЛЬНО ПРОВЕРЬ, ЧТО ЭТИ ИМПОРТЫ ЕСТЬ:
import CompanyList from './CompanyList.jsx'; 
import CompanyDetails from './CompanyDetails.jsx';
import AddBusiness from './AddBusiness.jsx'; // Business submission form (public)
import AdminDashboard from './AdminDashboard.jsx';
import UserDashboard from './UserDashboard.jsx';
import AuthPage from './AuthPage.jsx';
import Login from './Login.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import RequireAuth from './RequireAuth.jsx';
import { AuthProvider, useAuth } from './AuthContext.jsx';
import Footer from './Footer.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import PartnersPage from './pages/PartnersPage.jsx';
import BlogPage from './pages/BlogPage.jsx';
import BlogPostDetail from './pages/BlogPostDetail.jsx';
import AboutPage from './pages/AboutPage.jsx';
import PaymentSuccess from './pages/PaymentSuccess.jsx';
import PaymentCancelled from './pages/PaymentCancelled.jsx';
import PaymentPage from './pages/PaymentPage.jsx';
import PWAInstall from './components/PWAInstall.jsx';

function AppContent() {
    const { t, i18n } = useTranslation();
    const { user, logout, isAuthenticated } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    
    // Admin email - replace with your actual admin email
    const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@kontrollitud.ee';
    const isAdmin = user && user.email === ADMIN_EMAIL;
    
    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('language', lng);
    };

    useEffect(() => {
        document.documentElement.lang = i18n.language;
    }, [i18n.language]);

    // Scroll detection for navbar styling
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    
    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showMobileMenu && 
                !event.target.closest('.mobile-nav-menu') && 
                !event.target.closest('.hamburger-menu')) {
                setShowMobileMenu(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMobileMenu]);
    
    // Close mobile menu on route change and prevent body scroll when open
    useEffect(() => {
        if (showMobileMenu) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        
        return () => {
            document.body.style.overflow = '';
        };
    }, [showMobileMenu]);

    return (
        <BrowserRouter> 
            <div className="app-main">
                {/* Default SEO Meta Tags */}
                <Helmet>
                    <html lang={i18n.language} />
                    <title>Kontrollitud.ee - Verified Companies in Estonia</title>
                    <meta name="description" content="Discover and review verified companies in Estonia. Browse SPA centers, restaurants, shops, and more trusted businesses across Tallinn, Tartu, Pärnu, and Narva." />
                    <meta name="keywords" content="Estonia, verified companies, business directory, reviews, Tallinn, Tartu, Pärnu" />
                    <meta property="og:title" content="Kontrollitud.ee - Verified Companies in Estonia" />
                    <meta property="og:description" content="Discover and review verified companies in Estonia" />
                    <meta property="og:type" content="website" />
                </Helmet>
                
                <header className={`sticky-navbar ${isScrolled ? 'scrolled' : ''}`}>
                    <div className="navbar-container">
                        {/* Left: Logo/Brand */}
                        <div className="navbar-brand">
                            <Link to="/" className="logo-link">
                                <img src={logo} alt="Kontrollitud.ee Logo" className="logo-image" />
                                <h1 className="logo-text">{t('app_title')}</h1>
                            </Link>
                        </div>

                        {/* Right: User Menu + Language Switcher */}
                        <div className="navbar-right">
                            {/* Hamburger Menu Button (Mobile Only) */}
                            <button 
                                className={`hamburger-menu ${showMobileMenu ? 'open' : ''}`}
                                onClick={() => setShowMobileMenu(!showMobileMenu)}
                                aria-label="Toggle menu"
                            >
                                <span></span>
                                <span></span>
                                <span></span>
                            </button>
                            
                            {/* Desktop Navigation Links */}
                            {/* Catalog Link */}
                            <Link to="/catalog" className="catalog-link">
                                <i className="fas fa-list"></i>
                                <span>{t('catalog')}</span>
                            </Link>
                            
                            {/* Partners Link */}
                            <Link to="/partners" className="partners-link">
                                <i className="fas fa-handshake"></i>
                                <span>{t('for_business')}</span>
                            </Link>
                            
                            {/* Blog Link */}
                            <Link to="/blog" className="blog-link">
                                <i className="fas fa-newspaper"></i>
                                <span>{t('blog')}</span>
                            </Link>
                            
                            {/* Add Business Link */}
                            <Link to="/add-business" className="add-business-link">
                                <i className="fas fa-plus-circle"></i>
                                <span>{t('add_business')}</span>
                            </Link>

                            {/* User Authentication */}
                            {!isAuthenticated ? (
                                <Link to="/auth" className="login-link">
                                    <i className="fas fa-sign-in-alt"></i>
                                    <span>{t('login')}</span>
                                </Link>
                            ) : (
                                <div className="user-menu-container">
                                    <button 
                                        className="user-profile-button"
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                    >
                                        {user.photoURL ? (
                                            <img src={user.photoURL} alt={user.displayName} className="user-avatar" />
                                        ) : (
                                            <div className="user-avatar-placeholder">
                                                {(user.displayName || user.email)?.[0]?.toUpperCase()}
                                            </div>
                                        )}
                                        <span className="user-name">{user.displayName || user.email?.split('@')[0]}</span>
                                        <i className={`fas fa-chevron-down ${showUserMenu ? 'rotated' : ''}`}></i>
                                    </button>
                                    
                                    {showUserMenu && (
                                        <div className="user-dropdown">
                                            <div className="dropdown-header">
                                                <p className="user-email">{user.email}</p>
                                            </div>
                                            <div className="dropdown-divider"></div>
                                            {isAdmin && (
                                                <Link to="/admin" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                                                    <i className="fas fa-shield-alt"></i>
                                                    <span>Admin Dashboard</span>
                                                </Link>
                                            )}
                                            <Link to="/dashboard" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                                                <i className="fas fa-clipboard-list"></i>
                                                <span>{t('my_dashboard')}</span>
                                            </Link>
                                            <div className="dropdown-divider"></div>
                                            <button onClick={() => { logout(); setShowUserMenu(false); }} className="dropdown-item logout-item">
                                                <i className="fas fa-sign-out-alt"></i>
                                                <span>{t('logout')}</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Language Switcher */}
                            <div className="language-switcher">
                                <button 
                                    onClick={() => changeLanguage('et')} 
                                    className={`language-button ${i18n.language === 'et' ? 'active' : ''}`}
                                >
                                    ET
                                </button>
                                <button 
                                    onClick={() => changeLanguage('en')} 
                                    className={`language-button ${i18n.language === 'en' ? 'active' : ''}`}
                                >
                                    EN
                                </button>
                                <button 
                                    onClick={() => changeLanguage('ru')} 
                                    className={`language-button ${i18n.language === 'ru' ? 'active' : ''}`}
                                >
                                    RU
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Mobile Navigation Menu */}
                    <div className={`mobile-nav-menu ${showMobileMenu ? 'open' : ''}`}>
                        {/* Catalog Link */}
                        <Link to="/catalog" className="catalog-link" onClick={() => setShowMobileMenu(false)}>
                            <i className="fas fa-list"></i>
                            <span>{t('catalog')}</span>
                        </Link>
                        
                        {/* Partners Link */}
                        <Link to="/partners" className="partners-link" onClick={() => setShowMobileMenu(false)}>
                            <i className="fas fa-handshake"></i>
                            <span>{t('for_business')}</span>
                        </Link>
                        
                        {/* Blog Link */}
                        <Link to="/blog" className="blog-link" onClick={() => setShowMobileMenu(false)}>
                            <i className="fas fa-newspaper"></i>
                            <span>{t('blog')}</span>
                        </Link>
                        
                        {/* Add Business Link */}
                        <Link to="/add-business" className="add-business-link" onClick={() => setShowMobileMenu(false)}>
                            <i className="fas fa-plus-circle"></i>
                            <span>{t('add_business')}</span>
                        </Link>

                        {/* User Authentication */}
                        {!isAuthenticated ? (
                            <Link to="/auth" className="login-link" onClick={() => setShowMobileMenu(false)}>
                                <i className="fas fa-sign-in-alt"></i>
                                <span>{t('login')}</span>
                            </Link>
                        ) : (
                            <div className="user-menu-container">
                                <button 
                                    className="user-profile-button"
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                >
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt={user.displayName} className="user-avatar" />
                                    ) : (
                                        <div className="user-avatar-placeholder">
                                            {(user.displayName || user.email)?.[0]?.toUpperCase()}
                                        </div>
                                    )}
                                    <span className="user-name">{user.displayName || user.email?.split('@')[0]}</span>
                                    <i className={`fas fa-chevron-down ${showUserMenu ? 'rotated' : ''}`}></i>
                                </button>
                                
                                {showUserMenu && (
                                    <div className="user-dropdown">
                                        <div className="dropdown-header">
                                            <p className="user-email">{user.email}</p>
                                        </div>
                                        <div className="dropdown-divider"></div>
                                        {isAdmin && (
                                            <Link to="/admin" className="dropdown-item" onClick={() => { setShowUserMenu(false); setShowMobileMenu(false); }}>
                                                <i className="fas fa-shield-alt"></i>
                                                <span>Admin Dashboard</span>
                                            </Link>
                                        )}
                                        <Link to="/dashboard" className="dropdown-item" onClick={() => { setShowUserMenu(false); setShowMobileMenu(false); }}>
                                            <i className="fas fa-clipboard-list"></i>
                                            <span>{t('my_dashboard')}</span>
                                        </Link>
                                        <div className="dropdown-divider"></div>
                                        <button onClick={() => { logout(); setShowUserMenu(false); setShowMobileMenu(false); }} className="dropdown-item logout-item">
                                            <i className="fas fa-sign-out-alt"></i>
                                            <span>{t('logout')}</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Language Switcher */}
                        <div className="language-switcher">
                            <button 
                                onClick={() => { changeLanguage('et'); setShowMobileMenu(false); }} 
                                className={`language-button ${i18n.language === 'et' ? 'active' : ''}`}
                            >
                                ET
                            </button>
                            <button 
                                onClick={() => { changeLanguage('en'); setShowMobileMenu(false); }} 
                                className={`language-button ${i18n.language === 'en' ? 'active' : ''}`}
                            >
                                EN
                            </button>
                            <button 
                                onClick={() => { changeLanguage('ru'); setShowMobileMenu(false); }} 
                                className={`language-button ${i18n.language === 'ru' ? 'active' : ''}`}
                            >
                                RU
                            </button>
                        </div>
                    </div>
                </header>

                <Routes>
                    <Route path="/" element={<CompanyList />} />
                    <Route path="/catalog" element={<CatalogPage />} />
                    <Route path="/partners" element={<PartnersPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/blog/:id" element={<BlogPostDetail />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/login" element={<AuthPage />} />
                    <Route path="/payment-success" element={<PaymentSuccess />} />
                    <Route path="/payment-cancelled" element={<PaymentCancelled />} />
                    <Route path="/payment" element={
                        <RequireAuth>
                            <PaymentPage />
                        </RequireAuth>
                    } />
                    <Route path="/add" element={
                        <RequireAuth>
                            <AddBusiness />
                        </RequireAuth>
                    } />
                    <Route path="/add-business" element={
                        <RequireAuth>
                            <AddBusiness />
                        </RequireAuth>
                    } />
                    <Route path="/dashboard" element={
                        <RequireAuth>
                            <UserDashboard />
                        </RequireAuth>
                    } />
                    <Route path="/admin" element={
                        <ProtectedRoute>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />
                    {/* Company routes - support both slug and ID */}
                    <Route path="/companies/:slugOrId" element={<CompanyDetails />} />
                    <Route path="/company/:slugOrId" element={<CompanyDetails />} />
                    <Route path="*" element={
                        <div style={{ padding: '20px' }}>
                            <h2>404 - {t('page_not_found')}</h2>
                            <p>{t('return_home')}</p>
                        </div>
                    } />
                </Routes>
                
                <Footer />
                
                {/* PWA Install Prompt */}
                <PWAInstall />
            </div>
        </BrowserRouter>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;