// Kontrollitud.ee/frontend/src/components/SearchBar.jsx
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const SearchBar = memo(({ searchQuery, onSearchChange, onClearSearch }) => {
  const { t } = useTranslation();

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission or page reload
    }
  };

  return (
    <div className="search-bar-container fade-in-delay-2">
      <div className="search-bar">
        <FontAwesomeIcon icon={faSearch} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder={t('search_placeholder')}
          value={searchQuery}
          onChange={onSearchChange}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        {searchQuery && (
          <button 
            className="search-clear-btn"
            onClick={onClearSearch}
            aria-label={t('clear_search')}
            type="button"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;
