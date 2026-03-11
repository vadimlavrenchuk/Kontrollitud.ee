// Kontrollitud.ee/frontend/src/pages/CatalogPage.jsx
// Полностью переписанная архитектура каталога с sidebar + карта

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { getMainCategories, getSubcategories, getCategoryIcon } from '../constants/categories';

// Category mapping: Russian → Estonian (for URL compatibility)
const CATEGORY_MAPPING = {
  'Услуги': 'Teenused',
  'Красота': 'Ilu',
  'Отдых': 'Puhkus',
  'Авто': 'Auto',
  'Питание': 'Toit',
  'Детям': 'Lapsed',
  'Магазины': 'Ostlemine',
  'Путешествия': 'Reisimine',
  // Estonian names map to themselves
  'Teenused': 'Teenused',
  'Ilu': 'Ilu',
  'Puhkus': 'Puhkus',
  'Auto': 'Auto',
  'Toit': 'Toit',
  'Lapsed': 'Lapsed',
  'Ostlemine': 'Ostlemine',
  'Reisimine': 'Reisimine'
};

// Helper function to normalize category name
const normalizeCategoryName = (category) => {
  if (!category || category === 'Все') return 'Все';
  return CATEGORY_MAPPING[category] || category;
};
import CompanyCard from '../CompanyCard';
import CompanyMap from '../CompanyMap';
import GoldenCompanyWidget from '../components/GoldenCompanyWidget';
import MobileFiltersDrawer from '../components/MobileFiltersDrawer';
import '../styles/CatalogPage.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faMapMarkedAlt, faFilter } from '@fortawesome/free-solid-svg-icons';

const CITIES = ['Все', 'Tallinn', 'Tartu', 'Pärnu', 'Narva', 'Viljandi', 'Kohtla-Järve', 'Rakvere'];

function CatalogPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // ========================================
  // STATE
  // ========================================
  const [allCompanies, setAllCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null); // Для клика по карточке
  const [hoveredCompanyId, setHoveredCompanyId] = useState(null); // Для hover синхронизации с картой
  
  // Filters from URL or defaults
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedMainCategory, setSelectedMainCategory] = useState(searchParams.get('mainCategory') || 'Все');
  const [selectedSubCategory, setSelectedSubCategory] = useState(searchParams.get('subCategory') || 'Все');
  const [selectedCities, setSelectedCities] = useState([]); // Мультивыбор городов
  const [isVerifiedOnly, setIsVerifiedOnly] = useState(false);
  const [isTopPanelStuck, setIsTopPanelStuck] = useState(false); // Для sticky-индикации
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false); // Для мобильного drawer
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  // Карта видна по умолчанию на десктопе (>768px), скрыта на мобильных
  const [isMapVisible, setIsMapVisible] = useState(typeof window !== 'undefined' ? window.innerWidth > 768 : true);
  
  // Синхронизация всех фильтров с URL параметрами при изменении URL
  // ВАЖНО: Срабатывает только ПОСЛЕ загрузки данных, чтобы избежать "пустого" состояния
  useEffect(() => {
    // Ждем загрузки данных перед применением фильтров из URL
    if (loading || allCompanies.length === 0) return;
    
    const searchFromUrl = searchParams.get('search') || '';
    const mainCategoryFromUrl = searchParams.get('mainCategory') || searchParams.get('category') || 'Все';
    const subCategoryFromUrl = searchParams.get('subCategory') || 'Все';
    
    // Normalize the category from URL (Russian → Estonian)
    const normalizedMainCategory = normalizeCategoryName(mainCategoryFromUrl);
    
    if (searchFromUrl !== searchQuery) {
      setSearchQuery(searchFromUrl);
    }
    if (normalizedMainCategory !== selectedMainCategory) {
      setSelectedMainCategory(normalizedMainCategory);
    }
    if (subCategoryFromUrl !== selectedSubCategory) {
      setSelectedSubCategory(subCategoryFromUrl);
    }
  }, [searchParams, loading, allCompanies.length]);
  
  // Обновляем видимость карты при изменении размера окна
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // Если переключаемся на десктоп - показываем карту автоматически
      if (!mobile) {
        setIsMapVisible(true);
      }
    };
    
    // Проверяем сразу при монтировании
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // ========================================
  // SCROLL TO TOP при переходе в каталог
  // ========================================
  const isInitialMount = useRef(true);
  
  useEffect(() => {
    // При первом монтировании - мгновенно, при изменении параметров - плавно
    window.scrollTo({
      top: 0,
      behavior: isInitialMount.current ? 'instant' : 'smooth'
    });
    
    isInitialMount.current = false;
  }, [searchParams]);
  
  // ========================================
  // STICKY SCROLL DETECTION
  // ========================================
  useEffect(() => {
    const handleScroll = () => {
      const topPanel = document.querySelector('.catalog-top-flex');
      if (topPanel) {
        const rect = topPanel.getBoundingClientRect();
        // Панель считается "stuck" если она находится у верхней границы viewport
        const isStuck = rect.top <= 80;
        setIsTopPanelStuck(isStuck);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Вызываем сразу для начальной проверки
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Cleanup для debounce таймера при размонтировании
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);
  
  // ========================================
  // FETCH COMPANIES FROM FIREBASE
  // ========================================
  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!db) throw new Error('Firebase не инициализирован');
      
      const companiesRef = collection(db, 'companies');
      const q = query(companiesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const companiesList = snapshot.docs.map(doc => ({
        id: doc.id,
        _id: doc.id,
        ...doc.data()
      }));
      
      // Сортировка: верифицированные → приоритет → новые
      const sortedData = companiesList.sort((a, b) => {
        const isVerifiedA = a.isVerified || a.verified || false;
        const isVerifiedB = b.isVerified || b.verified || false;
        
        if (isVerifiedA !== isVerifiedB) return isVerifiedB ? 1 : -1;
        
        const priorityA = a.priority || 0;
        const priorityB = b.priority || 0;
        if (priorityA !== priorityB) return priorityB - priorityA;
        
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      
      setAllCompanies(sortedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);
  
  // ========================================
  // HANDLE COMPANY ID FROM URL (for direct map view)
  // ========================================
  useEffect(() => {
    const companyIdFromUrl = searchParams.get('companyId');
    if (companyIdFromUrl && allCompanies.length > 0) {
      // Проверяем, существует ли компания
      const company = allCompanies.find(c => (c._id || c.id) === companyIdFromUrl);
      if (company) {
        // Показываем карту
        setIsMapVisible(true);
        // Устанавливаем выбранную компанию
        setSelectedCompanyId(companyIdFromUrl);
        
        // Прокручиваем к карте после небольшой задержки
        setTimeout(() => {
          const mapPanel = document.getElementById('catalog-map');
          if (mapPanel) {
            mapPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 400);
      }
    }
  }, [searchParams, allCompanies]);
  
  // ========================================
  // FILTERING LOGIC
  // ========================================
  const filteredCompanies = useMemo(() => {
    let result = [...allCompanies];
    const initialCount = result.length;
    
    // 1. Поиск по имени и описанию
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
    
    // 2. Главная категория (with fallback)
    if (selectedMainCategory && selectedMainCategory !== 'Все') {
      const beforeFilter = result.length;
      result = result.filter(company => company.mainCategory === selectedMainCategory);
      
      // Fallback: если категория не найдена, показываем все компании
      if (result.length === 0 && beforeFilter > 0) {
        result = [...allCompanies]; // Сброс к исходному списку
      }
    }
    
    // 3. Подкатегория
    if (selectedSubCategory && selectedSubCategory !== 'Все') {
      result = result.filter(company => 
        company.subCategory === selectedSubCategory || company.category === selectedSubCategory
      );
    }
    
    // 4. Города (мультивыбор)
    if (selectedCities.length > 0) {
      result = result.filter(company => selectedCities.includes(company.city));
    }
    
    // 5. Только верифицированные
    if (isVerifiedOnly) {
      result = result.filter(company => company.verified === true || company.isVerified === true);
    }
    
    return result;
  }, [allCompanies, searchQuery, selectedMainCategory, selectedSubCategory, selectedCities, isVerifiedOnly]);
  
  // ========================================
  // URL SYNC (обновление URLSearchParams при изменении фильтров)
  // ========================================
  useEffect(() => {
    // Создаем новые параметры
    const params = new URLSearchParams();
    
    if (searchQuery) params.set('search', searchQuery);
    if (selectedMainCategory !== 'Все') params.set('mainCategory', selectedMainCategory);
    if (selectedSubCategory !== 'Все') params.set('subCategory', selectedSubCategory);
    
    // Проверяем, отличаются ли новые параметры от текущих
    const currentParams = searchParams.toString();
    const newParams = params.toString();
    
    if (currentParams !== newParams) {
      setSearchParams(params, { replace: true });
    }
  }, [searchQuery, selectedMainCategory, selectedSubCategory]);
  
  // ========================================
  // HANDLERS
  // ========================================
  const handleMainCategoryChange = (category) => {
    setSelectedMainCategory(category);
    setSelectedSubCategory('Все'); // Сбрасываем подкатегорию при смене главной
  };
  
  const handleCityToggle = (city) => {
    setSelectedCities(prev => 
      prev.includes(city) 
        ? prev.filter(c => c !== city) 
        : [...prev, city]
    );
  };
  
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedMainCategory('Все');
    setSelectedSubCategory('Все');
    setSelectedCities([]);
    setIsVerifiedOnly(false);
  };
  
  const handleCompanyCardClick = useCallback((companyId) => {
    setSelectedCompanyId(companyId);
    
    // Прокрутка к карте на десктопе
    setTimeout(() => {
      const mapPanel = document.getElementById('catalog-map');
      if (mapPanel && window.innerWidth > 1024) {
        mapPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  }, []);
  
  // Скролл к карте для мобильной кнопки (адреса)
  const handleScrollToMap = useCallback((companyId) => {
    // Находим компанию и проверяем наличие координат
    const company = filteredCompanies.find(c => (c._id || c.id) === companyId);
    if (!company) return;
    
    const lat = parseFloat(company.location?.lat || company.latitude);
    const lng = parseFloat(company.location?.lng || company.longitude);
    
    // Проверка валидности координат
    if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
      alert(t('no_coordinates') || 'У этой компании нет координат на карте');
      return;
    }
    
    // Устанавливаем selected компанию для flyTo
    setSelectedCompanyId(companyId);
    
    // Показываем карту если она скрыта (на мобилке)
    setIsMapVisible(true);
    
    // Прокрутка к карте
    setTimeout(() => {
      const mapPanel = document.getElementById('catalog-map');
      if (mapPanel) {
        mapPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  }, [filteredCompanies, t]);
  
  // Обработчик клика на маркер карты - автоматическая прокрутка к карте для показа popup
  const handleMarkerClick = useCallback((companyId) => {
    // Устанавливаем selected компанию
    setSelectedCompanyId(companyId);
    
    // Показываем карту если она скрыта (на мобилке)
    setIsMapVisible(true);
    
    // Проверяем, виден ли контейнер карты на экране
    setTimeout(() => {
      const mapPanel = document.getElementById('catalog-map');
      if (mapPanel) {
        const rect = mapPanel.getBoundingClientRect();
        const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
        
        // Прокручиваем только если карта не полностью видна
        if (!isVisible) {
          mapPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 150);
  }, []);
  
  // Debounce для hover (150ms)
  const hoverTimeoutRef = useRef(null);
  
  // Обработчик наведения на карточку с debounce
  const handleCardHover = useCallback((companyId) => {
    // Очищаем предыдущий таймер
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Устанавливаем новый таймер на 150ms
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredCompanyId(companyId);
    }, 150);
  }, []);
  
  // Обработчик схода с карточки
  const handleCardLeave = useCallback(() => {
    // Отменяем pending hover
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredCompanyId(null);
  }, []);
  
  // Обработчик клика на золотой виджет
  const handleGoldenWidgetClick = useCallback((companyId) => {
    setSelectedCompanyId(companyId);
    // НЕ устанавливаем hover при клике - только selected
    
    // Прокрутка к выбранной компании в списке
    setTimeout(() => {
      const companyCard = document.querySelector(`[data-company-id="${companyId}"]`);
      if (companyCard) {
        companyCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }, []);
  
  // ========================================
  // MEMOIZED DATA
  // ========================================
  const mainCategories = useMemo(() => getMainCategories(), []);
  const availableSubcategories = useMemo(() => {
    if (!selectedMainCategory || selectedMainCategory === 'Все') return [];
    return getSubcategories(selectedMainCategory);
  }, [selectedMainCategory]);
  
  // Выбор золотой компании (Enterprise или isGoldenDay)
  const goldenCompany = useMemo(() => {
    // Сначала ищем компании с isGoldenDay: true
    const goldenDayCompany = filteredCompanies.find(c => c.isGoldenDay === true);
    if (goldenDayCompany) return goldenDayCompany;

    // Если нет, ищем Enterprise по subscriptionLevel
    const enterpriseCompany = filteredCompanies.find(c =>
      c.subscriptionLevel === 'enterprise'
    );
    if (enterpriseCompany) return enterpriseCompany;

    // Если нет Enterprise, берем первую Pro
    const proCompany = filteredCompanies.find(c =>
      c.subscriptionLevel === 'pro'
    );
    return proCompany || null;
  }, [filteredCompanies]);
  
  // ========================================
  // RENDER
  // ========================================
  if (loading) {
    return (
      <div className="catalog-loader">
        <div className="spinner"></div>
        <p>{t('loading')}</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="catalog-error">
        <p>❌ {t('error')}: {error}</p>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{t('catalog')} | Kontrollitud.ee</title>
        <meta name="description" content={t('catalog_description')} />
        <link rel="canonical" href="https://kontrollitud.ee/catalog" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://kontrollitud.ee/catalog" />
        <meta property="og:site_name" content="Kontrollitud.ee" />
        <meta property="og:title" content={`${t('catalog')} | Kontrollitud.ee`} />
        <meta property="og:description" content={t('catalog_description')} />
        <meta property="og:image" content="https://kontrollitud.ee/og-default.jpg" />
        <meta property="og:locale" content="et_EE" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${t('catalog')} | Kontrollitud.ee`} />
        <meta name="twitter:description" content={t('catalog_description')} />
        <meta name="twitter:image" content="https://kontrollitud.ee/og-default.jpg" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "@id": "https://kontrollitud.ee/catalog",
          "url": "https://kontrollitud.ee/catalog",
          "name": `${t('catalog')} | Kontrollitud.ee`,
          "description": t('catalog_description'),
          "isPartOf": {
            "@type": "WebSite",
            "@id": "https://kontrollitud.ee/#website"
          },
          "hasPart": filteredCompanies.slice(0, 20).map(c => ({
            "@type": "LocalBusiness",
            "@id": `https://kontrollitud.ee/companies/${c.slug || c._id || c.id}`,
            "name": c.name,
            "url": `https://kontrollitud.ee/companies/${c.slug || c._id || c.id}`,
            ...(c.city && { "address": { "@type": "PostalAddress", "addressLocality": c.city, "addressCountry": "EE" } })
          }))
        })}</script>
      </Helmet>
      
      <div className="catalog-page">
        {/* ========================================
            SIDEBAR (LEFT)
            ======================================== */}
        <aside className="catalog-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">
              <FontAwesomeIcon icon={faSearch} /> {t('search')}
            </h3>
            <input 
              type="text"
              className="sidebar-search"
              placeholder={t('search_placeholder') || 'Поиск компаний...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Главные категории */}
          <div className="sidebar-section">
            <h3 className="sidebar-title">
              <FontAwesomeIcon icon={faFilter} /> {t('categories')}
            </h3>
            <div className="category-list">
              <button
                className={`category-item ${selectedMainCategory === 'Все' ? 'active' : ''}`}
                onClick={() => handleMainCategoryChange('Все')}
              >
                <span className="category-icon">📋</span>
                <span>{t('all_categories') || 'Все категории'}</span>
              </button>
              
              {mainCategories.map(category => (
                <button
                  key={category}
                  className={`category-item ${selectedMainCategory === category ? 'active' : ''}`}
                  onClick={() => handleMainCategoryChange(category)}
                >
                  <span className="category-icon">{getCategoryIcon(category)}</span>
                  <span>{t(category) || category}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Подкатегории (если выбрана главная) */}
          {availableSubcategories.length > 0 && (
            <div className="sidebar-section">
              <h3 className="sidebar-title">{t('subcategories')}</h3>
              <div className="subcategory-list">
                <button
                  className={`subcategory-item ${selectedSubCategory === 'Все' ? 'active' : ''}`}
                  onClick={() => setSelectedSubCategory('Все')}
                >
                  {t('all') || 'Все'}
                </button>
                
                {availableSubcategories.map(subCat => (
                  <button
                    key={subCat}
                    className={`subcategory-item ${selectedSubCategory === subCat ? 'active' : ''}`}
                    onClick={() => setSelectedSubCategory(subCat)}
                  >
                    {t(subCat) || subCat}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Города (чекбоксы) */}
          <div className="sidebar-section">
            <h3 className="sidebar-title">{t('cities') || 'Города'}</h3>
            <div className="city-checkboxes">
              {CITIES.filter(city => city !== 'Все').map(city => (
                <label key={city} className="checkbox-label">
                  <input 
                    type="checkbox"
                    checked={selectedCities.includes(city)}
                    onChange={() => handleCityToggle(city)}
                  />
                  <span>{city}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Верифицированные */}
          <div className="sidebar-section">
            <label className="checkbox-label verified-filter">
              <input 
                type="checkbox"
                checked={isVerifiedOnly}
                onChange={(e) => setIsVerifiedOnly(e.target.checked)}
              />
              <span>✓ {t('verified_only') || 'Только проверенные'}</span>
            </label>
          </div>
          
          {/* Сброс фильтров */}
          <button className="reset-filters-btn" onClick={handleResetFilters}>
            {t('reset_filters') || 'Сбросить фильтры'}
          </button>
        </aside>
        
        {/* ========================================
            MAIN CONTENT (RIGHT)
            ======================================== */}
        <main className="catalog-main">
          {/* Кнопка фильтров для мобилок */}
          <button className="mobile-filters-btn" onClick={() => setIsMobileFiltersOpen(true)}>
            <FontAwesomeIcon icon={faFilter} />
            <span>{t('filters') || 'Фильтры'}</span>
            {(searchQuery || selectedMainCategory !== 'Все' || selectedCities.length > 0) && (
              <span className="filters-badge">{[
                searchQuery ? 1 : 0,
                selectedMainCategory !== 'Все' ? 1 : 0,
                selectedCities.length
              ].reduce((a, b) => a + b, 0)}</span>
            )}
          </button>
          
          {/* Золотой виджет для мобилок (СРАЗУ под кнопкой фильтров) */}
          {goldenCompany && (
            <div className="golden-widget-mobile">
              <GoldenCompanyWidget 
                company={goldenCompany}
                onCompanyClick={handleGoldenWidgetClick}
              />
            </div>
          )}
          
          {/* Заголовок с результатами */}
          <div className="catalog-header">
            <h1 className="catalog-title">{t('catalog')}</h1>
            <p className="catalog-count">
              {t('found_companies') || 'Найдено'}: <strong>{filteredCompanies.length}</strong>
            </p>
          </div>
          
          {/* Кнопка показать/скрыть карту (только на мобилке) */}
          <button 
            className="mobile-show-map-btn" 
            onClick={() => {
              setIsMapVisible(!isMapVisible);
            }}
          >
            <FontAwesomeIcon icon={faMapMarkedAlt} />
            <span>{isMapVisible ? (t('hide_map') || 'Скрыть карту') : (t('show_map') || 'Показать карту')}</span>
          </button>
          
          {/* ========================================
              TOP FLEX AREA (карта + золотой виджет)
              ======================================== */}
          <div className={`catalog-top-flex ${isTopPanelStuck ? 'is-stuck' : ''} ${isMobile && !isMapVisible ? 'map-hidden' : ''}`}>
            {/* Карта (слева, 70%) */}
            <div className="catalog-map-container" id="catalog-map">
              <h3 className="map-title">
                <FontAwesomeIcon icon={faMapMarkedAlt} /> {t('map') || 'Карта'}
              </h3>
              <CompanyMap 
                companies={filteredCompanies}
                selectedCompanyId={selectedCompanyId}
                hoveredCompanyId={hoveredCompanyId}
                onMarkerClick={handleMarkerClick}
              />
            </div>
            
            {/* Золотой виджет (справа, компактный) */}
            {goldenCompany && (
              <div className="golden-widget-container">
                <GoldenCompanyWidget 
                  company={goldenCompany}
                  onCompanyClick={handleGoldenWidgetClick}
                />
              </div>
            )}
          </div>
          
          {/* ========================================
              COMPANY GRID (3 в ряд)
              ======================================== */}
          {filteredCompanies.length === 0 ? (
            <div className="no-results">
              <p>{t('no_companies_found') || 'Компании не найдены'}</p>
            </div>
          ) : (
            <div className="company-grid">
              {filteredCompanies.map(company => (
                <CompanyCard 
                  key={company.id} 
                  company={company}
                  isSelected={selectedCompanyId === company.id}
                  onClick={() => handleCompanyCardClick(company.id)}
                  onHover={() => handleCardHover(company.id)}
                  onLeave={handleCardLeave}
                  onMapClick={handleScrollToMap}
                  data-company-id={company.id}
                />
              ))}
            </div>
          )}
        </main>
      </div>
      
      {/* Mobile Filters Drawer */}
      <MobileFiltersDrawer 
        isOpen={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedMainCategory={selectedMainCategory}
        setSelectedMainCategory={handleMainCategoryChange}
        selectedSubCategory={selectedSubCategory}
        setSelectedSubCategory={setSelectedSubCategory}
        selectedCities={selectedCities}
        setSelectedCities={setSelectedCities}
        isVerifiedOnly={isVerifiedOnly}
        setIsVerifiedOnly={setIsVerifiedOnly}
        onReset={handleResetFilters}
      />
    </>
  );
}

export default CatalogPage;
