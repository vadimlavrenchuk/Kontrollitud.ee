// Kontrollitud.ee/frontend/src/components/GoldenCompanyWidget.jsx
// Премиум виджет для Enterprise компаний с золотым градиентом и анимацией

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { getCategoryIcon } from '../constants/categories';
import { getLocalizedContent } from '../utils/localization';
import './GoldenCompanyWidget.scss';

const GoldenCompanyWidget = ({ company, onCompanyClick }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  
  if (!company) {
    return null; // Если нет подходящей компании
  }
  
  const description = getLocalizedContent(company.description, currentLang, '');
  const hasImage = company.image && company.image.trim() !== '';
  
  const handleClick = () => {
    if (onCompanyClick) {
      onCompanyClick(company.id || company._id);
    }
  };
  
  return (
    <div className="golden-widget" onClick={handleClick}>
      {/* Анимированный блик */}
      <div className="golden-shine"></div>
      
      {/* Фоновое изображение или градиент */}
      {hasImage ? (
        <>
          <img src={company.image} alt={company.name} className="golden-bg-image" />
          <div className="golden-overlay"></div>
        </>
      ) : (
        <div className="golden-gradient"></div>
      )}
      
      {/* Контент виджета */}
      <div className="golden-content">
        {/* Badge Enterprise */}
        <div className="golden-badge">
          <FontAwesomeIcon icon={faCrown} />
          <span>{t('enterprise') || 'PREMIUM'}</span>
        </div>
        
        {/* Иконка категории или лого */}
        <div className="golden-icon">
          {hasImage ? (
            <div className="golden-logo-circle">
              <img src={company.image} alt={company.name} />
            </div>
          ) : (
            <div className="category-icon-huge">
              {getCategoryIcon(company.mainCategory || company.category || 'Services')}
            </div>
          )}
        </div>
        
        {/* Название компании */}
        <h2 className="golden-title">{company.name}</h2>
        
        {/* Краткое описание */}
        {description && (
          <p className="golden-description">{description}</p>
        )}
        
        {/* Рейтинг и город */}
        <div className="golden-meta">
          {company.rating > 0 && (
            <div className="golden-rating">
              ⭐ {company.rating.toFixed(1)} ({company.reviewsCount || 0})
            </div>
          )}
          {company.city && (
            <div className="golden-location">
              📍 {company.city}
            </div>
          )}
        </div>
        
        {/* Пульсирующая кнопка */}
        <button className="golden-button pulse">
          {t('learn_more') || 'Узнать больше'}
          <FontAwesomeIcon icon={faArrowRight} className="btn-icon" />
        </button>
      </div>
    </div>
  );
};

export default GoldenCompanyWidget;
