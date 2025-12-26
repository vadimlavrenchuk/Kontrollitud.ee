// Kontrollitud.ee/frontend/src/CompanyCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLocalizedContent, getLocaleFromLanguage } from './utils/localization';

// Star rating component
const StarRating = ({ rating }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(<i key={i} className="fas fa-star" style={{ color: '#ffc107' }}></i>);
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push(<i key={i} className="fas fa-star-half-alt" style={{ color: '#ffc107' }}></i>);
    } else {
      stars.push(<i key={i} className="far fa-star" style={{ color: '#ffc107' }}></i>);
    }
  }
  return <span className="star-rating">{stars}</span>;
};

// Company Card Component
const CompanyCard = ({ company }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  
  // Get description in current language with fallback to English
  const description = getLocalizedContent(company.description, currentLang);
  
  return (
    <div className="company-card">
      {/* Image section */}
      <div className="card-image-container">
        <img 
          src={company.image || 'https://via.placeholder.com/400x250?text=No+Image'} 
          alt={company.name}
          className="card-image"
        />
        {/* Verified badge overlay */}
        {company.isVerified && (
          <div className="verified-badge-overlay">
            <i className="fas fa-check-circle"></i> {t('verified')}
          </div>
        )}
      </div>
      
      {/* Content section */}
      <div className="card-content">
        <div className="card-header">
          <h3 className="company-name">{company.name}</h3>
        </div>
        
        {/* Category and City */}
        <div className="card-meta">
          <span className="company-category-tag">{t(company.category)}</span>
          {company.city && <span className="company-city-tag">{t(company.city)}</span>}
        </div>
        
        {/* Rating */}
        <div className="rating-container">
          <StarRating rating={company.rating || 0} />
          <span className="rating-text">
            {(company.rating || 0).toFixed(1)} ({company.reviewsCount || 0} {t('reviews')})
          </span>
        </div>
        
        {/* Description */}
        {description && (
          <p className="company-description">{description}</p>
        )}
        
        {/* Details button */}
        <Link to={`/companies/${company._id}`} className="details-button">
          {t('details_button')}
        </Link>
      </div>
    </div>
  );
};

export default CompanyCard;
