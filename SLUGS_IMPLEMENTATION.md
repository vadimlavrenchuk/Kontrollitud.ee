# 🔗 Slugs Implementation - SEO-Friendly URLs

## 📋 Обзор

Система slugs превращает URL вида:
- ❌ `kontrollitud.ee/companies/abc123xyz`
- ✅ `kontrollitud.ee/companies/kalev-spa`

## ✅ Что реализовано:

### 1. Утилита slugify (frontend/src/utils/slugify.js)
- Транслитерация кириллицы (Калев СПА → kalev-spa)
- Поддержка эстонских символов (ä, ö, ü, õ)
- Генерация уникальных slugs при дубликатах

### 2. Обновленные маршруты
- `/companies/:slugOrId` - поддержка slug и ID
- `/company/:slugOrId` - альтернативный маршрут

### 3. CompanyDetails.jsx
- Поиск компании по slug или ID
- Fallback на ID если slug не найден
- Backwards compatibility с существующими ссылками

### 4. Улучшенные мета-теги
```html
<title>Kalev Spa — отзывы и информация | Kontrollitud.ee</title>
<meta property="og:title" content="Kalev Spa — отзывы и информация | Kontrollitud.ee" />
<meta property="og:description" content="Kalev Spa в Tallinn — проверенные отзывы и рейтинги на Kontrollitud.ee" />
```

## 🔄 Миграция существующих компаний

### Автоматическая миграция через backend:

Создайте файл `backend/migrations/addSlugs.js`:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

function slugify(text) {
  const cyrillicMap = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ы': 'y', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'ä': 'a', 'ö': 'o', 'ü': 'u', 'õ': 'o'
  };

  let slug = text.toLowerCase();
  slug = slug.split('').map(char => cyrillicMap[char] || char).join('');
  slug = slug
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

  return slug;
}

async function addSlugsToCompanies() {
  try {
    const companiesRef = db.collection('companies');
    const snapshot = await companiesRef.get();

    console.log(`Found ${snapshot.size} companies to process`);

    const slugs = new Set();
    const batch = db.batch();
    let batchCount = 0;

    for (const doc of snapshot.docs) {
      const company = doc.data();
      
      if (company.slug) {
        console.log(`✓ ${company.name} already has slug: ${company.slug}`);
        continue;
      }

      let slug = slugify(company.name);
      let uniqueSlug = slug;
      let counter = 1;

      // Ensure uniqueness
      while (slugs.has(uniqueSlug)) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }

      slugs.add(uniqueSlug);
      batch.update(doc.ref, { slug: uniqueSlug });
      batchCount++;

      console.log(`✓ ${company.name} → ${uniqueSlug}`);

      // Commit batch every 500 operations
      if (batchCount === 500) {
        await batch.commit();
        batchCount = 0;
      }
    }

    // Commit remaining
    if (batchCount > 0) {
      await batch.commit();
    }

    console.log('✅ Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

addSlugsToCompanies();
```

### Запуск миграции:

```bash
cd backend
node migrations/addSlugs.js
```

## 🎨 Использование в коде

### Генерация slug при создании компании:

```javascript
import { slugify } from './utils/slugify';

const newCompany = {
  name: "Kalev Spa",
  slug: slugify("Kalev Spa"), // → "kalev-spa"
  // ... other fields
};
```

### Ссылки на компанию:

```jsx
// Используйте slug если есть, иначе ID
<Link to={`/companies/${company.slug || company.id}`}>
  {company.name}
</Link>
```

### Проверка уникальности:

```javascript
import { generateUniqueSlug } from './utils/slugify';

const checkSlugExists = async (slug) => {
  const snapshot = await getDocs(
    query(collection(db, 'companies'), where('slug', '==', slug))
  );
  return !snapshot.empty;
};

const uniqueSlug = await generateUniqueSlug(
  slugify(companyName),
  checkSlugExists
);
```

## 🔍 Firestore Index

Добавьте индекс для поиска по slug:

```bash
firebase firestore:indexes
```

В `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "companies",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "slug",
          "order": "ASCENDING"
        }
      ]
    }
  ]
}
```

Деплой:

```bash
firebase deploy --only firestore:indexes
```

## 📱 Примеры URL

### До:
```
https://kontrollitud.ee/companies/tPZ9Qw7Y3mH1kL2rN4xS
```

### После:
```
https://kontrollitud.ee/companies/kalev-spa
https://kontrollitud.ee/companies/restoran-nord
https://kontrollitud.ee/companies/beauty-salon-2
```

## 🌐 SEO преимущества

1. **Читаемые URL** - пользователи видят что в ссылке
2. **Ключевые слова в URL** - улучшает SEO
3. **Социальные сети** - красивые превью ссылок
4. **Лучшая индексация** - поисковики предпочитают понятные URL

## 🔒 Backwards Compatibility

Старые ссылки с ID продолжают работать:
- `kontrollitud.ee/companies/abc123` ✅ работает
- `kontrollitud.ee/companies/kalev-spa` ✅ работает

## ✅ Готово!

Система slugs полностью внедрена и готова к использованию!
