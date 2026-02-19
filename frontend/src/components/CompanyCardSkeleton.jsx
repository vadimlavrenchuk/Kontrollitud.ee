import React from 'react';
import './CompanyCardSkeleton.css';

/**
 * Skeleton loader для карточки компании
 * Используется во время загрузки списка компаний для предотвращения CLS
 */
const CompanyCardSkeleton = () => {
  return (
    <div className="company-card skeleton-card">
      {/* Skeleton для header с градиентом */}
      <div className="skeleton-header">
        <div className="skeleton-icon" />
        <div className="skeleton-title" />
      </div>
      
      {/* Skeleton для body */}
      <div className="skeleton-body">
        <div className="skeleton-tags">
          <div className="skeleton-tag" />
          <div className="skeleton-tag" />
        </div>
        
        <div className="skeleton-lines">
          <div className="skeleton-line" />
          <div className="skeleton-line short" />
        </div>
        
        <div className="skeleton-footer">
          <div className="skeleton-socials">
            <div className="skeleton-social-icon" />
            <div className="skeleton-social-icon" />
          </div>
          <div className="skeleton-button" />
        </div>
      </div>
    </div>
  );
};

export default CompanyCardSkeleton;
