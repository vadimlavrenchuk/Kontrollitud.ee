// Kontrollitud.ee/frontend/src/CompanyList.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CompanyCard from './CompanyCard';
import CompanyMap from './CompanyMap';
import './styles/CompanyList.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSpa, faUtensils, faShoppingBag, faChild, faPlane, faCar, faCogs, faMap, faList, faSearchLocation, faComments, faShieldAlt, faInbox } from '@fortawesome/free-solid-svg-icons';

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
  const [showMap, setShowMap] = useState(true); // Toggle for mobile view
  const [selectedCompanyId, setSelectedCompanyId] = useState(null); // For map sync

  // Debounce search input (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

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
        
        // Sort companies: verified first, then by priority (desc), then by newest
        const sortedData = data.sort((a, b) => {
          // First: sort by isVerified (true first)
          if (a.isVerified !== b.isVerified) {
            return b.isVerified ? 1 : -1;
          }
          
          // Second: sort by priority (descending)
          const priorityA = a.priority || 0;
          const priorityB = b.priority || 0;
          if (priorityA !== priorityB) {
            return priorityB - priorityA;
          }
          
          // Third: sort by createdAt (newest first)
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA;
        });
        
        setCompanies(sortedData);

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

      {/* How It Works Section */}
      <div className="how-it-works-section">
        <div className="container">
          <h2 className="how-it-works-title">{t('how_it_works_title')}</h2>
          <div className="how-it-works-grid">
            <div className="how-it-works-card">
              <div className="how-it-works-icon">
                <FontAwesomeIcon icon={faSearchLocation} />
              </div>
              <h3>{t('how_it_works_step1_title')}</h3>
              <p>{t('how_it_works_step1_desc')}</p>
            </div>
            <div className="how-it-works-card">
              <div className="how-it-works-icon">
                <FontAwesomeIcon icon={faComments} />
              </div>
              <h3>{t('how_it_works_step2_title')}</h3>
              <p>{t('how_it_works_step2_desc')}</p>
            </div>
            <div className="how-it-works-card">
              <div className="how-it-works-icon">
                <FontAwesomeIcon icon={faShieldAlt} />
              </div>
              <h3>{t('how_it_works_step3_title')}</h3>
              <p>{t('how_it_works_step3_desc')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container">
        {/* Unified Search & Filters Bar */}
        <div className="controls-bar">
          <div className="search-input-wrapper">
            <FontAwesomeIcon icon={faSearch} className="search-input-icon" />
            <input
              type="text"
              placeholder={t('search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="filter-select">
            {categories.map(cat => (
              <option key={cat} value={cat}>{t(cat)}</option>
            ))}
          </select>

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

          {/* Mobile Map Toggle */}
          <button 
            onClick={() => setShowMap(!showMap)} 
            className="map-toggle-button mobile-only"
            title={showMap ? t('show_list') : t('show_map')}
          >
            <FontAwesomeIcon icon={showMap ? faList : faMap} />
            <span>{showMap ? t('show_list') : t('show_map')}</span>
          </button>
        </div>
        
        {/* Split View: Map + List */}
        <div className="content-with-map">
          {/* Map Panel */}
          <div className={`map-panel ${showMap ? 'visible' : ''}`}>
            <CompanyMap 
              companies={companies} 
              selectedCompanyId={selectedCompanyId}
              onMarkerClick={setSelectedCompanyId}
            />
          </div>

          {/* List Panel */}
          <div className={`list-panel ${!showMap ? 'visible' : ''}`}>
            <div className="company-list">
              {companies && companies.length > 0 ? (
                companies.map(company => (
                  <CompanyCard 
                    key={company._id} 
                    company={company}
                    isSelected={selectedCompanyId === company._id}
                    onClick={() => setSelectedCompanyId(company._id)}
                  />
                ))
              ) : (
                <div className="empty-state">
                  <FontAwesomeIcon icon={faInbox} className="empty-icon" />
                  <h3>{t('no_results_title')}</h3>
                  <p>{t('no_results_description')}</p>
                  <div className="empty-actions">
                    <button onClick={handleResetFilters} className="btn-clear-filters">
                      {t('clear_filters')}
                    </button>
                    <Link to="/add-business" className="btn-add-first">
                      {t('be_the_first') || 'Be the first to add a business!'}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CompanyList;