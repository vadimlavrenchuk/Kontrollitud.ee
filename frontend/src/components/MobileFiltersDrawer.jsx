// Kontrollitud.ee/frontend/src/components/MobileFiltersDrawer.jsx
// Полноэкранный drawer фильтров для мобильных устройств

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faTimes } from '@fortawesome/free-solid-svg-icons';
import { getMainCategories, getSubcategories, getCategoryIcon } from '../constants/categories';
import './MobileFiltersDrawer.scss';

const CITIES = ['Tallinn', 'Tartu', 'Pärnu', 'Narva', 'Viljandi', 'Kohtla-Järve', 'Rakvere'];

function MobileFiltersDrawer({
  isOpen,
  onClose,
  searchQuery,
  setSearchQuery,
  selectedMainCategory,
  setSelectedMainCategory,
  selectedSubCategory,
  setSelectedSubCategory,
  selectedCities,
  setSelectedCities,
  isVerifiedOnly,
  setIsVerifiedOnly,
  onReset,
}) {
  const { t } = useTranslation();
  const mainCategories = getMainCategories();
  const availableSubcategories = selectedMainCategory && selectedMainCategory !== 'Все' 
    ? getSubcategories(selectedMainCategory) 
    : [];

  const handleMainCategoryChange = (category) => {
    setSelectedMainCategory(category);
    setSelectedSubCategory('Все');
  };

  const handleCityToggle = (city) => {
    setSelectedCities(prev => 
      prev.includes(city) 
        ? prev.filter(c => c !== city) 
        : [...prev, city]
    );
  };

  const handleApply = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="mobile-filters-overlay" onClick={onClose}>
      <div className="mobile-filters-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="drawer-header">
          <h2 className="drawer-title">
            <FontAwesomeIcon icon={faFilter} /> {t('filters') || 'Фильтры'}
          </h2>
          <button className="drawer-close" onClick={onClose} aria-label="Close filters">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Content */}
        <div className="drawer-content">
          {/* Поиск */}
          <div className="drawer-section">
            <h3 className="section-title">
              <FontAwesomeIcon icon={faSearch} /> {t('search')}
            </h3>
            <input 
              type="text"
              className="drawer-search"
              placeholder={t('search_placeholder') || 'Поиск компаний...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Главные категории */}
          <div className="drawer-section">
            <h3 className="section-title">{t('categories')}</h3>
            <div className="category-grid">
              <button
                className={`category-btn ${selectedMainCategory === 'Все' ? 'active' : ''}`}
                onClick={() => handleMainCategoryChange('Все')}
              >
                <span className="category-icon">📋</span>
                <span>{t('all_categories') || 'Все'}</span>
              </button>
              
              {mainCategories.map(category => (
                <button
                  key={category}
                  className={`category-btn ${selectedMainCategory === category ? 'active' : ''}`}
                  onClick={() => handleMainCategoryChange(category)}
                >
                  <span className="category-icon">{getCategoryIcon(category)}</span>
                  <span>{t(category) || category}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Подкатегории */}
          {availableSubcategories.length > 0 && (
            <div className="drawer-section">
              <h3 className="section-title">{t('subcategories')}</h3>
              <div className="subcategory-chips">
                <button
                  className={`chip ${selectedSubCategory === 'Все' ? 'active' : ''}`}
                  onClick={() => setSelectedSubCategory('Все')}
                >
                  {t('all') || 'Все'}
                </button>
                
                {availableSubcategories.map(subCat => (
                  <button
                    key={subCat}
                    className={`chip ${selectedSubCategory === subCat ? 'active' : ''}`}
                    onClick={() => setSelectedSubCategory(subCat)}
                  >
                    {t(subCat) || subCat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Города */}
          <div className="drawer-section">
            <h3 className="section-title">{t('cities') || 'Города'}</h3>
            <div className="city-grid">
              {CITIES.map(city => (
                <label key={city} className="city-checkbox">
                  <input 
                    type="checkbox"
                    checked={selectedCities.includes(city)}
                    onChange={() => handleCityToggle(city)}
                  />
                  <span className="checkbox-custom"></span>
                  <span className="city-name">{city}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Только верифицированные */}
          <div className="drawer-section">
            <label className="verified-toggle">
              <input 
                type="checkbox"
                checked={isVerifiedOnly}
                onChange={(e) => setIsVerifiedOnly(e.target.checked)}
              />
              <span className="checkbox-custom verified"></span>
              <span>✓ {t('verified_only') || 'Только проверенные'}</span>
            </label>
          </div>
        </div>

        {/* Footer: кнопки действий */}
        <div className="drawer-footer">
          <button className="btn-reset" onClick={onReset}>
            {t('reset_filters') || 'Сбросить'}
          </button>
          <button className="btn-apply" onClick={handleApply}>
            {t('apply') || 'Применить'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MobileFiltersDrawer;
