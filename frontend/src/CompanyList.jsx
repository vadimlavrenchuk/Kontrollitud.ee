// Kontrollitud.ee/frontend/src/CompanyList.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CompanyCard from './CompanyCard';
import './styles/CompanyList.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSpa, faUtensils, faShoppingBag, faChild, faPlane, faCar, faCogs } from '@fortawesome/free-solid-svg-icons';

const API_BASE_URL = 'http://localhost:5000/api/companies';

function CompanyList() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation(); 

  // Состояния для хранения фильтров и поиска
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [selectedCity, setSelectedCity] = useState('Все');
  const [isVerifiedOnly, setIsVerifiedOnly] = useState(false);

  // Debounce search input (500ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Функция для получения данных с учетом текущих фильтров
  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // 1. Строим объект параметров запроса
    const params = new URLSearchParams();
    
    if (debouncedSearch) {
      params.append('search', debouncedSearch);
    }
    
    if (selectedCategory !== 'Все') {
      params.append('category', selectedCategory);
    }
    
    if (selectedCity !== 'Все') {
      params.append('city', selectedCity);
    }
    
    if (isVerifiedOnly) {
      params.append('isVerified', 'true');
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
  }, [debouncedSearch, selectedCategory, selectedCity, isVerifiedOnly, t]);

  // Запускаем запрос при первом рендере и при изменении любого фильтра
  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]); 

  const categories = ['Все', 'SPA', 'Restaurants', 'Shops', 'Kids', 'Travel', 'Auto', 'Services'];
  const cities = ['Все', 'Tallinn', 'Tartu', 'Pärnu', 'Narva'];

  // Category icons mapping
  const categoryIcons = {
    'SPA': faSpa,
    'Restaurants': faUtensils,
    'Shops': faShoppingBag,
    'Kids': faChild,
    'Travel': faPlane,
    'Auto': faCar,
    'Services': faCogs
  };

  // Обработчик сброса фильтров
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Все');
    setSelectedCity('Все');
    setIsVerifiedOnly(false);
  };

  // Handle category quick filter
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  if (loading) {
    return <div className="container">{t('loading')}</div>;
  }

  if (error) {
    return <div className="container error-message">{t('error')} {error}</div>;
  }

  return (
    <>
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title fade-in">{t('hero_title')}</h1>
          <p className="hero-subtitle fade-in-delay">{t('hero_subtitle')}</p>
          
          {/* Large Search Bar */}
          <div className="hero-search fade-in-delay-2">
            <div className="search-wrapper">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                placeholder={t('search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="hero-search-input"
              />
              <button className="search-button">
                <FontAwesomeIcon icon={faSearch} />
                {t('search_button')}
              </button>
            </div>
          </div>

          {/* Quick Category Pills */}
          <div className="category-pills fade-in-delay-3">
            <p className="pills-label">{t('popular_categories')}</p>
            <div className="pills-container">
              {categories.filter(cat => cat !== 'Все').map(category => (
                <button
                  key={category}
                  className={`category-pill ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(category)}
                >
                  <FontAwesomeIcon icon={categoryIcons[category]} />
                  <span>{t(category)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container">
        {/* Secondary Filters */}
        <div className="controls-bar">
          <Link to="/add" className="add-button">
            {t('add_company')}
          </Link>

          <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="filter-select">
            {cities.map(city => (
              <option key={city} value={city}>{t(city)}</option>
            ))}
          </select>

          <label className="verified-filter">
            <input
              type="checkbox"
              checked={isVerifiedOnly}
              onChange={(e) => setIsVerifiedOnly(e.target.checked)}
            />
            <span>{t('verified_only')}</span>
          </label>

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
            <p className="no-results">{t('no_companies_found')}</p>
          )}
        </div>
      </div>
    </>
  );
}

export default CompanyList;