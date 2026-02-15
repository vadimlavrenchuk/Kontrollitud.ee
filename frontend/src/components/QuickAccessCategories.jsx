// Kontrollitud.ee/frontend/src/components/QuickAccessCategories.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './QuickAccessCategories.scss';

const QuickAccessCategories = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const categories = [
    {
      id: 'home',
      icon: '🏠',
      title: t('quick_home'),
      desc: t('quick_home_desc'),
      category: 'Teenused', // Services
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      id: 'beauty',
      icon: '✨',
      title: t('quick_beauty'),
      desc: t('quick_beauty_desc'),
      category: 'Ilu', // Beauty
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      id: 'spa',
      icon: '💆',
      title: t('quick_spa'),
      desc: t('quick_spa_desc'),
      category: 'Puhkus', // Vacation/Rest
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      id: 'auto',
      icon: '🚗',
      title: t('quick_auto'),
      desc: t('quick_auto_desc'),
      category: 'Auto', // Auto
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    },
    {
      id: 'services',
      icon: '📦',
      title: t('quick_services'),
      desc: t('quick_services_desc'),
      category: 'Teenused', // Services
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    },
    {
      id: 'food',
      icon: '🍽️',
      title: t('quick_food'),
      desc: t('quick_food_desc'),
      category: 'Toit', // Food
      gradient: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)'
    },
    {
      id: 'kids',
      icon: '🧸',
      title: t('quick_kids'),
      desc: t('quick_kids_desc'),
      category: 'Lapsed', // Kids
      gradient: 'linear-gradient(135deg, #fdcbf1 0%, #e6dee9 100%)'
    },
    {
      id: 'shopping',
      icon: '🛍️',
      title: t('quick_shopping'),
      desc: t('quick_shopping_desc'),
      category: 'Ostlemine', // Shopping
      gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)'
    },
    {
      id: 'travel',
      icon: '✈️',
      title: t('quick_travel'),
      desc: t('quick_travel_desc'),
      category: 'Reisimine', // Travel
      gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
    }
  ];

  const handleCategoryClick = (category) => {
    navigate(`/catalog?mainCategory=${encodeURIComponent(category)}`);
  };

  return (
    <div className="quick-access">
      <h3 className="quick-access__title">{t('popular_categories')}</h3>
      <div className="quick-access__grid">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className="quick-card"
            onClick={() => handleCategoryClick(cat.category)}
            style={{ '--card-gradient': cat.gradient }}
          >
            <div className="quick-card__content">
              <div className="quick-card__icon">{cat.icon}</div>
              <div className="quick-card__text">
                <h4 className="quick-card__title">{cat.title}</h4>
                <p className="quick-card__desc">{cat.desc}</p>
              </div>
            </div>
            <div className="quick-card__shine"></div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickAccessCategories;
