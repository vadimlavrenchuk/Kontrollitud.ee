# 🔐 Nginx Proxy Manager Setup Guide

## 📋 Пошаговая инструкция

### 1️⃣ Подключение к серверу

```bash
ssh root@YOUR_SERVER_IP
# или
ssh username@YOUR_SERVER_IP
```

### 2️⃣ Создание папки для Nginx Proxy Manager

```bash
mkdir -p ~/proxy
cd ~/proxy
```

### 3️⃣ Создание docker-compose.yml

```bash
nano docker-compose.yml
```

Вставьте следующую конфигурацию:

```yaml
version: '3.8'

services:
  app:
    image: 'jc21/nginx-proxy-manager:latest'
    restart: unless-stopped
    ports:
      - '80:80'      # HTTP
      - '81:81'      # Admin Panel
      - '443:443'    # HTTPS
    volumes:
      - ./data:/data
      - ./letsencrypt:/etc/letsencrypt
    environment:
      DISABLE_IPV6: 'true'
```

**Сохранение:**
- Нажмите `Ctrl + O` (сохранить)
- Нажмите `Enter` (подтвердить имя файла)
- Нажмите `Ctrl + X` (выйти)

### 4️⃣ Запуск Nginx Proxy Manager

```bash
docker-compose up -d
```

### 5️⃣ Проверка статуса

```bash
docker-compose ps
docker-compose logs -f app
```

---

## 🔑 Первый вход в админ панель

1. Откройте в браузере: `http://YOUR_SERVER_IP:81`
2. Войдите с учетными данными по умолчанию:
   - **Email**: `admin@example.com`
   - **Password**: `changeme`
3. ⚠️ **ОБЯЗАТЕЛЬНО** смените email и пароль сразу после входа!

---

## 🌐 Настройка домена kontrollitud.ee

### Шаг 1: Добавить Proxy Host

1. В админ панели выберите **Proxy Hosts**
2. Нажмите **Add Proxy Host**

### Шаг 2: Настройка для Frontend

**Details:**
- **Domain Names**: `kontrollitud.ee`, `www.kontrollitud.ee`
- **Scheme**: `http`
- **Forward Hostname / IP**: `host.docker.internal` или IP сервера
- **Forward Port**: `3000`
- ✅ **Block Common Exploits**
- ✅ **Websockets Support**

**SSL:**
- ✅ **SSL Certificate**: Request a new SSL Certificate
- ✅ **Force SSL**
- ✅ **HTTP/2 Support**
- **Email**: ваш email для Let's Encrypt
- ✅ **I Agree to the Let's Encrypt Terms of Service**

### Шаг 3: Настройка для API Backend (опционально)

Если нужен отдельный поддомен для API:

**Details:**
- **Domain Names**: `api.kontrollitud.ee`
- **Scheme**: `http`
- **Forward Hostname / IP**: `host.docker.internal` или IP сервера
- **Forward Port**: `5000`
- ✅ **Block Common Exploits**

**SSL:**
- ✅ Request SSL Certificate для api.kontrollitud.ee

---

## 🔧 Настройка Docker для Kontrollitud.ee

### Обновление docker-compose.yml вашего проекта

После установки Nginx Proxy Manager нужно обновить конфигурацию:

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"  # Оставляем внутренний порт, Nginx будет проксировать
    environment:
      - NODE_ENV=production
    depends_on:
      - backend
    networks:
      - kontrollitud-network
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"  # Внутренний порт
    environment:
      - NODE_ENV=production
      - PORT=5000
      - MONGODB_URI=${MONGODB_URI}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD}
      # ... остальные переменные
    depends_on:
      - mongodb
    networks:
      - kontrollitud-network
    restart: unless-stopped

  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_ROOT_USERNAME}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
    volumes:
      - mongodb_data:/data/db
    networks:
      - kontrollitud-network
    restart: unless-stopped

networks:
  kontrollitud-network:
    driver: bridge

volumes:
  mongodb_data:
```

---

## 📊 DNS Настройки

В вашем регистраторе доменов (где купили kontrollitud.ee) добавьте:

### A Records:
```
@ (root)  →  YOUR_SERVER_IP
www       →  YOUR_SERVER_IP
```

### Опционально (для API):
```
api       →  YOUR_SERVER_IP
```

**Время распространения DNS:** от 5 минут до 48 часов (обычно 1-2 часа).

---

## ✅ Проверка работы

После настройки DNS и Nginx Proxy Manager:

1. **Проверка HTTP → HTTPS редиректа:**
   ```bash
   curl -I http://kontrollitud.ee
   # Должен вернуть 301 или 302 редирект на https://
   ```

2. **Проверка SSL сертификата:**
   ```bash
   curl -I https://kontrollitud.ee
   # Должен вернуть 200 OK
   ```

3. **Откройте в браузере:**
   - https://kontrollitud.ee - должен быть зеленый замочек 🔒
   - https://www.kontrollitud.ee - также должен работать

---

## 🔥 Firewall настройки (если используется UFW)

```bash
# Разрешить HTTP и HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 81/tcp  # Админ панель (можно закрыть после настройки)

# Проверить статус
sudo ufw status
```

---

## 🚨 Troubleshooting

### Проблема: "502 Bad Gateway"
**Решение:** Проверьте, что контейнеры запущены:
```bash
docker ps
# Убедитесь, что frontend и backend работают
```

### Проблема: SSL сертификат не выдается
**Решение:**
1. Убедитесь, что порт 80 открыт (Let's Encrypt проверяет по HTTP)
2. DNS должен указывать на ваш сервер
3. Подождите 5-10 минут после изменения DNS

### Проблема: Админ панель недоступна на порту 81
**Решение:**
```bash
cd ~/proxy
docker-compose logs -f app
# Проверьте логи на ошибки
```

---

## 📝 Полезные команды

```bash
# Перезапуск Nginx Proxy Manager
cd ~/proxy
docker-compose restart

# Просмотр логов
docker-compose logs -f app

# Остановка
docker-compose down

# Полная переустановка (удалит данные!)
docker-compose down -v
rm -rf data letsencrypt
docker-compose up -d
```

---

## 🎯 Итоговый чеклист

- [ ] Nginx Proxy Manager установлен и запущен
- [ ] Админ панель доступна на порту 81
- [ ] Пароль изменен с дефолтного
- [ ] DNS настроен (A record → IP сервера)
- [ ] Proxy Host создан для kontrollitud.ee
- [ ] SSL сертификат получен от Let's Encrypt
- [ ] Force SSL включен
- [ ] Сайт открывается через https://kontrollitud.ee с зеленым замочком 🔒

---

**После выполнения всех шагов ваш сайт будет доступен по адресу:**
- ✅ https://kontrollitud.ee
- ✅ https://www.kontrollitud.ee

**Без указания портов и с защищенным соединением!** 🎉
