# Инструкция по обновлению nginx.conf на сервере

## Что было сделано

1. ✅ Обновлен [frontend/nginx.conf](frontend/nginx.conf) с поддержкой HTTPS
2. ✅ Созданы самоподписанные SSL сертификаты для локальной разработки в папке `ssl/`
3. ✅ Обновлен [docker-compose.yml](docker-compose.yml) - добавлены порт 443 и volume для SSL

## Локальная разработка

### Запуск с HTTPS

```bash
# Остановить текущие контейнеры
docker-compose down

# Пересобрать и запустить с новой конфигурацией
docker-compose up --build
```

Теперь сайт доступен:
- **HTTP**: http://localhost:3000 (автоматически перенаправит на HTTPS)
- **HTTPS**: https://localhost:3443

⚠️ **Важно**: При первом открытии браузер покажет предупреждение о самоподписанном сертификате. Это нормально для локальной разработки. Нажмите "Дополнительно" → "Продолжить на localhost".

## Обновление на production сервере

### Вариант 1: Использование существующих Let's Encrypt сертификатов

Если у вас уже настроены сертификаты Let's Encrypt на сервере:

```bash
# 1. Подключитесь к серверу
ssh root@YOUR_SERVER_IP

# 2. Перейдите в директорию проекта
cd /root/Kontrollitud.ee

# 3. Скопируйте обновленный nginx.conf
# (Предварительно загрузите файл на сервер через git pull или scp)
git pull

# 4. Обновите docker-compose.yml для production
# Замените volume для ssl на путь к реальным сертификатам Let's Encrypt
```

Отредактируйте `docker-compose.yml` на сервере:

```yaml
frontend:
  ports:
    - "80:80"
    - "443:443"
  volumes:
    # Для production используем Let's Encrypt сертификаты
    - /etc/letsencrypt/live/kontrollitud.ee:/etc/nginx/ssl:ro
```

```bash
# 5. Перезапустите контейнеры
docker-compose down
docker-compose up -d --build
```

### Вариант 2: Если Let's Encrypt еще не настроен

Если сертификаты Let's Encrypt еще не установлены:

```bash
# 1. Установите certbot
sudo apt-get update
sudo apt-get install certbot

# 2. Остановите контейнеры (certbot требует порт 80)
cd /root/Kontrollitud.ee
docker-compose down

# 3. Получите сертификат
sudo certbot certonly --standalone \
  -d kontrollitud.ee \
  -d www.kontrollitud.ee \
  --email your-email@example.com \
  --agree-tos

# 4. Обновите docker-compose.yml (см. выше)

# 5. Запустите контейнеры
docker-compose up -d --build
```

### Автоматическое обновление сертификатов

Настройте автообновление сертификатов Let's Encrypt:

```bash
# Добавьте в crontab
sudo crontab -e

# Добавьте эту строку (обновление каждый день в 3 утра)
0 3 * * * certbot renew --quiet --deploy-hook "cd /root/Kontrollitud.ee && docker-compose restart frontend"
```

## Проверка после обновления

### 1. Проверка конфигурации nginx

```bash
# Внутри контейнера
docker-compose exec frontend nginx -t

# Должно вывести:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 2. Проверка доступности сайта

```bash
# Проверка HTTP (должно перенаправить на HTTPS)
curl -I http://kontrollitud.ee

# Должно вернуть:
# HTTP/1.1 301 Moved Permanently
# Location: https://kontrollitud.ee/

# Проверка HTTPS
curl -I https://kontrollitud.ee

# Должно вернуть:
# HTTP/2 200 
```

### 3. Проверка SSL сертификата

```bash
# Проверка срока действия сертификата
echo | openssl s_client -servername kontrollitud.ee -connect kontrollitud.ee:443 2>/dev/null | openssl x509 -noout -dates
```

### 4. Проверка заголовков безопасности

```bash
curl -I https://kontrollitud.ee

# Должны присутствовать заголовки:
# X-Frame-Options: SAMEORIGIN
# X-Content-Type-Options: nosniff
# X-XSS-Protection: 1; mode=block
# Referrer-Policy: strict-origin-when-cross-origin
```

## Откат в случае проблем

Если что-то пошло не так, быстро откатитесь к старой версии:

```bash
# 1. Откатите файл nginx.conf
git checkout HEAD~1 frontend/nginx.conf

# 2. Перезапустите контейнеры
docker-compose down
docker-compose up -d --build
```

## Различия между локальной и production конфигурацией

| Параметр | Локально | Production |
|----------|----------|------------|
| Порты | 3000:80, 3443:443 | 80:80, 443:443 |
| SSL сертификаты | `./ssl` (самоподписанные) | `/etc/letsencrypt/live/kontrollitud.ee` (Let's Encrypt) |
| Домен | localhost | kontrollitud.ee |

## Логи для диагностики

```bash
# Логи frontend контейнера
docker-compose logs frontend

# Логи nginx внутри контейнера
docker-compose exec frontend cat /var/log/nginx/error.log
docker-compose exec frontend cat /var/log/nginx/access.log

# Следить за логами в реальном времени
docker-compose logs -f frontend
```

## Полезные команды

```bash
# Проверить открытые порты
sudo netstat -tlnp | grep :443

# Проверить статус контейнеров
docker-compose ps

# Перезапустить только frontend
docker-compose restart frontend

# Пересобрать и запустить без кеша
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

## Контрольный список для production

- [ ] Сертификаты Let's Encrypt установлены и действительны
- [ ] Порты 80 и 443 открыты в файрволе
- [ ] docker-compose.yml обновлен с правильными путями к сертификатам
- [ ] nginx.conf скопирован и синтаксис проверен
- [ ] Контейнеры перезапущены с новой конфигурацией
- [ ] HTTP перенаправляет на HTTPS
- [ ] HTTPS работает без ошибок
- [ ] Security headers присутствуют в ответах
- [ ] Настроено автообновление сертификатов (cron)
- [ ] API запросы работают через HTTPS
- [ ] Мониторинг настроен для отслеживания срока действия сертификатов

## Ссылки

- 📄 [LOCAL_HTTPS_SETUP.md](LOCAL_HTTPS_SETUP.md) - Подробная инструкция по настройке HTTPS локально
- 🔒 [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- 📘 [Nginx SSL Configuration](https://nginx.org/en/docs/http/configuring_https_servers.html)
