# Исправление CLS (Cumulative Layout Shift)

## Проблема
CLS составлял 0.27-0.44, что критично для Core Web Vitals. Футер "прыгал" вниз при загрузке CSS, потому что:

1. HTML парсится быстрее, чем загружается CSS
2. React рендерит пустой `#root` до загрузки JS
3. Футер отображается вверху, потом смещается вниз = плохой CLS

## Решение

### 1. CSS Grid Layout для Sticky Footer

Вместо Flexbox используется CSS Grid с фиксированной структурой:

```css
body {
  display: grid;
  grid-template-rows: auto 1fr auto; /* Navbar, Content (тянется), Footer */
  min-height: 100vh;
}
```

**Преимущества:**
- Футер **всегда** внизу, даже если контент пустой
- Центральная область (`1fr`) автоматически растягивается
- Системное решение без привязки к конкретным пикселям

### 2. Critical CSS (Критический путь)

Создан отдельный файл `/src/critical.css`, который:
- Загружается **первым** в `index.html`
- Содержит только базовую раскладку (Grid, размеры)
- Не содержит декоративных стилей (цвета, тени, анимации)

**Содержимое Critical CSS:**
- Сброс отступов (`box-sizing`, `margin`, `padding`)
- Grid layout для `body`
- Минимальные размеры для navbar и footer
- `display: contents` для `#root` (делает его "прозрачным" для Grid)

### 3. Разделение ответственности

**critical.css (загружается первым):**
- Раскладка страницы (Grid)
- Минимальные размеры (`min-height`)
- Структура без деталей

**App.css (загружается после):**
- Декоративные стили
- Цвета, тени, градиенты
- Анимации и переходы
- Адаптивная верстка

## Изменения в файлах

### `frontend/index.html`
```html
<!-- КРИТИЧНО: Critical CSS загружается первым -->
<link rel="stylesheet" href="/src/critical.css" />
```

### `frontend/src/critical.css` (новый файл)
- CSS Grid для body
- Фиксированные минимальные размеры
- Без декоративных стилей

### `frontend/src/App.css`
- Удалены правила раскладки (перенесены в critical.css)
- Оставлены только декоративные стили

### `frontend/vite.config.js`
```javascript
build: {
  cssCodeSplit: true,
  rollupOptions: {
    output: {
      manualChunks: {
        'critical': ['./src/critical.css']
      }
    }
  }
}
```

## Ожидаемый результат

- **CLS < 0.1** (хорошо для Core Web Vitals)
- Футер не "прыгает" при загрузке
- Мгновенное отображение правильной раскладки
- Нет техдолга (без инлайновых стилей)

## Тестирование

1. **Chrome DevTools > Lighthouse:**
   - Запустите аудит производительности
   - Проверьте CLS в разделе "Metrics"
   - Должен быть < 0.1 (зеленая зона)

2. **Chrome DevTools > Performance:**
   - Запишите загрузку страницы
   - Проверьте слой "Experience" на отсутствие Layout Shifts

3. **WebPageTest.org:**
   - Проверьте CLS на реальном сервере
   - Сравните "before" и "after"

## Рекомендации

1. **Минифицировать critical.css** в production:
   ```bash
   npm install --save-dev cssnano
   ```

2. **Встроить critical.css inline** (опционально):
   - Для максимальной скорости можно встроить critical.css прямо в `<head>`
   - Но текущее решение уже достаточно эффективно

3. **Добавить `font-display: swap`** для веб-шрифтов:
   ```css
   @font-face {
     font-display: swap;
   }
   ```

## Дополнительные оптимизации

- ✅ Preload для hero background (`index.html`)
- ✅ Фиксированные размеры для логотипа (предотвращает CLS navbar)
- ✅ `min-width` для `navbar-right` (предотвращает дерганье при загрузке)
- ✅ CSS Grid вместо Flexbox (более предсказуемая раскладка)
- ✅ `display: contents` для `#root` (устраняет лишний слой)

## Дальнейшие улучшения

1. **Resource Hints:**
   ```html
   <link rel="preconnect" href="https://cdnjs.cloudflare.com">
   <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com">
   ```

2. **Lazy loading для images:**
   ```html
   <img loading="lazy" ... />
   ```

3. **Compression:**
   - Gzip/Brotli для CSS/JS
   - WebP для изображений

## Мониторинг

После деплоя проверьте:
- Google Search Console > Core Web Vitals
- Real User Monitoring (RUM)
- PageSpeed Insights

Цель: **CLS < 0.1** для 75% визитов.
