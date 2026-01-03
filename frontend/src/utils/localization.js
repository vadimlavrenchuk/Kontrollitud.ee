// Kontrollitud.ee/frontend/src/utils/localization.js

/**
 * LOCALIZATION UTILITIES
 * 
 * This module provides comprehensive localization support for the application:
 * 
 * 1. CONTENT SWITCHING: 
 *    - getLocalizedContent() handles multi-language database content
 *    - Automatic fallback: current language -> English -> Estonian -> any available
 * 
 * 2. PERSISTENCE:
 *    - Language preference saved to localStorage (configured in i18n.js)
 *    - Automatically loads saved language on page refresh
 * 
 * 3. DATE/CURRENCY FORMATTING:
 *    - formatDate() - Locale-aware date formatting (et-EE, en-US, ru-RU)
 *    - formatCurrency() - Currency formatting with proper symbols
 *    - formatRelativeTime() - "2 days ago" style formatting
 * 
 * 4. LOCALE MAPPING:
 *    - getLocaleFromLanguage() converts language codes to full locales
 * 
 * USAGE:
 *    import { getLocalizedContent } from './utils/localization';
 *    const description = getLocalizedContent(company.description, i18n.language);
 * 
 * OR use the custom hook:
 *    import { useLocalization } from './hooks/useLocalization';
 *    const { getContent, formatDate } = useLocalization();
 */

/**
 * Get localized content with fallback logic
 * @param {Object} content - Object with language keys (et, en, ru)
 * @param {string} currentLang - Current language code
 * @param {string} placeholder - Optional placeholder text when no content available
 * @returns {string} - Localized content or fallback
 */
export const getLocalizedContent = (content, currentLang, placeholder = '') => {
  if (!content || typeof content !== 'object') {
    return placeholder;
  }
  
  // Priority: current language -> Estonian (default) -> English -> Russian -> any available -> placeholder
  return content[currentLang] || 
         content.et || 
         content.en || 
         content.ru ||
         Object.values(content).find(val => val && val.trim()) || 
         placeholder;
};

/**
 * Format date according to locale
 * @param {Date|string} date - Date to format
 * @param {string} locale - Locale code (et-EE, en-US, ru-RU)
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date
 */
export const formatDate = (date, locale = 'et-EE', options = {}) => {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
};

/**
 * Format currency according to locale
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (EUR, USD, etc.)
 * @param {string} locale - Locale code
 * @returns {string} - Formatted currency
 */
export const formatCurrency = (amount, currency = 'EUR', locale = 'et-EE') => {
  if (amount === null || amount === undefined) return '';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Get locale code based on language
 * @param {string} language - Language code (et, en, ru)
 * @returns {string} - Full locale code
 */
export const getLocaleFromLanguage = (language) => {
  const localeMap = {
    et: 'et-EE',
    en: 'en-US',
    ru: 'ru-RU'
  };
  
  return localeMap[language] || 'et-EE';
};

/**
 * Format relative time (e.g., "2 days ago")
 * @param {Date|string} date - Date to format
 * @param {string} locale - Locale code
 * @returns {string} - Relative time string
 */
export const formatRelativeTime = (date, locale = 'et-EE') => {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now - dateObj) / 1000);
  
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  
  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second');
  } else if (diffInSeconds < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  } else if (diffInSeconds < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  } else if (diffInSeconds < 2592000) {
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  } else if (diffInSeconds < 31536000) {
    return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
  } else {
    return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
  }
};
