import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLocalizedContent } from './utils/localization';
import { getCategoryIcon } from './constants/categories';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faStar, faStarHalfAlt, faUserCheck } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import { faInstagram, faTiktok, faYoutube } from '@fortawesome/free-brands-svg-icons';

// Мемоизируем звезды, чтобы не пересчитывать их при каждом движении карты
const StarRating = memo(({ rating }) => {
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
  return <div className="star-rating">{stars}</div>;
});

const CompanyCard = ({ company, isSelected, onClick, onHover, onLeave, onMapClick }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  
  const description = getLocalizedContent(company.description, currentLang, '');
  const companyUrl = `/companies/${company.slug || company._id || company.id}`;

  const handleCardClick = (e) => {
    // Разрешаем переход по Link только если это НЕ клик на адрес
    if (e.target.closest('.tag-city')) {
      e.preventDefault();
      return;
    }
    
    if (onClick) {
      e.preventDefault();
      onClick(company._id || company.id);
    }
  };
  
  const handleCityClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onMapClick) {
      onMapClick(company._id || company.id);
    }
  };
  
  const handleMouseEnter = () => {
    if (onHover) {
      onHover(company._id || company.id);
    }
  };
  
  const handleMouseLeave = () => {
    if (onLeave) {
      onLeave();
    }
  };

  const subLevel = company.subscriptionLevel || 'basic';
  const hasImage = company.image && company.image.trim() !== '';

  return (
    <Link 
      to={companyUrl}
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`company-card tier-${subLevel} ${isSelected ? 'is-selected' : ''} ${company.isVerified ? 'is-verified' : ''}`}
      data-company-id={company.id || company._id}
    >
      {/* HEADER С ГРАДИЕНТОМ ИЛИ ФОТО */}
      <div className={`card-header ${hasImage ? 'has-image' : 'gradient'}`}>
        {/* Фото или градиент фон */}
        {hasImage ? (
          <>
            <img src={company.image} alt={company.name} loading="lazy" className="card-header-bg" />
            <div className="card-header-overlay"></div>
          </>
        ) : (
          <div className="card-header-gradient"></div>
        )}
        
        {/* Verified badge в правом верхнем углу */}
        {company.isVerified && (
          <div className="verified-badge">
            <FontAwesomeIcon icon={faShieldAlt} />
          </div>
        )}
        
        {/* Контент хedера: иконка + название */}
        <div className="card-header-content">
          <div className="category-icon-large">
            {getCategoryIcon(company.mainCategory || company.category || 'Services')}
          </div>
          <h3 className="card-title">
            {company.name}
            {subLevel === 'pro' && <span className="badge-pro" title="Pro Business">★</span>}
            {subLevel === 'enterprise' && <span className="badge-ent" title="Enterprise">👑</span>}
          </h3>
        </div>
      </div>

      {/* НИЖНЯЯ ЧАСТЬ (БЕЛАЯ) */}
      <div className="card-body">
        {/* Теги */}
        <div className="card-tags">
          {company.city && (
            <button 
              className="tag-city clickable" 
              onClick={handleCityClick}
              title={t('view_on_map') || 'Посмотреть на карте'}
            >
              📍 {company.city}
            </button>
          )}
          <span className="tag-cat">{t(company.category || company.mainCategory)}</span>
        </div>

        {/* Рейтинг */}
        {subLevel !== 'basic' && company.rating > 0 && (
          <div className="card-rating">
            <StarRating rating={company.rating || 0} />
            <span className="rating-count">({company.reviewsCount || 0})</span>
          </div>
        )}

        {/* Описание (только если не basic) */}
        {subLevel !== 'basic' && description && (
          <p className="card-desc">{description}</p>
        )}

        {/* Футер: соцсети + кнопка */}
        <div className="card-footer">
          {subLevel !== 'basic' && (
            <div className="card-socials">
              {company.instagramUrl && (
                <button 
                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); window.open(company.instagramUrl, '_blank'); }} 
                  className="soc-link ig" 
                  title="Instagram"
                >
                  <FontAwesomeIcon icon={faInstagram} />
                </button>
              )}
              {company.tiktokUrl && (
                <button 
                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); window.open(company.tiktokUrl, '_blank'); }} 
                  className="soc-link tt"
                  title="TikTok"
                >
                  <FontAwesomeIcon icon={faTiktok} />
                </button>
              )}
            </div>
          )}

          <span className="card-more-btn">{t('details_button')} →</span>
        </div>
      </div>
    </Link>
  );
};

export default memo(CompanyCard);