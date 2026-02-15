// Kontrollitud.ee/frontend/src/components/TypewriterSearchBar.jsx

import React, { useState, useEffect, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const TypewriterSearchBar = memo(({ searchQuery, onSearchChange, onClearSearch, onSearch, showButton = false }) => {
  const { t } = useTranslation();
  const [currentPlaceholder, setCurrentPlaceholder] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Фразы для typewriter эффекта
  const placeholders = [
    t('typewriter_snow'),
    t('typewriter_manicure'),
    t('typewriter_electrician'),
    t('typewriter_spa'),
    t('typewriter_hairdresser')
  ];

  useEffect(() => {
    const currentText = placeholders[currentIndex] || '';
    const typingSpeed = isDeleting ? 50 : 100;
    const pauseBeforeDelete = 2000;
    const pauseBeforeNext = 500;

    const timeout = setTimeout(() => {
      if (!isDeleting && charIndex < currentText.length) {
        // Печатаем символ
        setCurrentPlaceholder(currentText.substring(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      } else if (!isDeleting && charIndex === currentText.length) {
        // Пауза перед удалением
        setTimeout(() => setIsDeleting(true), pauseBeforeDelete);
      } else if (isDeleting && charIndex > 0) {
        // Удаляем символ
        setCurrentPlaceholder(currentText.substring(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      } else if (isDeleting && charIndex === 0) {
        // Переходим к следующей фразе
        setIsDeleting(false);
        setCurrentIndex((currentIndex + 1) % placeholders.length);
        setTimeout(() => setCharIndex(0), pauseBeforeNext);
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, currentIndex, placeholders]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (onSearch) {
        onSearch();
      }
    }
  };

  // Обработчик клика по иконке поиска (только если нет кнопки)
  const handleSearchClick = () => {
    if (onSearch && !showButton) {
      onSearch();
    }
  };

  return (
    <div className="search-bar">
      {/* Search Icon - кликабельная если есть onSearch и нет отдельной кнопки */}
      <div 
        className={`search-bar__icon ${onSearch && !showButton ? 'clickable' : ''}`}
        onClick={handleSearchClick}
        style={{ cursor: onSearch && !showButton ? 'pointer' : 'default' }}
      >
        <FontAwesomeIcon icon={faSearch} />
      </div>
      
      {/* Search Input */}
      <input
        type="text"
        className="search-bar__input"
        placeholder={currentPlaceholder}
        value={searchQuery}
        readOnly={!onSearchChange}
        onChange={onSearchChange}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        aria-label={t('search_placeholder') || 'Search for businesses'}
      />
      
      {/* Search Button (опциональная) */}
      {showButton && onSearch && (
        <button
          onClick={onSearch}
          className="search-bar__button"
          aria-label={t('search_button') || 'Search'}
          type="button"
        >
          {t('search_button') || 'Найти'}
        </button>
      )}
      
      {/* Clear Button */}
      {searchQuery && onClearSearch && (
        <button
          onClick={onClearSearch}
          className="search-bar__clear"
          aria-label={t('clear_search')}
          type="button"
          style={{ right: showButton && onSearch ? '7rem' : '1.25rem' }}
        >
          <span>&times;</span>
        </button>
      )}
    </div>
  );
});

TypewriterSearchBar.displayName = 'TypewriterSearchBar';

export default TypewriterSearchBar;
