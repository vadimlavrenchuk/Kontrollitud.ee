// Kontrollitud.ee/frontend/src/CompanyList.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import CompanyCard from './CompanyCard';
import CompanyMap from './CompanyMap';
import CategoryGrid from './components/CategoryGrid';
import SearchBar from './components/SearchBar';
import { CATEGORIES, getMainCategories, getSubcategories, getCategoryIcon } from './constants/categories';
import './styles/CompanyList.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSpa, faUtensils, faShoppingBag, faChild, faPlane, faCar, faCogs, faMap, faList, faSearchLocation, faComments, faShieldAlt, faInbox } from '@fortawesome/free-solid-svg-icons';

const API_BASE_URL = 'http://localhost:5000/api/companies';

function CompanyList() {
  const [allCompanies, setAllCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation(); 

  // Состояния для хранения фильтров и поиска
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [selectedMainCategory, setSelectedMainCategory] = useState('Все');
  const [selectedSubCategory, setSelectedSubCategory] = useState('Все');
  const [selectedCity, setSelectedCity] = useState('Все');
  const [isVerifiedOnly, setIsVerifiedOnly] = useState(false);
  const [showMap, setShowMap] = useState(true); // Toggle for mobile view
  const [selectedCompanyId, setSelectedCompanyId] = useState(null); // For map sync
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Функция для получения ВСЕХ данных один раз
  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // Load ALL approved companies (no search/filter params - we'll filter client-side)
    const url = `${API_BASE_URL}`;

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
        
        setAllCompanies(sortedData); // Store all companies

    } catch (err) {
        setError(err.message);
        setAllCompanies([]); // Очищаем список при ошибке
    } finally {
        setLoading(false);
        setIsInitialLoad(false);
    }
  }, [t]); // Remove all filter dependencies - we only fetch once

  // Запускаем запрос при первом рендере и при изменении любого фильтра
  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]); 

  // Client-side filtering with useMemo for performance
  const filteredCompanies = useMemo(() => {
    let result = [...allCompanies];

    // Search filter - search in name AND all description languages (et, en, ru)
    if (searchQuery && searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase().trim();
      result = result.filter(company => {
        const nameMatch = company.name?.toLowerCase().includes(searchLower);
        const descEtMatch = company.description?.et?.toLowerCase().includes(searchLower);
        const descEnMatch = company.description?.en?.toLowerCase().includes(searchLower);
        const descRuMatch = company.description?.ru?.toLowerCase().includes(searchLower);
        return nameMatch || descEtMatch || descEnMatch || descRuMatch;
      });
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'Все') {
      result = result.filter(company => company.category === selectedCategory);
    }

    // Main category filter
    if (selectedMainCategory && selectedMainCategory !== 'Все') {
      result = result.filter(company => company.mainCategory === selectedMainCategory);
    }

    // Subcategory filter
    if (selectedSubCategory && selectedSubCategory !== 'Все') {
      result = result.filter(company => company.subCategory === selectedSubCategory);
    }

    // City filter
    if (selectedCity && selectedCity !== 'Все') {
      result = result.filter(company => company.city === selectedCity);
    }

    // Verified filter
    if (isVerifiedOnly) {
      result = result.filter(company => company.isVerified === true);
    }

    return result;
  }, [allCompanies, searchQuery, selectedCategory, selectedMainCategory, selectedSubCategory, selectedCity, isVerifiedOnly]);

  // Use filteredCompanies as the displayed companies
  const companies = filteredCompanies;

  // Обработчик сброса фильтров
  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('Все');
    setSelectedMainCategory('Все');
    setSelectedSubCategory('Все');
    setSelectedCity('Все');
    setIsVerifiedOnly(false);
    setViewMode('grid');
  }, []);

  // Handle category grid selection
  const handleCategoryGridSelect = useCallback((mainCategory) => {
    setSelectedMainCategory(mainCategory);
    setSelectedSubCategory('Все');
    setViewMode('list'); // Switch to list view after selecting category
  }, []);

  // Handle subcategory change
  const handleSubCategoryChange = useCallback((subCategory) => {
    setSelectedSubCategory(subCategory);
  }, []);

  // Handle category quick filter
  const handleCategoryClick = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  // Memoized search handler
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchQuery(value);
    // Auto-switch to list view when user starts typing
    if (value && value.trim()) {
      setViewMode('list');
      // Scroll to top to show results
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Memoized clear search handler
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setViewMode('grid'); // Return to grid view
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
  }, []);

  // Memoize categories and cities to prevent unnecessary re-renders
  const categories = useMemo(() => ['Все', 'SPA', 'Restaurants', 'Shops', 'Kids', 'Travel', 'Auto', 'Services'], []);
  const cities = useMemo(() => ['Все', 'Tallinn', 'Tartu', 'Pärnu', 'Narva'], []);

  // Category icons mapping (memoized)
  const categoryIcons = useMemo(() => ({
    'SPA': faSpa,
    'Restaurants': faUtensils,
    'Shops': faShoppingBag,
    'Kids': faChild,
    'Travel': faPlane,
    'Auto': faCar,
    'Services': faCogs
  }), []);

  // Only show loading spinner on initial load, not on subsequent searches
  if (isInitialLoad && loading) {
    return <div className="container">{t('loading')}</div>;
  }

  if (error) {
    return <div className="container error-message">{t('error')} {error}</div>;
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{selectedMainCategory !== 'Все' 
          ? `${t(selectedMainCategory)} - ${t('business_directory')} | Kontrollitud.ee`
          : `${t('hero_title')} | Kontrollitud.ee`}
        </title>
        <meta name="description" content={
          selectedMainCategory !== 'Все'
            ? `${t('find_businesses_in')} ${t(selectedMainCategory)} ${t('category')}. ${companies.length} ${t('verified_businesses_found')}.`
            : t('hero_subtitle')
        } />
        <meta name="keywords" content={`${selectedMainCategory !== 'Все' ? t(selectedMainCategory) + ', ' : ''}Estonia, Eesti, business directory, kontrollitud, verified businesses, ${selectedCity !== 'Все' ? selectedCity : 'Tallinn, Tartu, Pärnu'}`} />
        <link rel="canonical" href={`https://kontrollitud.ee/${selectedMainCategory !== 'Все' ? '?category=' + selectedMainCategory : ''}`} />
      </Helmet>
      
      {viewMode === 'grid' ? (
        /* Show Category Grid View */
        <>
          {/* Hero Section */}
          <div className="hero-section">
            <div className="hero-content">
              <h1 className="hero-title fade-in">{t('hero_title')}</h1>
              <p className="hero-subtitle fade-in-delay">{t('hero_subtitle')}</p>
              
              {/* Search Bar - Memoized Component */}
              <SearchBar 
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                onClearSearch={handleClearSearch}
              />
              
              {/* Subtle loading indicator that doesn't cause unmount */}
              {!isInitialLoad && loading && (
                <div className="search-loading-indicator fade-in">
                  <div className="loading-spinner"></div>
                  <span>{t('searching')}...</span>
                </div>
              )}
            </div>
          </div>

          {/* Category Grid - hide when searching */}
          {!searchQuery && (
            <>
              <CategoryGrid onCategorySelect={handleCategoryGridSelect} />

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
            </>
          )}
        </>
      ) : (
        /* Show List View with Filters */
        <>
          {/* Hero Section */}
          <div className="hero-section">
            <div className="hero-content">
              <h1 className="hero-title fade-in">{t('hero_title')}</h1>
              <p className="hero-subtitle fade-in-delay">{t('hero_subtitle')}</p>

              {/* Search Bar - Memoized Component */}
              <SearchBar 
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                onClearSearch={handleClearSearch}
              />

              {/* Back to categories button */}
              {selectedMainCategory !== 'Все' && !searchQuery && (
                <button 
                  onClick={() => setViewMode('grid')} 
                  className="back-to-categories-button fade-in-delay-2"
                >
                  <i className="fas fa-arrow-left"></i>
                  {t('back_to_categories')}
                </button>
              )}

              {/* Quick Category Pills - hide when searching */}
              {!searchQuery && (
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
              )}
            </div>
          </div>

          {/* How It Works Section - hide when searching */}
          {!searchQuery && (
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
          )}
        </>
      )}

      {/* Main Content - only show when in list view */}
      {viewMode === 'list' && (
      <div className="container">
        {/* Unified Search & Filters Bar - hide when actively searching */}
        {!searchQuery && (
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

          {/* Main Category Filter */}
          {selectedMainCategory !== 'Все' && (
            <>
              <div className="selected-main-category">
                {getCategoryIcon(selectedMainCategory)} {t(selectedMainCategory)}
              </div>
              
              {/* Subcategory Filter */}
              <select 
                value={selectedSubCategory} 
                onChange={(e) => handleSubCategoryChange(e.target.value)} 
                className="filter-select"
              >
                <option value="Все">{t('all_subcategories')}</option>
                {getSubcategories(selectedMainCategory).map(subCat => (
                  <option key={subCat} value={subCat}>{t(subCat)}</option>
                ))}
              </select>
            </>
          )}

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
        )}
        
        {/* Search Results Indicator */}
        {searchQuery && (
          <div className="search-results-indicator">
            <FontAwesomeIcon icon={faSearch} />
            <span>
              {t('search_results_for')} <strong>"{searchQuery}"</strong>: {companies.length} {t('results_found')}
            </span>
            <button 
              onClick={() => setSearchQuery('')}
              className="clear-search-btn"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}
        
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
                  {searchQuery ? (
                    // Simple search-focused empty state
                    <>
                      <FontAwesomeIcon icon={faSearch} className="empty-icon" />
                      <h3>{t('no_search_results_title')}</h3>
                      <p>{t('no_search_results_description')}</p>
                      <button onClick={handleClearSearch} className="btn-clear-filters">
                        {t('clear_search')}
                      </button>
                    </>
                  ) : (
                    // General empty state with more options
                    <>
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
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      )}
    </>
  );
}

export default CompanyList;