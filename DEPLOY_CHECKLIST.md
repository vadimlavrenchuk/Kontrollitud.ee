# 🚀 Чеклист оптимизации перед деплоем

## ✅ Выполнено

### 1. Frontend оптимизации
- [x] CLS исправлен (aspect-ratio для изображений)
- [x] Code splitting (все страницы lazy loaded)
- [x] Tree shaking (Vite + Terser)
- [x] Минификация (terser с drop_console)
- [x] Sourcemaps отключены в production
- [x] Manual chunks (react, firebase, ui, i18n)
- [x] Skeleton loaders добавлены
- [x] Preconnect/DNS-prefetch настроены
- [x] Image width/height атрибуты
- [x] Loading="lazy" для изображений
- [x] Spinner для Suspense
- [x] OptimizedImage компонент (WebP/AVIF)
- [x] Cloudinary утилиты для оптимизации

### 2. Nginx оптимизации
- [x] Gzip сжатие включено
- [x] HTTP/2 активирован
- [x] Cache-Control headers настроены
- [x] Статика кэшируется 1 год

### 3. Build процесс
- [x] Dockerfile использует multi-stage build
- [x] npm ci --legacy-peer-deps в Docker
- [x] npm run build для production
- [x] Vite plugin imagemin настроен

---

## 📋 Перед деплоем проверьте:

### 0. Настройте оптимизацию изображений (опционально, рекомендуется)

**Вариант A: Firebase Extension (бесплатно)**
```bash
# Установите расширение для автоматической конвертации в WebP
firebase ext:install storage-resize-images

# При установке укажите:
# - Sizes: 200x200,400x225,1200x400
# - Format: webp
# - Cache-Control: max-age=31536000

# Деплой расширения
firebase deploy --only extensions
```

**Вариант B: Cloudinary (платно, мощнее)**
```bash
# 1. Зарегистрируйтесь на cloudinary.com
# 2. Создайте upload preset (Settings > Upload > Upload presets)
# 3. Добавьте переменные окружения:
echo "VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name" >> .env
echo "VITE_CLOUDINARY_UPLOAD_PRESET=your_preset" >> .env
```

📖 Подробная инструкция: [IMAGE_OPTIMIZATION_GUIDE.md](IMAGE_OPTIMIZATION_GUIDE.md)

### 1. Переменные окружения
```bash
# Убедитесь что .env настроен правильно
cat .env

# Должны быть:
VITE_API_URL=https://kontrollitud.ee/api
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
# и т.д.
```

### 2. Build локально
```bash
cd frontend
npm run build

# Проверьте размеры чанков:
ls -lh dist/assets/

# Ожидаемые размеры:
# react-vendor-*.js    ~120KB (gzipped ~40KB)
# firebase-vendor-*.js ~100KB (gzipped ~35KB)
# ui-vendor-*.js       ~40KB (gzipped ~15KB)
# index-*.js           ~60KB (gzipped ~20KB)
```

### 3. Preview локально
```bash
npm run preview
# Откройте http://localhost:4173
# Запустите DevTools > Lighthouse
# Проверьте Performance Score
```

### 4. Docker сборка Notes |
|---------|---------|--------|-------|
| Performance | 95+ | 85+ | С WebP: 90-95 |
| CLS | < 0.1 | < 0.1 | Aspect-ratio фикс |
| FCP | < 1.2s | < 1.8s | С WebP улучшение |
| LCP | < 1.5s | < 2.0s | WebP -1s ~ -1.5s |
| TBT | < 200ms | < 300ms | Code splittingtend

# Ожидаемый размер: ~50-80MB
```

### 5. Test на staging
```bash
# Запустите на staging сервере
docker-compose up -d

# Откройте в браузере
# Проверьте Network tab:
# - JS файлы приходят с gzip
# - Cache-Control headers правильные
# - HTTP/2 работает (protocols column)
```

---

## 🔍 Lighthouse Goals (Production)

| Метрика | Desktop | Mobile |
|---------|---------|--------|
| Performance | 95+ | 85+ |
| CLS | < 0.1 | < 0.1 |
| FCP | < 1.5s | < 2.0s |
| LCP | < 2.0s | < 2.5s |
| TBT | < 200ms | < 300ms |

---

## 🚨 Troubleshooting

### Проблема: Большой bundle size
```bash
# Анализ bundle
npm run build -- --mode analyze

# Или используйте rollup-plugin-visualizer
npm install -D rollup-plugin-visualizer
```

### Проблема: Медленная загрузка
```bash
# Проверьте CDN/Nginx кэширование
curl -I https://kontrollitud.ee/assets/index-*.js

# Должно быть:
# Cache-Control: public, immutable
# Content-Encoding: gzip
```

### Проблема: CLS всё еще высокий
```bash
# Проверьте что aspect-ratio применяется
# DevTools > Elements > .card-header
# Должен быть: aspect-ratio: 16/9

# Проверьте что изображения имеют width/height
# DevTools > Elements > img
```

---

## ✅ После деплоя

1. **Проверьте PageSpeed Insights:**
   - https://pagespeed.web.dev/
   - Введите: https://kontrollitud.ee

2. **Проверьте WebPageTest:**
   - https://www.webpagetest.org/
   - Test Location: Frankfurt, Germany
   - Browser: Chrome

3. **Мониторинг:**
   - Добавьте Google Analytics/Matomo
   - Настройте Web Vitals tracking
   - Мониторьте Core Web Vitals в Search Console

---

## 📈 Дальнейшие оптимизации (опционально)

### Priority Hints API
```jsx
<img src="hero.jpg" fetchpriority="high" />
<link rel="preload" href="font.woff2" fetchpriority="high" />
```

### Resource Hints
```html
<link rel="preconnect" href="https://firebasestorage.googleapis.com">
<link rel="dns-prefetch" href="https://fonts.gstatic.com">
```

### Service Worker (PWA уже есть)
```javascript
// Можно добавить более агрессивное кэширование
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('v1').then(cache => 
      cache.addAll([
        '/',
        '/assets/index.js',
        '/assets/index.css'
      ])
    )
  );
});
```

### CDN (опционально)
- Cloudflare (бесплатно, автоматический кэш)
- BunnyCDN (платно, быстрее)
- CloudFront (AWS, интеграция)

---

**Готово к деплою! 🎉**
