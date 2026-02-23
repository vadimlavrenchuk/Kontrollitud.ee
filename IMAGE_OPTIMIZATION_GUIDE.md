# 🖼️ Оптимизация изображений - Next-gen форматы (WebP/AVIF)

## ✅ Что реализовано

### 1. OptimizedImage компонент
Профессиональный React компонент для автоматической оптимизации изображений:

**Возможности:**
- ✅ Автоматическая генерация `<picture>` с WebP/AVIF
- ✅ Responsive srcset для разных разрешений
- ✅ Lazy loading с Intersection Observer
- ✅ Shimmer placeholder для предотвращения CLS
- ✅ Поддержка Cloudinary CDN
- ✅ Поддержка Firebase Storage
- ✅ Fallback на оригинальный формат для старых браузеров

**Использование:**
```jsx
import OptimizedImage from './components/OptimizedImage';

// Простое использование
<OptimizedImage
  src="https://firebasestorage.../image.jpg"
  alt="Company logo"
  width={400}
  height={300}
  loading="lazy"
  sizes="(max-width: 768px) 100vw, 400px"
/>

// С Cloudinary
<OptimizedImage
  src="https://res.cloudinary.com/.../image.jpg"
  alt="Hero image"
  width={1200}
  height={400}
  cloudinary={true}
  cloudinaryParams="f_auto,q_auto"
/>
```

**Файлы:**
- `frontend/src/components/OptimizedImage.jsx`
- `frontend/src/components/OptimizedImage.css`

---

### 2. Cloudinary утилиты
Набор helper функций для работы с Cloudinary CDN:

```javascript
import { 
  getCloudinaryUrl, 
  getOptimizedUrl, 
  CLOUDINARY_PRESETS 
} from './utils/cloudinary';

// Оптимизация любого URL
const url = getCloudinaryUrl(imageUrl, {
  width: 800,
  format: 'webp',
  quality: 'auto',
});

// Использование пресетов
const thumbUrl = getOptimizedUrl(company.image, 'companyThumb');
const heroUrl = getOptimizedUrl(company.image, 'companyHero');
```

**Доступные пресеты:**
- `companyThumb` - 200x200px, квадрат, WebP
- `companyCard` - 400x225px, WebP
- `companyHero` - 1200x400px, WebP
- `logo` - 200px width, PNG с прозрачностью

**Файлы:**
- `frontend/src/utils/cloudinary.js`

---

## 🎯 Два варианта настройки

### Вариант 1: Firebase Extension "Resize Images" (Рекомендуется)

**Преимущества:**
- ✅ Бесплатно (Free tier Firebase)
- ✅ Автоматическая генерация при загрузке
- ✅ Не требует дополнительных сервисов
- ✅ Интеграция с Firebase Storage

**Установка:**

#### Шаг 1: Установите расширение
```bash
# Войдите в Firebase CLI
firebase login

# Перейдите в проект
cd /path/to/your/project

# Установите расширение
firebase ext:install storage-resize-images --project kontrollitud-ee
```

#### Шаг 2: Настройте параметры
При установке укажите:

```
Cloud Storage bucket: kontrollitud-ee.appspot.com
Sizes of resized images: 200x200,400x225,800x600,1200x400
Delete original image: No
Image type: webp
Cache-Control header: max-age=31536000
```

#### Шаг 3: Обновите код загрузки
```javascript
// frontend/src/AddBusiness.jsx или EditCompany.jsx

import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const handleImageUpload = async (file) => {
  const storageRef = ref(storage, `companies/${Date.now()}_${file.name}`);
  
  // Загружаем оригинал
  await uploadBytes(storageRef, file);
  
  // Получаем URL оригинала
  const originalUrl = await getDownloadURL(storageRef);
  
  // Firebase Extension автоматически создаст:
  // - companies/IMAGE_200x200.webp
  // - companies/IMAGE_400x225.webp
  // - companies/IMAGE_800x600.webp
  // - companies/IMAGE_1200x400.webp
  
  return originalUrl;
};
```

#### Шаг 4: Обновите OptimizedImage
```jsx
// frontend/src/components/OptimizedImage.jsx

const getFirebaseWebPUrl = (url, width, height) => {
  if (!url.includes('firebasestorage.googleapis.com')) return null;
  
  // Парсим URL
  const urlObj = new URL(url);
  const path = urlObj.pathname;
  
  // companies/IMAGE.jpg -> companies/IMAGE_400x225.webp
  const lastDot = path.lastIndexOf('.');
  const base = path.substring(0, lastDot);
  
  return `${urlObj.origin}${base}_${width}x${height}.webp${urlObj.search}`;
};
```

---

### Вариант 2: Cloudinary CDN (Платная, но мощнее)

**Преимущества:**
- ✅ AVIF форматы (еще меньше размер)
- ✅ Продвинутые трансформации
- ✅ CDN с edge-серверами по всему миру
- ✅ AI-трансформации (умная обрезка, улучшение качества)

**Недостатки:**
- ❌ Платно после 25GB/месяц
- ❌ Требует миграции с Firebase Storage

#### Шаг 1: Регистрация в Cloudinary
```bash
# Зарегистрируйтесь на https://cloudinary.com/
# Free tier: 25GB bandwidth, 25GB storage
```

#### Шаг 2: Настройте переменные окружения
```bash
# frontend/.env
VITE_CLOUDINARY_CLOUD_NAME=kontrollitud
VITE_CLOUDINARY_UPLOAD_PRESET=kontrollitud_preset
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_API_SECRET=your_api_secret
```

#### Шаг 3: Создайте Upload Preset
```
1. Откройте Cloudinary Dashboard
2. Settings > Upload > Upload presets
3. Add upload preset
   - Preset name: kontrollitud_preset
   - Signing mode: Unsigned
   - Folder: companies
   - Format: Auto
   - Quality: Auto
   - Responsive breakpoints: 400, 800, 1200
```

#### Шаг 4: Обновите код загрузки
```javascript
// frontend/src/AddBusiness.jsx

import { uploadToCloudinary } from './utils/cloudinary';

const handleImageUpload = async (file) => {
  const result = await uploadToCloudinary(file, {
    folder: 'companies',
    tags: ['company-logo'],
  });
  
  if (result.success) {
    // Cloudinary URL автоматически поддерживает f_auto (WebP/AVIF)
    return result.url;
  }
};
```

#### Шаг 5: Backend endpoint для удаления
```javascript
// backend/routes/cloudinary.js

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post('/api/cloudinary/delete', async (req, res) => {
  const { publicId } = req.body;
  
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

## 📊 Сравнение форматов

| Формат | Размер | Поддержка | Качество |
|--------|--------|-----------|----------|
| JPEG | 100KB ⭐⭐ | 100% | Хорошее |
| PNG | 150KB ⭐ | 100% | Отличное |
| WebP | 70KB ⭐⭐⭐ | 97%+ | Отличное |
| AVIF | 50KB ⭐⭐⭐⭐ | 85%+ | Отличное |

**Рекомендация:** WebP (лучший баланс размера и поддержки)

---

## 🚀 Обновленные компоненты

### CompanyCard ✅
```jsx
<OptimizedImage
  src={company.image}
  alt={company.name}
  width={400}
  height={225}
  loading="lazy"
  sizes="(max-width: 768px) 100vw, 400px"
/>
```

### CompanyDetails ✅
```jsx
<OptimizedImage
  src={company.image}
  alt={company.name}
  width={1200}
  height={400}
  loading="eager"
  sizes="100vw"
/>
```

---

## 📈 Ожидаемые улучшения

### До оптимизации:
```
Изображение: 500KB JPEG
Загрузка на 3G: ~2.5s
LCP: 2.8s
```

### После оптимизации (WebP):
```
Изображение: 150KB WebP (-70%)
Загрузка на 3G: ~0.8s
LCP: 1.2s ✅
```

### С Cloudinary + AVIF:
```
Изображение: 100KB AVIF (-80%)
Загрузка на 3G: ~0.5s
LCP: 0.9s 🚀
```

---

## ✅ Lighthouse улучшения

**До:**
- ⚠️ "Serve images in next-gen formats"
- ⚠️ "Properly size images"
- ⚠️ "Efficiently encode images"

**После:**
- ✅ All images served in WebP
- ✅ Responsive srcset configured
- ✅ Optimal image dimensions

**Expected Score:**
- Performance: +15-20 points
- Best Practices: +10 points
- LCP improvement: -1.0s ~ -1.5s

---

## 🔧 Быстрый старт (Firebase Extension)

```bash
# 1. Установите расширение
firebase ext:install storage-resize-images

# 2. Выберите параметры:
# Sizes: 200x200,400x225,1200x400
# Format: webp
# Cache: max-age=31536000

# 3. Деплой
firebase deploy --only extensions

# 4. Готово! Все новые загрузки автоматически конвертируются
```

---

## 🎓 Полезные ссылки

- [Firebase Resize Images Extension](https://firebase.google.com/products/extensions/storage-resize-images)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [WebP Format Guidelines](https://developers.google.com/speed/webp)
- [AVIF Support Matrix](https://caniuse.com/avif)

---

**Рекомендация:** Начните с Firebase Extension (бесплатно), позже переходите на Cloudinary при росте трафика.
