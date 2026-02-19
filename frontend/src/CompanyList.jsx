import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import CompanyCard from './CompanyCard';
import TypewriterSearchBar from './components/TypewriterSearchBar';
import QuickAccessCategories from './components/QuickAccessCategories';
import EventsSidebar from './components/EventsSidebar';
import HeroImage from './components/HeroImage';
import './styles/CompanyList.scss';
import tallinnBg from './assets/tallinn-bg.webp';
import tallinnBgWebp from './assets/tallinn-bg.webp?format=webp';
import { db } from './firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { getMainCategories, getCategoryIcon } from './constants/categories';

function CompanyList() {
  const [allCompanies, setAllCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // State для поиска
  const { t } = useTranslation();
  const navigate = useNavigate(); // Хук для навигации без перезагрузки

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!db) throw new Error('Firebase is not initialized');
      
      const companiesRef = collection(db, 'companies');
      // Ограничиваем выборку для главной страницы, чтобы не грузить лишнее
      const q = query(companiesRef, orderBy('createdAt', 'desc'), limit(20));
      const snapshot = await getDocs(q);
      
      const companiesList = snapshot.docs.map(doc => ({
        id: doc.id,
        _id: doc.id,
        ...doc.data()
      }));
      
      // Улучшенная сортировка
      const sortedData = companiesList.sort((a, b) => {
        const isVerifiedA = a.isVerified || a.verified || false;
        const isVerifiedB = b.isVerified || b.verified || false;
        
        if (isVerifiedA !== isVerifiedB) return isVerifiedB ? 1 : -1;
        
        const priorityA = a.priority || 0;
        const priorityB = b.priority || 0;
        if (priorityA !== priorityB) return priorityB - priorityA;
        
        const dateA = a.createdAt?.seconds ? a.createdAt.toMillis() : 0;
        const dateB = b.createdAt?.seconds ? b.createdAt.toMillis() : 0;
        return dateB - dateA;
      });
      
      setAllCompanies(sortedData);
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]); 

  const previewCompanies = useMemo(() => allCompanies.slice(0, 8), [allCompanies]);
  const mainCategories = useMemo(() => getMainCategories(), []);

  // Навигация через роутер (без перезагрузки страницы)
  const handleCategoryClick = (category) => {
    navigate(`/catalog?mainCategory=${encodeURIComponent(category)}`);
  };

  // Обработчик поиска - переход в каталог с query
  const handleSearch = useCallback(() => {
    if (searchQuery && searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      // Если пустой запрос - просто переходим в каталог
      navigate('/catalog');
    }
  }, [searchQuery, navigate]);

  // Очистка поиска
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Обработчик клика по адресу компании - переход в каталог с показом на карте
  const handleAddressClick = useCallback((companyId) => {
    // Переходим в каталог с параметром companyId для автоматического показа на карте
    navigate(`/catalog?companyId=${companyId}`);
  }, [navigate]);

  if (loading) {
    return (
      <div className="main-content-loader">
        <div className="skeleton-hero" style={{ height: '600px', background: '#eee' }} />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('hero_title')} | Kontrollitud.ee</title>
        <meta name="description" content={t('hero_subtitle')} />
      </Helmet>
      
      <section className="hero">
        <HeroImage jpgSrc={tallinnBg} webpSrc={tallinnBgWebp} alt="Tallinn" />
        <div className="hero__overlay"></div>
        
        <div className="hero__content">
          <h1 className="hero__title">{t('hero_title')}</h1>
          <p className="hero__subtitle">{t('hero_subtitle')}</p>
          
          <div className="hero__search-wrapper">
            <TypewriterSearchBar 
              searchQuery={searchQuery}
              onSearchChange={(e) => setSearchQuery(e.target.value)}
              onClearSearch={handleClearSearch}
              onSearch={handleSearch}
              showButton={true}
            />
          </div>
          
          {/* Быстрый доступ к категориям */}
          <QuickAccessCategories />
        </div>
      </section>

      {/* TRUST BAR - Компактная полоса доверия */}
      <section className="trust-bar">
        <div className="trust-items">
          <div className="trust-item">
            <div className="trust-icon">🛡</div>
            <div className="trust-content">
              <h3 className="trust-label">{t('trust_verification')}</h3>
              <p className="trust-desc">{t('trust_verification_desc')}</p>
            </div>
          </div>
          
          <div className="trust-item">
            <div className="trust-icon">📞</div>
            <div className="trust-content">
              <h3 className="trust-label">{t('trust_direct')}</h3>
              <p className="trust-desc">{t('trust_direct_desc')}</p>
            </div>
          </div>
          
          <div className="trust-item">
            <div className="trust-icon">🏛</div>
            <div className="trust-content">
              <h3 className="trust-label">{t('trust_order')}</h3>
              <p className="trust-desc">{t('trust_order_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="main-content-with-sidebar">
          <main className="main-content">
            <section className="featured-section">
              <div className="section-header">
                <h2>{t('featured_businesses')}</h2>
                <Link to="/catalog" className="view-all-link">{t('view_all')} →</Link>
              </div>
              
              <div className="company-preview-grid">
                {previewCompanies.map(company => (
                  <CompanyCard 
                    key={company.id} 
                    company={company}
                    onMapClick={handleAddressClick}
                  />
                ))}
              </div>
            </section>
            
            {/* Сюда можно добавить NewsSection */}
          </main>
          
          <aside>
            <EventsSidebar />
          </aside>
        </div>
      </div>
    </>
  );
}

export default CompanyList;