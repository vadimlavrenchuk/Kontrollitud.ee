// Kontrollitud.ee/frontend/src/pages/CatalogPage.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import CompanyCard from '../CompanyCard';
import CompanyMap from '../CompanyMap';
import SearchBar from '../components/SearchBar';
import { getMainCategories, getSubcategories, getCategoryIcon } from '../constants/categories';
import '../styles/CompanyList.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSpa, faUtensils, faShoppingBag, faChild, faPlane, faCar, faCogs, faMap, faList, faInbox } from '@fortawesome/free-solid-svg-icons';
import tallinnBg from '../assets/tallinn-bg.jpg.jpg';

const API_BASE_URL = 'http://localhost:5000/api/companies';

function CatalogPage() {
  const [allCompanies, setAllCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation(); 

  // State for filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [selectedMainCategory, setSelectedMainCategory] = useState('Все');
  const [selectedSubCategory, setSelectedSubCategory] = useState('Все');
  const [selectedCity, setSelectedCity] = useState('Все');
  const [isVerifiedOnly, setIsVerifiedOnly] = useState(false);
  const [showMap, setShowMap] = useState(true); // Toggle for mobile view
  const [selectedCompanyId, setSelectedCompanyId] = useState(null); // For map sync

  // Fetch all approved companies
  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const url = `${API_BASE_URL}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        let errorMessage = `${t('fetch_error')}: ${response.statusText}`;
        
        try {
          const data = await response.json();
          errorMessage = data.error || errorMessage; 
        } catch (jsonError) {
          console.warn("Response was not JSON, using status text.");
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Sort companies: verified first, then by priority (desc), then by newest
      const sortedData = data.sort((a, b) => {
        if (a.isVerified !== b.isVerified) {
          return b.isVerified ? 1 : -1;
        }
        
        const priorityA = a.priority || 0;
        const priorityB = b.priority || 0;
        if (priorityA !== priorityB) {
          return priorityB - priorityA;
        }
        
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      
      setAllCompanies(sortedData);
    } catch (err) {
      setError(err.message);
      setAllCompanies([]);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [t]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]); 

  // Client-side filtering with useMemo for performance
  const filteredCompanies = useMemo(() => {
    let result = [...allCompanies];

    // Search filter
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

  const companies = filteredCompanies;

  // Reset filters handler
  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('Все');
    setSelectedMainCategory('Все');
    setSelectedSubCategory('Все');
    setSelectedCity('Все');
    setIsVerifiedOnly(false);
  }, []);

  // Handle subcategory change
  const handleSubCategoryChange = useCallback((subCategory) => {
    setSelectedSubCategory(subCategory);
  }, []);

  // Handle category quick filter
  const handleCategoryClick = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  // Search handler
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value && value.trim()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Clear search handler
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Memoize categories and cities
  const categories = useMemo(() => ['Все', 'SPA', 'Restaurants', 'Shops', 'Kids', 'Travel', 'Auto', 'Services'], []);
  const cities = useMemo(() => ['Все', 'Tallinn', 'Tartu', 'Pärnu', 'Narva'], []);

  // Category icons mapping
  const categoryIcons = useMemo(() => ({
    'SPA': faSpa,
    'Restaurants': faUtensils,
    'Shops': faShoppingBag,
    'Kids': faChild,
    'Travel': faPlane,
    'Auto': faCar,
    'Services': faCogs
  }), []);

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
        <title>{t('catalog')} | Kontrollitud.ee</title>
        <meta name="description" content={t('catalog_description')} />
        <meta name="keywords" content="Estonia, Eesti, business directory, kontrollitud, verified businesses, catalog" />
      </Helmet>
      
      {/* Hero Section */}
      <section className="hero">
        <img 
          src={tallinnBg}
          alt="Tallinn cityscape"
          className="hero__bg-image"
        />
        
        <div className="hero__overlay"></div>
        
        <div className="hero__content">
          <h1 className="hero__title">{t('catalog_title')}</h1>
          <p className="hero__subtitle">{t('catalog_subtitle')}</p>

          <div className="hero__search-wrapper">
            <SearchBar 
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              onClearSearch={handleClearSearch}
            />
          </div>

          {/* Quick Category Pills */}
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
          
          {!isInitialLoad && loading && (
            <div className="search-loading-indicator fade-in">
              <div className="loading-spinner"></div>
              <span>{t('searching')}...</span>
            </div>
          )}
        </div>
      </section>

      <div className="container">
        {/* Search & Filters Bar */}
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

            {selectedMainCategory !== 'Все' && (
              <>
                <div className="selected-main-category">
                  {getCategoryIcon(selectedMainCategory)} {t(selectedMainCategory)}
                </div>
                
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
          <div className={`map-panel ${showMap ? 'visible' : ''}`}>
            <CompanyMap 
              companies={companies} 
              selectedCompanyId={selectedCompanyId}
              onMarkerClick={setSelectedCompanyId}
            />
          </div>

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
                    <>
                      <FontAwesomeIcon icon={faSearch} className="empty-icon" />
                      <h3>{t('no_search_results_title')}</h3>
                      <p>{t('no_search_results_description')}</p>
                      <button onClick={handleClearSearch} className="btn-clear-filters">
                        {t('clear_search')}
                      </button>
                    </>
                  ) : (
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
    </>
  );
}

export default CatalogPage;
