// Kontrollitud.ee/frontend/src/App.jsx

import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// 🟢 ОБЯЗАТЕЛЬНО ПРОВЕРЬ, ЧТО ЭТИ ИМПОРТЫ ЕСТЬ:
import CompanyList from './CompanyList.jsx'; 
import CompanyDetails from './CompanyDetails.jsx';
import CompanyForm from './CompanyForm.jsx'; // 👈 Должен быть здесь!

function App() {
    // 🟢 ИСПОЛЬЗУЕМ: t (для перевода) и i18n (для смены языка)
    const { t, i18n } = useTranslation(); 
    
    // Функция для смены языка
    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <BrowserRouter> 
            <div className="app-main">
                
                <header>
                    <h1>
                        <Link to="/" style={{ textDecoration: 'none', color: '#333' }}>
                            {t('app_title')} {/* 🟢 ИСПОЛЬЗОВАНИЕ ПЕРЕВОДА */}
                        </Link>
                    </h1>
                    <p>{t('slogan')}</p> {/* 🟢 ИСПОЛЬЗОВАНИЕ ПЕРЕВОДА */}

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
                    <Route path="/companies/:id" element={<CompanyDetails />} /> 
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