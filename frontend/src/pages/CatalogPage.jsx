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
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useSearchParams } from 'react-router-dom';

function CatalogPage() {
  const [allCompanies, setAllCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  // State for filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [selectedMainCategory, setSelectedMainCategory] = useState(searchParams.get('mainCategory') || 'Все');
  const [selectedSubCategory, setSelectedSubCategory] = useState('Все');
  const [selectedCity, setSelectedCity] = useState('Все');
  const [isVerifiedOnly, setIsVerifiedOnly] = useState(false);
  const [showMap, setShowMap] = useState(false); // Toggle for mobile view (false = show list by default)
  const [selectedCompanyId, setSelectedCompanyId] = useState(null); // For map sync

  // Handle card click - automatically switch to map on mobile
  const handleCompanyCardClick = useCallback((companyId) => {
    setSelectedCompanyId(companyId);
    
    // Auto-switch to map view on mobile
    if (window.innerWidth <= 1024) {
      setShowMap(true);
    }
  }, []);

  // Handle window resize to show both panels on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setShowMap(true); // Always show map on desktop
      }
    };
    
    handleResize(); // Check on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch all approved companies from Firestore
  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const companiesRef = collection(db, 'companies');
      const q = query(companiesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const companiesList = [];
      snapshot.forEach((doc) => {
        companiesList.push({
          id: doc.id,
          _id: doc.id, // Для обратной совместимости
          ...doc.data()
        });
      });
      
      // Sort companies: verified first, then by priority (desc), then by newest
      const sortedData = companiesList.sort((a, b) => {
        const isVerifiedA = a.verified || a.isVerified;
        const isVerifiedB = b.verified || b.isVerified;
        
        if (isVerifiedA !== isVerifiedB) {
          return isVerifiedB ? 1 : -1;
        }
        
        const priorityA = a.priority || 0;
        const priorityB = b.priority || 0;
        if (priorityA !== priorityB) {
          return priorityB - priorityA;
        }
        
        // Handle Firestore Timestamp
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      
      setAllCompanies(sortedData);
    } catch (err) {
      console.error('❌ Error fetching companies:', err);
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

    // Category filter (старый формат)
    if (selectedCategory && selectedCategory !== 'Все') {
      result = result.filter(company => {
        const match = company.category === selectedCategory || company.subCategory === selectedCategory;
        return match;
      });
    }

    // Main category filter
    if (selectedMainCategory && selectedMainCategory !== 'Все') {
      result = result.filter(company => company.mainCategory === selectedMainCategory);
    }

    // Subcategory filter
    if (selectedSubCategory && selectedSubCategory !== 'Все') {
      result = result.filter(company => {
        const match = company.subCategory === selectedSubCategory || company.category === selectedSubCategory;
        return match;
      });
    }

    // City filter
    if (selectedCity && selectedCity !== 'Все') {
      result = result.filter(company => company.city === selectedCity);
    }

    // Verified filter - поддержка обоих полей
    if (isVerifiedOnly) {
      result = result.filter(company => company.verified === true || company.isVerified === true);
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

  // Memoize categories and cities from constants
  const mainCategories = useMemo(() => ['Все', ...getMainCategories()], []);
  
  const cities = useMemo(() => ['Все', 'Tallinn', 'Tartu', 'Pärnu', 'Narva'], []);
  
  // Get subcategories based on selected main category
  const availableSubcategories = useMemo(() => {
    if (!selectedMainCategory || selectedMainCategory === 'Все') {
      return ['Все'];
    }
    return ['Все', ...getSubcategories(selectedMainCategory)];
  }, [selectedMainCategory]);

  // Category icons are now handled by getCategoryIcon from constants

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

          {/* Main Category Pills */}
          {!searchQuery && (
            <div className="category-pills fade-in-delay-3">
              <p className="pills-label">{t('popular_categories')}</p>
              <div className="pills-container">
                {mainCategories.filter(cat => cat !== 'Все').map(category => (
                  <button
                    key={category}
                    className={`category-pill ${selectedMainCategory === category ? 'active' : ''}`}
                    onClick={() => setSelectedMainCategory(category)}
                  >
                    {getCategoryIcon(category)}
                    <span>{t(category) || category}</span>
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
            {selectedMainCategory !== 'Все' && (
              <div className="selected-main-category">
                {getCategoryIcon(selectedMainCategory)} {t(selectedMainCategory)}
              </div>
            )}

            {selectedMainCategory !== 'Все' && (
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
        
        {/* Split View: List (40%) + Map (60%) */}
        <div className="content-with-map">
          <div className={`list-panel ${!showMap ? 'visible' : ''}`}>
            <div className="company-list">
              {companies && companies.length > 0 ? (
                companies.map(company => (
                  <CompanyCard 
                    key={company._id} 
                    company={company}
                    isSelected={selectedCompanyId === company._id}
                    onClick={() => handleCompanyCardClick(company._id)}
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
          
          <div className={`map-panel ${showMap ? 'visible' : ''}`}>
            <CompanyMap 
              companies={companies} 
              selectedCompanyId={selectedCompanyId}
              onMarkerClick={setSelectedCompanyId}
            />
          </div>
        </div>
        
        {/* Floating Toggle Button for Mobile */}
        <button 
          onClick={() => setShowMap(!showMap)} 
          className="map-toggle-button mobile-only"
          title={showMap ? t('show_list') : t('show_map')}
        >
          <FontAwesomeIcon icon={showMap ? faList : faMap} />
          <span>{showMap ? t('show_list') : t('show_map')}</span>
        </button>
      </div>
    </>
  );
}

export default CatalogPage;
