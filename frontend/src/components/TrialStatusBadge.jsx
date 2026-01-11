// Trial Status Badge Component
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './TrialStatusBadge.css';

const TrialStatusBadge = ({ company }) => {
  const { t } = useTranslation();
  
  if (!company.trialActive) {
    return null;
  }
  
  const now = new Date();
  const endDate = new Date(company.trialEndDate);
  const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
  
  return (
    <div className="trial-status-badge">
      <div className="trial-badge-header">
        <span className="trial-badge-icon">⭐</span>
        <span className="trial-badge-label">{t('trial_status_active')}</span>
      </div>
      
      <div className="trial-badge-content">
        <div className="trial-days-left">
          <span className="trial-days-number">{daysLeft}</span>
          <span className="trial-days-label">{t('trial_days_left')}</span>
        </div>
        
        <div className="trial-expires">
          <span className="trial-expires-label">{t('trial_expires_on')}:</span>
          <span className="trial-expires-date">
            {endDate.toLocaleDateString(t('locale_code'), { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>
      
      {daysLeft <= 7 && (
        <Link to="/partners#pricing" className="trial-upgrade-button">
          {t('trial_upgrade_now')}
        </Link>
      )}
    </div>
  );
};

export default TrialStatusBadge;
