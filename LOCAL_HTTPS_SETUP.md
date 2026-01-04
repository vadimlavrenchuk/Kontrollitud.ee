# Настройка HTTPS для локальной разработки

## Обзор
Файл `nginx.conf` настроен для работы с HTTPS как на продакшене, так и локально. Для локальной разработки нужно создать самоподписанные SSL сертификаты.

## Быстрая настройка для локальной разработки

### 1. Создайте самоподписанные сертификаты

В корне проекта выполните:

```bash
mkdir -p ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem \
  -out ssl/cert.pem \
  -subj "/C=EE/ST=Harjumaa/L=Tallinn/O=Kontrollitud/CN=localhost"
```

### 2. Обновите docker-compose.yml

Добавьте volume для SSL сертификатов в секцию frontend:

```yaml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile
    args:
      - VITE_FIREBASE_API_KEY=${VITE_FIREBASE_API_KEY}
      - VITE_FIREBASE_AUTH_DOMAIN=${VITE_FIREBASE_AUTH_DOMAIN}
      - VITE_FIREBASE_PROJECT_ID=${VITE_FIREBASE_PROJECT_ID}
      - VITE_FIREBASE_STORAGE_BUCKET=${VITE_FIREBASE_STORAGE_BUCKET}
      - VITE_FIREBASE_MESSAGING_SENDER_ID=${VITE_FIREBASE_MESSAGING_SENDER_ID}
      - VITE_FIREBASE_APP_ID=${VITE_FIREBASE_APP_ID}
      - VITE_FIREBASE_MEASUREMENT_ID=${VITE_FIREBASE_MEASUREMENT_ID}
  ports:
    - "80:80"
    - "443:443"  # Добавьте этот порт для HTTPS
  volumes:
    - ./ssl:/etc/nginx/ssl  # Монтируем локальные сертификаты
  depends_on:
    - backend
```

### 3. Перезапустите контейнеры

```bash
docker-compose down
docker-compose up --build
```

### 4. Откройте сайт

- HTTP: http://localhost (автоматически перенаправит на HTTPS)
- HTTPS: https://localhost

**Примечание:** Браузер покажет предупреждение о самоподписанном сертификате - это нормально для локальной разработки. Нажмите "Продолжить" или "Advanced → Proceed to localhost".

## Настройка для продакшн сервера

На сервере используйте Let's Encrypt сертификаты:

### 1. Установите certbot

```bash
sudo apt-get update
sudo apt-get install certbot
```

### 2. Получите сертификат

```bash
sudo certbot certonly --standalone -d kontrollitud.ee -d www.kontrollitud.ee
```

### 3. Обновите docker-compose.yml на сервере

```yaml
frontend:
  volumes:
    - /etc/letsencrypt/live/kontrollitud.ee:/etc/nginx/ssl:ro
```

### 4. Автоматическое обновление сертификатов

Добавьте в crontab:

```bash
0 3 * * * certbot renew --quiet && docker-compose restart frontend
```

## Отключение HTTPS для локальной разработки (опционально)

Если вы хотите работать без HTTPS локально, можно создать отдельный `nginx.local.conf`:

```nginx
# Простая конфигурация без HTTPS для локальной разработки
upstream backend {
    server backend:5000;
}

server {
    listen 80;
    server_name localhost;
    
    # ... остальная конфигурация без SSL
}
```

И изменить Dockerfile:

```dockerfile
# Используем локальную конфигурацию вместо production
COPY nginx.local.conf /etc/nginx/conf.d/default.conf
```

## Проверка конфигурации

Проверьте синтаксис nginx после изменений:

```bash
docker-compose exec frontend nginx -t
```

## Решение проблем

### Ошибка "SSL certificate not found"

Убедитесь, что сертификаты созданы и правильно смонтированы:

```bash
# Проверьте наличие файлов
ls -la ssl/

# Проверьте внутри контейнера
docker-compose exec frontend ls -la /etc/nginx/ssl/
```

### Браузер не доверяет сертификату

Это нормально для самоподписанных сертификатов. Для избавления от предупреждений можно добавить сертификат в доверенные в настройках браузера.

### Порт 443 уже занят

Проверьте, что используется:

```bash
# Windows
netstat -ano | findstr :443

# Linux/Mac
sudo lsof -i :443
```

Остановите процесс или измените порт в docker-compose.yml:

```yaml
ports:
  - "8443:443"  # Используйте другой порт локально
```

## Текущая конфигурация

Файл `frontend/nginx.conf` настроен с:
- ✅ Автоматическим перенаправлением HTTP → HTTPS
- ✅ Поддержкой Let's Encrypt валидации
- ✅ Современными SSL протоколами (TLS 1.2, 1.3)
- ✅ Security headers
- ✅ Proxy для API запросов
- ✅ Кешированием статики
- ✅ Поддержкой React Router (SPA)

Эта конфигурация будет работать как локально (с самоподписанными сертификатами), так и на продакшене (с Let's Encrypt).
