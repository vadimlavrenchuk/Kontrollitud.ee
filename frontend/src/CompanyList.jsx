// Kontrollitud.ee/frontend/src/CompanyList.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import CompanyCard from './CompanyCard';
import CategoryGrid from './components/CategoryGrid';
import SearchBar from './components/SearchBar';
import './styles/CompanyList.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpa, faUtensils, faShoppingBag, faChild, faPlane, faCar, faCogs, faSearchLocation, faComments, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import tallinnBg from './assets/tallinn-bg.jpg.jpg';
import { db } from './firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { getMainCategories, getCategoryIcon } from './constants/categories';

function CompanyList() {
  const [allCompanies, setAllCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation(); 

  // Fetch companies from Firestore
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
    }
  }, [t]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]); 

  // Get first 4 companies for preview
  const previewCompanies = useMemo(() => allCompanies.slice(0, 4), [allCompanies]);

  // Get main categories from constants
  const mainCategories = useMemo(() => getMainCategories(), []);

  // Handle category click - navigate to catalog with main category filter
  const handleCategoryClick = useCallback((mainCategory) => {
    window.location.href = `/catalog?mainCategory=${mainCategory}`;
  }, []);

  if (loading) {
    return <div className="container">{t('loading')}</div>;
  }

  if (error) {
    return <div className="container error-message">{t('error')} {error}</div>;
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{t('hero_title')} | Kontrollitud.ee</title>
        <meta name="description" content={t('hero_subtitle')} />
        <meta name="keywords" content="Estonia, Eesti, business directory, kontrollitud, verified businesses, Tallinn, Tartu, Pärnu" />
        <link rel="canonical" href="https://kontrollitud.ee/" />
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
          <h1 className="hero__title">{t('hero_title')}</h1>
          <p className="hero__subtitle">{t('hero_subtitle')}</p>
          
          {/* Search Bar - links to catalog */}
          <div className="hero__search-wrapper">
            <Link to="/catalog" style={{ width: '100%', display: 'block' }}>
              <SearchBar 
                searchQuery=""
                onSearchChange={() => {}}
                onClearSearch={() => {}}
              />
            </Link>
          </div>
          
          {/* Main Category Pills */}
          <div className="category-pills fade-in-delay-3">
            <p className="pills-label">{t('popular_categories')}</p>
            <div className="pills-container">
              {mainCategories.map(category => (
                <button
                  key={category}
                  className="category-pill"
                  onClick={() => handleCategoryClick(category)}
                >
                  <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>
                    {getCategoryIcon(category)}
                  </span>
                  <span>{t(category) || category}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

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

      {/* Featured Companies Preview */}
      <div className="container">
        <div className="featured-section">
          <div className="section-header">
            <h2>{t('featured_businesses')}</h2>
            <Link to="/catalog" className="view-all-button">
              {t('view_all')} →
            </Link>
          </div>
          
          <div className="company-preview-grid">
            {previewCompanies.map(company => (
              <CompanyCard 
                key={company._id} 
                company={company}
              />
            ))}
          </div>
          
          <div className="view-all-footer">
            <Link to="/catalog" className="view-all-button-large">
              {t('view_all_businesses')}
            </Link>
          </div>
        </div>

        {/* Latest News Section */}
        <div className="latest-news-section">
          <div className="section-header">
            <h2>{t('latest_news')}</h2>
            <Link to="/blog" className="view-all-button">
              {t('read_more')} →
            </Link>
          </div>
          
          <div className="news-preview-grid">
            <div className="news-card">
              <div className="news-image">
                <img src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&q=80" alt="News 1" />
              </div>
              <div className="news-content">
                <span className="news-date">15.01.2025</span>
                <h3>{t('blog_post1_title')}</h3>
                <p>{t('blog_post1_excerpt')}</p>
                <Link to="/blog" className="news-link">{t('read_more')} →</Link>
              </div>
            </div>
            
            <div className="news-card">
              <div className="news-image">
                <img src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&q=80" alt="News 2" />
              </div>
              <div className="news-content">
                <span className="news-date">10.01.2025</span>
                <h3>{t('blog_post2_title')}</h3>
                <p>{t('blog_post2_excerpt')}</p>
                <Link to="/blog" className="news-link">{t('read_more')} →</Link>
              </div>
            </div>
            
            <div className="news-card">
              <div className="news-image">
                <img src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&q=80" alt="News 3" />
              </div>
              <div className="news-content">
                <span className="news-date">05.01.2025</span>
                <h3>{t('blog_post3_title')}</h3>
                <p>{t('blog_post3_excerpt')}</p>
                <Link to="/blog" className="news-link">{t('read_more')} →</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CompanyList;