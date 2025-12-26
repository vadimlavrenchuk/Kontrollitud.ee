// Kontrollitud.ee/frontend/src/App.jsx

import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import './App.css';

// 🟢 ОБЯЗАТЕЛЬНО ПРОВЕРЬ, ЧТО ЭТИ ИМПОРТЫ ЕСТЬ:
import CompanyList from './CompanyList.jsx'; 
import CompanyDetails from './CompanyDetails.jsx';
import CompanyForm from './CompanyForm.jsx'; // 👈 Должен быть здесь!
import AdminDashboard from './AdminDashboard.jsx';
import Login from './Login.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

function App() {
    // 🟢 ИСПОЛЬЗУЕМ: t (для перевода) и i18n (для смены языка)
    const { t, i18n } = useTranslation(); 
    
    // Функция для смены языка
    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        // Save language preference to localStorage for persistence
        localStorage.setItem('language', lng);
    };

    // Track scroll position for navbar styling
    const [isScrolled, setIsScrolled] = useState(false);
    
    // Track authentication state
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Update html lang attribute when language changes
    useEffect(() => {
        document.documentElement.lang = i18n.language;
    }, [i18n.language]);
    
    // Check authentication status
    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('adminToken');
            setIsLoggedIn(!!token);
        };
        
        // Check on mount
        checkAuth();
        
        // Listen for storage changes (e.g., login/logout in another tab)
        window.addEventListener('storage', checkAuth);
        
        // Custom event for same-tab login/logout
        window.addEventListener('authChange', checkAuth);
        
        return () => {
            window.removeEventListener('storage', checkAuth);
            window.removeEventListener('authChange', checkAuth);
        };
    }, []);

    // Scroll detection for navbar styling
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
                                <h1 className="logo-text">{t('app_title')}</h1>
                            </Link>
                        </div>

                        {/* Right: Admin Link + Language Switcher */}
                        <div className="navbar-right">
                            {/* Only show Admin button if logged in */}
                            {isLoggedIn && (
                                <Link to="/admin" className="admin-link">
                                    <span className="admin-icon">🔐</span>
                                    <span className="admin-text">Admin Dashboard</span>
                                </Link>
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
                </header>

                <Routes>
                    <Route path="/" element={<CompanyList />} />
                    <Route path="/add" element={<CompanyForm />} /> 
                    <Route path="/login" element={<Login />} />
                    <Route path="/admin" element={
                        <ProtectedRoute>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/companies/:id" element={<CompanyDetails />} />
                    <Route path="/company/:id" element={<CompanyDetails />} />
                    <Route path="*" element={
                        <div style={{ padding: '20px' }}>
                            <h2>404 - {t('page_not_found')}</h2>
                            <p>{t('return_home')}</p>
                        </div>
                    } />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;