// Kontrollitud.ee/frontend/src/App.jsx

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

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

    // Update html lang attribute when language changes
    useEffect(() => {
        document.documentElement.lang = i18n.language;
    }, [i18n.language]);

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
                
                <header>
                    <h1>
                        <Link to="/" style={{ textDecoration: 'none', color: '#333' }}>
                            {t('app_title')} {/* 🟢 ИСПОЛЬЗОВАНИЕ ПЕРЕВОДА */}
                        </Link>
                    </h1>
                    <p>{t('slogan')}</p> {/* 🟢 ИСПОЛЬЗОВАНИЕ ПЕРЕВОДА */}

                    {/* Navigation Links */}
                    <nav style={{ marginTop: '15px' }}>
                        <Link to="/admin" style={{ 
                            marginRight: '15px', 
                            padding: '8px 16px', 
                            background: '#667eea',
                            color: 'white',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            fontSize: '0.9em'
                        }}>
                            🔐 Admin Dashboard
                        </Link>
                    </nav>

                    {/* 🟢 ПЕРЕКЛЮЧАТЕЛЬ ЯЗЫКА */}
                    <div style={{ position: 'absolute', top: 10, right: 10 }}>
                        <button onClick={() => changeLanguage('et')} style={{ fontWeight: i18n.language === 'et' ? 'bold' : 'normal' }}>ET</button>
                        <button onClick={() => changeLanguage('en')} style={{ fontWeight: i18n.language === 'en' ? 'bold' : 'normal' }}>EN</button>
                        <button onClick={() => changeLanguage('ru')} style={{ fontWeight: i18n.language === 'ru' ? 'bold' : 'normal' }}>RU</button>
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