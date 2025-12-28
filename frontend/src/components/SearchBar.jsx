// Kontrollitud.ee/frontend/src/components/SearchBar.jsx
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const SearchBar = memo(({ searchQuery, onSearchChange, onClearSearch }) => {
  const { t } = useTranslation();

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <div className="search-bar">
      {/* Search Icon */}
      <div className="search-bar__icon">
        <FontAwesomeIcon icon={faSearch} />
      </div>
      
      {/* Search Input */}
      <input
        type="text"
        className="search-bar__input"
        placeholder={t('search_placeholder')}
        value={searchQuery}
        onChange={onSearchChange}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />
      
      {/* Clear Button */}
      {searchQuery && (
        <button
          onClick={onClearSearch}
          className="search-bar__clear"
          aria-label={t('clear_search')}
          type="button"
        >
          <span>&times;</span>
        </button>
      )}
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;
