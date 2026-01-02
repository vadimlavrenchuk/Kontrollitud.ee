# Cloudinary Setup Guide

Cloudinary интегрирован для загрузки фото компаний (логотипы, фотографии заведений).

## Что реализовано

### 1. Форма добавления компании (AddBusiness.jsx)
- ✅ Поле `input type="file"` для загрузки изображений
- ✅ Валидация файлов (тип: image/*, размер: max 5MB)
- ✅ Preview загруженного изображения
- ✅ Альтернатива: вставка URL изображения вручную
- ✅ Функция `uploadToCloudinary()` - загружает файл на Cloudinary API
- ✅ Индикатор загрузки с уведомлениями (toast)

### 2. Отображение изображений
- ✅ **CompanyCard**: Показывает загруженное изображение или иконку категории как fallback
- ✅ **MapPopup**: Превью изображения в всплывающем окне карты (120px высота)
- ✅ Graceful degradation: если нет изображения, показывается градиент + иконка

### 3. Переводы
- ✅ Добавлены переводы на 3 языка (RU, ET, EN):
  - `upload_logo_or_photo` - "Загрузить логотип или фото"
  - `max_file_size_5mb` - "Максимальный размер файла: 5 МБ"
  - `image_too_large` - "Размер изображения слишком большой"
  - `please_select_image_file` - "Выберите файл изображения"
  - `image_upload_failed` - "Ошибка загрузки"
  - `or_paste_image_url` - "Или вставьте ссылку"

## Настройка Cloudinary

### Шаг 1: Создайте аккаунт
1. Перейдите на https://cloudinary.com/users/register_free
2. Зарегистрируйтесь (бесплатный план: 25 GB хранилища, 25 GB трафика/месяц)

### Шаг 2: Получите Cloud Name
1. После регистрации откройте Dashboard
2. Скопируйте **Cloud Name** (например: `dv5bmhhvo`)

### Шаг 3: Создайте Upload Preset
1. В Dashboard перейдите в **Settings** → **Upload**
2. Прокрутите до раздела **Upload presets**
3. Нажмите **Add upload preset**
4. Настройте preset:
   - **Preset name**: `kontrollitud_preset` (или любое имя)
   - **Signing Mode**: **Unsigned** (важно! иначе нужна аутентификация)
   - **Folder**: `kontrollitud/companies` (опционально, для организации)
   - **Transformation**: можно добавить автоматическое изменение размера (например, max width 1200px)
5. Сохраните preset

### Шаг 4: Обновите .env
Обновите файл `frontend/.env`:

```bash
# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=ваш_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=ваш_upload_preset
```

**Пример:**
```bash
VITE_CLOUDINARY_CLOUD_NAME=dv5bmhhvo
VITE_CLOUDINARY_UPLOAD_PRESET=kontrollitud_preset
```

### Шаг 5: Пересоберите контейнеры
```bash
docker compose up -d --build
```

## Как это работает

### Процесс загрузки:
1. Пользователь выбирает файл в форме AddBusiness (Шаг 4)
2. Файл валидируется (тип, размер)
3. Создается preview в браузере
4. При нажатии "Отправить":
   - Вызывается `uploadToCloudinary(file)`
   - Отправляется POST запрос на `https://api.cloudinary.com/v1_1/{cloud_name}/image/upload`
   - Cloudinary возвращает `secure_url` (HTTPS ссылка на изображение)
5. `secure_url` сохраняется в Firestore поле `image`
6. Изображение отображается в каталоге и на карте

### API запрос:
```javascript
const formData = new FormData();
formData.append('file', file);
formData.append('upload_preset', 'kontrollitud_preset');
formData.append('folder', 'kontrollitud/companies');

const response = await fetch(
    `https://api.cloudinary.com/v1_1/dv5bmhhvo/image/upload`,
    { method: 'POST', body: formData }
);

const data = await response.json();
const imageUrl = data.secure_url; // https://res.cloudinary.com/...
```

## Ограничения бесплатного плана

- **Хранилище**: 25 GB
- **Трафик**: 25 GB/месяц  
- **Transformations**: 25 credits/месяц
- **Изображения**: неограниченно

Для небольшого проекта этого достаточно. При росте можно перейти на платный план ($0.04/GB).

## Альтернативы

Если Cloudinary не подходит, можно использовать:
- **Firebase Storage** (встроено, 5GB бесплатно)
- **Imgur API** (бесплатно, но есть ограничения на коммерческое использование)
- **AWS S3** (платно, но дешево: ~$0.023/GB)

## Troubleshooting

### Ошибка: "Upload preset not found"
- Убедитесь, что preset создан в настройках Cloudinary
- Проверьте, что **Signing Mode = Unsigned**
- Имя preset должно точно совпадать с `VITE_CLOUDINARY_UPLOAD_PRESET`

### Ошибка: "Invalid cloud name"
- Проверьте правильность `VITE_CLOUDINARY_CLOUD_NAME`
- Cloud name можно найти в Dashboard (верхний левый угол)

### Изображение не отображается
- Проверьте консоль браузера на CORS ошибки
- Убедитесь, что URL начинается с `https://res.cloudinary.com/`
- Проверьте, что `secure_url` сохранен в Firestore (поле `image`)

### Превышен лимит
- Проверьте использование в Dashboard → Usage
- Оптимизируйте изображения перед загрузкой (compress, resize)
- Настройте автоматическую оптимизацию в Upload Preset

## Безопасность

✅ **Unsigned uploads безопасны**, если:
- Установлены rate limits (Settings → Security → Upload rate limit)
- Настроены allowed formats (только image/jpeg, image/png, image/gif)
- Включен spam detection (автоматически в Cloudinary)

❌ **Не используйте API Secret в frontend!**  
API Secret должен использоваться только на сервере для подписанных запросов.

## Дополнительные возможности

После базовой настройки можно добавить:
- **Автоматическое изменение размера**: `w_1200,h_800,c_limit`
- **Оптимизацию качества**: `q_auto,f_auto`
- **Watermark**: наложение логотипа на изображения
- **Lazy loading**: загрузка изображений по мере прокрутки
- **Responsive images**: разные размеры для мобильных/десктопов

Пример URL с трансформацией:
```
https://res.cloudinary.com/dv5bmhhvo/image/upload/w_1200,h_800,c_limit,q_auto,f_auto/kontrollitud/companies/image.jpg
```

## Документация

- Cloudinary Upload API: https://cloudinary.com/documentation/upload_images
- Transformation Reference: https://cloudinary.com/documentation/transformation_reference
- React Integration: https://cloudinary.com/documentation/react_integration
