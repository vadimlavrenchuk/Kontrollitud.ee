// Kontrollitud.ee/frontend/src/CompanyForm.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'

const API_BASE_URL = 'http://localhost:5000/api/companies';

function CompanyForm() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Услуги');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, category, description }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при добавлении компании.');
      }

      setMessage('Компания успешно добавлена!');
      setTimeout(() => {
        navigate('/'); // Перенаправляем на главную страницу
      }, 1500);

    } catch (error) {
      setMessage(`Ошибка: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Добавить новую компанию</h2>
      <form onSubmit={handleSubmit} className="company-form">

        <div className="form-group">
          <label htmlFor="name">Название компании:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Категория:</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="Услуги">Услуги</option>
            <option value="Магазин">Магазин</option>
            <option value="Спа">Спа</option>
            <option value="Ресторан">Ресторан</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Описание:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Отправка...' : 'Добавить'}
        </button>

        {message && <p className="message-status">{message}</p>}
      </form>
    </div>
  );
}

export default CompanyForm;