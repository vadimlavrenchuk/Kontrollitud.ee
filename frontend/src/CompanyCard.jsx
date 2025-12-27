// Kontrollitud.ee/frontend/src/CompanyCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLocalizedContent, getLocaleFromLanguage } from './utils/localization';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faStar, faStarHalfAlt, faUserCheck } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import { faInstagram, faTiktok, faYoutube } from '@fortawesome/free-brands-svg-icons';

// Star rating component
const StarRating = ({ rating }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(<FontAwesomeIcon key={i} icon={faStar} className="star-icon filled" />);
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push(<FontAwesomeIcon key={i} icon={faStarHalfAlt} className="star-icon filled" />);
    } else {
      stars.push(<FontAwesomeIcon key={i} icon={faStarRegular} className="star-icon empty" />);
    }
  }
  return <span className="star-rating">{stars}</span>;
};

// Company Card Component
const CompanyCard = ({ company, isSelected, onClick }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  
  // Get description in current language with fallback to English
  const description = getLocalizedContent(company.description, currentLang);
  
  const handleCardClick = (e) => {
    // Prevent propagation if clicking on links
    if (e.target.tagName === 'A' || e.target.closest('a')) {
      return;
    }
    if (onClick) {
      onClick();
    }
  };
  
  return (
    <div 
      className={`company-card ${company.isVerified ? 'verified-card' : ''} ${isSelected ? 'selected' : ''}`}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Image section */}
      <div className="card-image-container">
        <img 
          src={company.image || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="250"%3E%3Crect width="400" height="250" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="18" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E'} 
          alt={company.name}
          className="card-image"
        />
        {/* Verified badge overlay - only for medium and strong subscriptions */}
        {company.isVerified && (company.subscriptionLevel === 'medium' || company.subscriptionLevel === 'strong') && (
          <div className="verified-badge-overlay">
            <FontAwesomeIcon icon={faShieldAlt} className="shield-icon" />
            <span>{t('verified')}</span>
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
        
        {/* Social Media Icons - only for medium and strong subscriptions */}
        {(company.subscriptionLevel === 'medium' || company.subscriptionLevel === 'strong') && 
         (company.instagramUrl || company.tiktokUrl || company.youtubeUrl) && (
          <div className="social-media-links">
            {company.instagramUrl && (
              <a 
                href={company.instagramUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-icon instagram"
                title="Instagram"
              >
                <FontAwesomeIcon icon={faInstagram} />
              </a>
            )}
            {company.tiktokUrl && (
              <a 
                href={company.tiktokUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-icon tiktok"
                title="TikTok"
              >
                <FontAwesomeIcon icon={faTiktok} />
              </a>
            )}
            {company.youtubeUrl && (
              <a 
                href={company.youtubeUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-icon youtube"
                title="YouTube"
              >
                <FontAwesomeIcon icon={faYoutube} />
              </a>
            )}
          </div>
        )}
        
        {/* Reviewer Badge - only for medium and strong subscriptions */}
        {(company.subscriptionLevel === 'medium' || company.subscriptionLevel === 'strong') && 
         company.reviewerName && (
          <div className="reviewer-badge">
            <FontAwesomeIcon icon={faUserCheck} className="reviewer-icon" />
            <span>Checked by {company.reviewerName}</span>
          </div>
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
