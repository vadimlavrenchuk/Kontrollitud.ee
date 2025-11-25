// Kontrollitud.ee/frontend/src/App.jsx

import React from 'react';
// Импортируем роутинг
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'; 

// !!! ИСПРАВЛЕННЫЕ ИМПОРТЫ !!!
import CompanyList from './CompanyList.jsx'; // <-- Добавили .jsx
import CompanyDetails from './CompanyDetails.jsx'; // <-- Добавили .jsx
import CompanyForm from './CompanyForm.jsx'; // <-- Добавили .jsx

function App() {
  return (
    <Router>
      <div className="app-main">
        <header className="app-header">
          <h1>Kontrollitud.ee 🇪🇪</h1>
          <p>Каталог проверенных компаний</p>
        </header>
        
        <Routes>
          {/* Главная страница: отображаем список компаний */}
          <Route path="/" element={<CompanyList />} />
          
          {/* Страница для просмотра деталей (пока не реализовано, но маршрут готов) */}
          <Route path="/company/:id" element={<CompanyDetails />} />
          
          {/* Страница для добавления новой компании */}
          <Route path="/add" element={<CompanyForm />} /> 
          
          {/* Страница 404 (на всякий случай) */}
          <Route path="*" element={<h2 style={{textAlign: 'center', marginTop: '50px'}}>404 Страница не найдена</h2>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;