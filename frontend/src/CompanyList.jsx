// Kontrollitud.ee/frontend/src/CompanyList.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './CompanyList.css'; 

const API_BASE_URL = 'http://localhost:5000/api/companies';

function CompanyList() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Состояния для хранения фильтров и поиска
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Все');
  const [verificationStatus, setVerificationStatus] = useState('Все');

  // Функция для получения данных с учетом текущих фильтров
  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // 1. Строим объект параметров запроса
    const params = new URLSearchParams();
    
    if (search) {
      params.append('search', search);
    }
    
    if (category !== 'Все') {
      params.append('category', category);
    }
    
    if (verificationStatus !== 'Все') {
      // Преобразуем текст 'Проверено'/'Ожидает' в булевы строки 'true'/'false' для бэкенда
      params.append('isVerified', verificationStatus === 'Проверено' ? 'true' : 'false');
    }

    // Собираем полный URL: http://localhost:5000/api/companies?search=...&category=...
    const url = `${API_BASE_URL}?${params.toString()}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Не удалось получить данные с сервера.');
      }
      const data = await response.json();
      setCompanies(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, category, verificationStatus]); 

  // Запускаем запрос при первом рендере и при изменении любого фильтра
  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]); 

  const categories = ['Все', 'Услуги', 'Магазин', 'Спа', 'Ресторан'];
  const verificationOptions = ['Все', 'Проверено', 'Ожидает'];

  // Обработчик сброса фильтров
  const handleResetFilters = () => {
    setSearch('');
    setCategory('Все');
    setVerificationStatus('Все');
  };

  if (loading) {
    return <div className="container">Загрузка каталога...</div>;
  }

  if (error) {
    return <div className="container error-message">Ошибка: {error}</div>;
  }
  
  // Отдельный компонент карточки
  const CompanyCard = ({ company }) => (
    <div className="company-card">
      <div className="card-header">
        <h3 className="company-name">{company.name}</h3>
        {/* Отображаем значок в зависимости от статуса верификации */}
        {company.isVerified ? (
          <span className="verified-badge">🌟</span>
        ) : (
          <span className="pending-badge">⏳</span>
        )}
      </div>
      <p className="company-category-tag">{company.category}</p>
      <p className="company-description">{company.description}</p>
      <Link to={`/company/${company._id}`} className="details-button">
        Подробнее
      </Link>
    </div>
  );

  return (
    <div className="container">
      <h2>Каталог компаний ({companies.length})</h2>

      {/* Панель управления (Поиск и Фильтры) */}
      <div className="controls-bar">
        
        <Link to="/add" className="add-button">
          + Добавить компанию
        </Link>
        
        <input
          type="text"
          placeholder="Поиск по названию или описанию..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)} className="filter-select">
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        
        <select value={verificationStatus} onChange={(e) => setVerificationStatus(e.target.value)} className="filter-select">
          {verificationOptions.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        <button onClick={handleResetFilters} className="reset-button">
          Сброс
        </button>

      </div>
      
      {/* Список компаний */}
      <div className="company-list">
        {companies.length > 0 ? (
          companies.map(company => (
            <CompanyCard key={company._id} company={company} />
          ))
        ) : (
          <p className="no-results">По вашему запросу компаний не найдено.</p>
        )}
      </div>
    </div>
  );
}

export default CompanyList;