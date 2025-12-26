// Kontrollitud.ee/frontend/src/hooks/useLocalization.js

import { useTranslation } from 'react-i18next';
import { 
  getLocalizedContent, 
  formatDate, 
  formatCurrency, 
  formatRelativeTime,
  getLocaleFromLanguage 
} from '../utils/localization';

/**
 * Custom hook for localization utilities
 * Provides easy access to all localization functions with current language
 */
export const useLocalization = () => {
  const { t, i18n } = useTranslation();
  const currentLocale = getLocaleFromLanguage(i18n.language);

  return {
    t,
    i18n,
    currentLang: i18n.language,
    currentLocale,
    
    // Get localized content from object
    getContent: (content) => getLocalizedContent(content, i18n.language),
    
    // Format date with current locale
    formatDate: (date, options) => formatDate(date, currentLocale, options),
    
    // Format currency with current locale
    formatCurrency: (amount, currency = 'EUR') => formatCurrency(amount, currency, currentLocale),
    
    // Format relative time
    formatRelativeTime: (date) => formatRelativeTime(date, currentLocale),
    
    // Change language and save to localStorage
    changeLanguage: (lng) => {
      i18n.changeLanguage(lng);
      localStorage.setItem('language', lng);
    }
  };
};

/**
 * Category translations mapping
 * Can be used to display localized category names
 */
export const getCategoryTranslation = (category, t) => {
  const categoryMap = {
    'SPA': {
      et: 'SPA',
      en: 'SPA',
      ru: 'СПА'
    },
    'Restaurants': {
      et: 'Restoranid',
      en: 'Restaurants',
      ru: 'Рестораны'
    },
    'Shops': {
      et: 'Poed',
      en: 'Shops',
      ru: 'Магазины'
    },
    'Kids': {
      et: 'Lapsed',
      en: 'Kids',
      ru: 'Детям'
    },
    'Travel': {
      et: 'Reisimine',
      en: 'Travel',
      ru: 'Путешествия'
    },
    'Auto': {
      et: 'Auto',
      en: 'Auto',
      ru: 'Авто'
    },
    'Services': {
      et: 'Teenused',
      en: 'Services',
      ru: 'Услуги'
    }
  };

  return categoryMap[category]?.[t.language] || category;
};
