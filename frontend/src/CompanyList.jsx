// Kontrollitud.ee/frontend/src/CompanyList.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './styles/CompanyList.scss';

const API_BASE_URL = 'http://localhost:5000/api/companies';

function CompanyList() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation(); 

  // Состояния для хранения фильтров и поиска
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Все');
  const [status, setStatus] = useState('Все');

  // Функция для получения данных с учетом текущих фильтров
  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // 1. Строим объект параметров запроса
    const params = new URLSearchParams();
    
    if (search) {
      params.append('search', search);
    }
    
    if (category !== 'Все') {
      params.append('category', category);
    }
    
    if (status !== 'Все') {
      // Отправляем статус напрямую: 'pending', 'verified', 'rejected'
      params.append('status', status);
    }

    // Собираем полный URL: http://localhost:5000/api/companies?search=...&category=...
    const url = `${API_BASE_URL}?${params.toString()}`;

    try {
      const response = await fetch(url);

        if (!response.ok) {
            let errorMessage = `${t('fetch_error')}: ${response.statusText}`;
            
            // 🟢 БЕЗОПАСНАЯ ПОПЫТКА ЧТЕНИЯ JSON
            try {
                const data = await response.json();
                // Используем сообщение из бэкенда, если оно есть
                errorMessage = data.error || errorMessage; 
            } catch (jsonError) {
                // Игнорируем ошибку парсинга, если ответ не был JSON
                console.warn("Ответ сервера не был JSON, используя статус-текст.");
            }
            
            throw new Error(errorMessage);
        }

        const data = await response.json();
        setCompanies(data);

    } catch (err) {
        setError(err.message);
        setCompanies([]); // Очищаем список при ошибке
    } finally {
        setLoading(false);
    }
  }, [search, category, status, t]);

  // Запускаем запрос при первом рендере и при изменении любого фильтра
  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]); 

  const categories = ['Все', 'Услуги', 'Магазин', 'Спа', 'Ресторан'];
  
  // 🟢 СТАТУСЫ ВЕРИФИКАЦИИ: значение -> ключ для перевода
  const statusOptions = [
    { value: 'Все', label: t('all') },
    { value: 'verified', label: t('status_verified') },
    { value: 'pending', label: t('status_pending') },
    { value: 'rejected', label: t('status_rejected') }
  ];

  // Обработчик сброса фильтров
  const handleResetFilters = () => {
    setSearch('');
    setCategory('Все');
    setStatus('Все');
  };

  if (loading) {
    return <div className="container">{t('loading')}</div>;
  }

  if (error) {
    return <div className="container error-message">{t('error')} {error}</div>;
  }
  
  // Отдельный компонент карточки
  const CompanyCard = ({ company }) => (
    <div className="company-card">
      <div className="card-header">
        <h3 className="company-name">{company.name}</h3>
        {/* Отображаем значок и текст статуса в зависимости от status */}
        {company.status === 'verified' ? (
          <span className="verified-badge" title={t('verified')}>🌟 {t('verified')}</span>
        ) : company.status === 'rejected' ? (
          <span className="rejected-badge" title={t('rejected')}>🚫 {t('rejected')}</span>
        ) : (
          <span className="pending-badge" title={t('pending')}>⏳ {t('pending')}</span>
        )}
      </div>
      <p className="company-category-tag">{company.category}</p>
      <p className="company-description">{company.description}</p>
      <Link to={`/companies/${company._id}`} className="details-button">
        {t('details_button')}
      </Link>
    </div>
  );

  return (
    <div className="container">
      <h2>{t('company_catalog_title')}...</h2>

      {/* Панель управления (Поиск и Фильтры) */}
      <div className="controls-bar">
        
        <Link to="/add" className="add-button">
          {t('add_company')}
        </Link>
        
        <input
          type="text"
          placeholder={t('search_placeholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)} className="filter-select">
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        
        <select 
          value={status} 
          onChange={(e) => setStatus(e.target.value)} 
          className="filter-select"
          title={t('status_filter_label')}
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

        <button onClick={handleResetFilters} className="reset-button" title={t('reset_filters_tooltip')}>
          {t('reset_button')}
        </button>

      </div>
      
      {/* Список компаний */}
      <div className="company-list">
        {companies && companies.length > 0 ? (
          companies.map(company => (
            <CompanyCard key={company._id} company={company} />
          ))
        ) : (
          <p className="no-results">По вашему запросу компаний не найдено.</p>
        )}
      </div>
    </div>
  );
}

export default CompanyList;