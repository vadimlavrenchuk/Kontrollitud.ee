// Kontrollitud.ee/frontend/src/components/CategoryGrid.jsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { CATEGORIES, getCategoryIcon } from '../constants/categories';
import '../styles/CategoryGrid.scss';

function CategoryGrid({ onCategorySelect }) {
    const { t } = useTranslation();
    const mainCategories = Object.keys(CATEGORIES);

    return (
        <div className="category-grid-section">
            <div className="container">
                <h2 className="section-title">{t('browse_by_category')}</h2>
                <p className="section-subtitle">{t('select_category_subtitle')}</p>
                
                <div className="category-grid">
                    {mainCategories.map((category) => {
                        const icon = getCategoryIcon(category);
                        const subcategories = CATEGORIES[category].subcategories;
                        const subCount = subcategories.length;
                        
                        return (
                            <div 
                                key={category}
                                className="category-card"
                                onClick={() => onCategorySelect(category)}
                            >
                                <div className="category-icon">
                                    {icon}
                                </div>
                                <h3 className="category-name">{t(category)}</h3>
                                <p className="category-count">
                                    {subCount} {t('subcategories')}
                                </p>
                                <div className="category-hover-effect">
                                    <span>{t('view_all')}</span>
                                    <i className="fas fa-arrow-right"></i>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default CategoryGrid;
