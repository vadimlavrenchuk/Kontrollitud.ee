// Trial Promo Banner Component
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './TrialPromoBanner.css';

const TrialPromoBanner = () => {
  const { t } = useTranslation();

  return (
    <div className="trial-promo-banner">
      <div className="trial-promo-content">
        <div className="trial-promo-icon">🎁</div>
        <div className="trial-promo-text">
          <h2 className="trial-promo-title">{t('trial_banner_title')}</h2>
          <p className="trial-promo-subtitle">{t('trial_banner_subtitle')}</p>
        </div>
        <Link to="/partners#pricing" className="trial-promo-button">
          {t('trial_banner_button')}
        </Link>
      </div>
    </div>
  );
};

export default TrialPromoBanner;
