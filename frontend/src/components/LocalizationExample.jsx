// Kontrollitud.ee/frontend/src/components/LocalizationExample.jsx
// This is a demonstration component showing all localization features

import React from 'react';
import { useLocalization } from '../hooks/useLocalization';

const LocalizationExample = () => {
  const { 
    t, 
    currentLang, 
    currentLocale,
    getContent,
    formatDate,
    formatCurrency,
    formatRelativeTime,
    changeLanguage 
  } = useLocalization();

  // Example multilingual content from database
  const exampleCompany = {
    name: "Example Company",
    description: {
      et: "See on näide ettevõtte kirjeldusest eesti keeles.",
      en: "This is an example company description in English.",
      ru: "Это пример описания компании на русском языке."
    },
    price: 99.99,
    createdAt: new Date('2024-01-15T10:30:00')
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>Localization Demo</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Current Language:</strong> {currentLang} | 
        <strong> Locale:</strong> {currentLocale}
      </div>

      <div style={{ marginBottom: '10px' }}>
        <button onClick={() => changeLanguage('et')}>ET</button>
        <button onClick={() => changeLanguage('en')}>EN</button>
        <button onClick={() => changeLanguage('ru')}>RU</button>
      </div>

      <hr />

      <div>
        <h4>{t('description')}:</h4>
        <p>{getContent(exampleCompany.description)}</p>
      </div>

      <div>
        <h4>Price (formatted):</h4>
        <p>{formatCurrency(exampleCompany.price)}</p>
      </div>

      <div>
        <h4>Created Date (full):</h4>
        <p>{formatDate(exampleCompany.createdAt)}</p>
      </div>

      <div>
        <h4>Created Date (relative):</h4>
        <p>{formatRelativeTime(exampleCompany.createdAt)}</p>
      </div>

      <div>
        <h4>Translated UI Text:</h4>
        <ul>
          <li>{t('loading')}</li>
          <li>{t('verified')}</li>
          <li>{t('details_button')}</li>
        </ul>
      </div>
    </div>
  );
};

export default LocalizationExample;
