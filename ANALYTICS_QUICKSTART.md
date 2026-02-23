# Quick Start: Analytics in Admin Dashboard

## ✅ What's Implemented

**3 Stat Cards** в Admin Dashboard:
- 👥 **Total Users** - из коллекции `users`
- 🏢 **Active Businesses** - из коллекции `companies` 
- 📊 **Site Traffic** - из документа `stats/global`

## 🚀 How to Use

### 1. First Time Setup

Firebase автоматически создаст документ `stats/global` при первой загрузке Admin Dashboard.

**Или вручную в Firebase Console**:
```
Collection: stats
Document ID: global
Fields:
  - visits: 0
  - uniqueVisitors: 0
  - lastUpdated: [timestamp]
```

### 2. Deploy

```bash
cd frontend
npm run build
# Use your deployment script
# See deploy*.local.ps1 files for actual deployment commands
```

### 3. Test

1. Откройте https://kontrollitud.ee/admin
2. Увидите 3 карточки с loading skeleton
3. Через 2-3 секунды загрузятся реальные данные из Firestore

## 📊 Auto Tracking

Визиты трекаются автоматически:
- **Total visits** - каждая загрузка страницы
- **Unique visitors** - один раз на браузер (localStorage)

## 📁 New Files

```
frontend/src/
  components/StatsGrid.jsx     - Компонент для отображения статистики
  utils/analytics.js           - Утилиты для трекинга визитов
```

## 🎨 Styling

Используется **Tailwind CSS**:
- Responsive grid (1 колонка mobile, 3 desktop)
- Hover effects (scale + shadow)
- Цветовая кодировка (blue/green/purple)

## 🔧 Technical Details

Full documentation: [ANALYTICS_IMPLEMENTATION.md](ANALYTICS_IMPLEMENTATION.md)
