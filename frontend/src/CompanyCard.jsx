// Kontrollitud.ee/frontend/src/CompanyCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLocalizedContent, getLocaleFromLanguage } from './utils/localization';
import { getCategoryIcon } from './constants/categories';
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
  
  // Get description with fallback: current language -> Estonian -> English -> Russian
  const description = getLocalizedContent(company.description, currentLang, '');
  
  const companyUrl = `/companies/${company.slug || company._id || company.id}`;
  
  return (
    <Link 
      to={companyUrl}
      className={`company-card ${company.isVerified ? 'verified-card' : ''} ${isSelected ? 'selected' : ''}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      {/* Image section */}
      <div className="card-image-container">
        {company.image ? (
          <img 
            src={company.image} 
            alt={company.name}
            className="card-image"
          />
        ) : (
          <div className="card-image-placeholder">
            <span className="category-icon-large">
              {getCategoryIcon(company.mainCategory || 'Teenused')}
            </span>
            <span className="placeholder-text">{company.name}</span>
          </div>
        )}
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
                onClick={(e) => e.stopPropagation()}
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
                onClick={(e) => e.stopPropagation()}
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
                onClick={(e) => e.stopPropagation()}
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
        <span className="details-button">
          {t('details_button')}
        </span>
      </div>
    </Link>
  );
};

export default CompanyCard;
