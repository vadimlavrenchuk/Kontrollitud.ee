// Оптимизированный компонент для рендеринга списков компаний
// Использует chunked rendering для предотвращения Long Tasks

import React, { useState, useEffect, useRef } from 'react';
import { renderInChunks, yieldToMain } from '../utils/performance';
import CompanyCard from '../CompanyCard';

/**
 * VirtualizedCompanyList - рендерит компании порциями для избежания Long Tasks
 * @param {Array} companies - Список компаний для отображения
 * @param {string} selectedCompanyId - ID выбранной компании
 * @param {Function} onCompanyClick - Callback при клике на компанию
 * @param {number} initialChunkSize - Количество компаний в первой порции (default: 10)
 * @param {number} chunkSize - Количество компаний в последующих порциях (default: 20)
 */
function VirtualizedCompanyList({ 
  companies, 
  selectedCompanyId, 
  onCompanyClick,
  initialChunkSize = 10,
  chunkSize = 20 
}) {
  const [displayedCompanies, setDisplayedCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const isLoadingRef = useRef(false);

  // Загружаем компании порциями при изменении списка
  useEffect(() => {
    const loadCompanies = async () => {
      setIsLoading(true);
      setDisplayedCompanies([]);
      setCurrentIndex(0);
      
      if (companies.length === 0) {
        setIsLoading(false);
        return;
      }
      
      // Первая порция (меньше для быстрого FCP/LCP)
      const firstChunk = companies.slice(0, initialChunkSize);
      setDisplayedCompanies(firstChunk);
      setCurrentIndex(initialChunkSize);
      setIsLoading(false);
      
      // Загружаем остальные компании в фоне
      await yieldToMain(); // Даем браузеру отрисовать первую порцию
      
      // Загружаем остальное порциями
      for (let i = initialChunkSize; i < companies.length; i += chunkSize) {
        const chunk = companies.slice(i, Math.min(i + chunkSize, companies.length));
        
        setDisplayedCompanies(prev => [...prev, ...chunk]);
        setCurrentIndex(i + chunkSize);
        
        // Yield после каждой порции
        if (i + chunkSize < companies.length) {
          await yieldToMain();
        }
      }
    };
    
    loadCompanies();
  }, [companies, initialChunkSize, chunkSize]);

  // Infinite scroll для подгрузки следующей порции
  useEffect(() => {
    if (!containerRef.current || isLoadingRef.current) return;
    
    const handleScroll = async () => {
      if (isLoadingRef.current || currentIndex >= companies.length) return;
      
      const container = containerRef.current;
      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = container.offsetTop + container.offsetHeight - 500; // Загружаем за 500px до конца
      
      if (scrollPosition > threshold) {
        isLoadingRef.current = true;
        
        const nextChunk = companies.slice(
          currentIndex, 
          Math.min(currentIndex + chunkSize, companies.length)
        );
        
        setDisplayedCompanies(prev => [...prev, ...nextChunk]);
        setCurrentIndex(prev => prev + chunkSize);
        
        await yieldToMain();
        isLoadingRef.current = false;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentIndex, companies.length, chunkSize]);

  return (
    <div ref={containerRef} className="company-list">
      {displayedCompanies.map((company, index) => (
        <CompanyCard 
          key={`${company._id || company.id}-${index}`}
          company={company}
          isSelected={selectedCompanyId === (company._id || company.id)}
          onClick={() => onCompanyClick(company._id || company.id)}
        />
      ))}
      
      {/* Индикатор загрузки следующей порции */}
      {currentIndex < companies.length && (
        <div className="loading-more" style={{
          textAlign: 'center',
          padding: '20px',
          color: '#666'
        }}>
          <div className="spinner" style={{
            display: 'inline-block',
            width: '20px',
            height: '20px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <span style={{ marginLeft: '10px' }}>
            Загрузка компаний... ({displayedCompanies.length}/{companies.length})
          </span>
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default VirtualizedCompanyList;
