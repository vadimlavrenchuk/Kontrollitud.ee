# 🎯 Настройка Nginx Proxy Manager на сервере 65.109.166.160

## 📋 Информация о сервере
- **IP**: 65.109.166.160
- **Провайдер**: Hetzner Cloud (Германия)
- **Админ панель**: http://65.109.166.160:81
- **Ваш сайт после настройки**: https://kontrollitud.ee

---

## 🚀 БЫСТРАЯ УСТАНОВКА (Вариант 1)

### Шаг 1: Подключитесь к серверу
В терминале VS Code (вкладка SSH):
```bash
ssh root@65.109.166.160
```

### Шаг 2: Скопируйте и выполните ВСЕ команды разом:
```bash
# Проверка/установка Docker
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh
    apt install docker-compose -y
fi

# Создание папки и конфигурации
mkdir -p ~/proxy && cd ~/proxy

cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  app:
    image: 'jc21/nginx-proxy-manager:latest'
    restart: unless-stopped
    ports:
      - '80:80'
      - '81:81'
      - '443:443'
    volumes:
      - ./data:/data
      - ./letsencrypt:/etc/letsencrypt
    environment:
      DISABLE_IPV6: 'true'
EOF

# Запуск
docker-compose up -d

# Проверка
sleep 10
docker-compose ps
```

### Шаг 3: Откройте админ панель
Перейдите в браузере: **http://65.109.166.160:81**

Логин:
- Email: `admin@example.com`
- Password: `changeme`

**⚠️ Сразу измените email и пароль!**

---

## 🌐 НАСТРОЙКА ДОМЕНА kontrollitud.ee

### Шаг 1: DNS настройки
В панели вашего регистратора доменов добавьте:

```
Тип    Имя    Значение
A      @      65.109.166.160
A      www    65.109.166.160
```

### Шаг 2: Добавление Proxy Host
1. В админ панели → **Proxy Hosts** → **Add Proxy Host**

**Details Tab:**
```
Domain Names: kontrollitud.ee, www.kontrollitud.ee
Scheme: http
Forward Hostname/IP: 172.17.0.1
Forward Port: 3000
☑ Block Common Exploits
☑ Websockets Support
```

**SSL Tab:**
```
☑ Request a new SSL Certificate
☑ Force SSL
☑ HTTP/2 Support
Email: ваш email
☑ I Agree to the Let's Encrypt Terms
```

3. Нажмите **Save**

---

## 📦 ЗАГРУЗКА ВАШЕГО ПРОЕКТА НА СЕРВЕР

### Вариант 1: Через Git (рекомендуется)
```bash
cd ~
git clone https://github.com/YOUR_USERNAME/Kontrollitud.ee.git
cd Kontrollitud.ee

# Создайте .env файл
nano .env
# Вставьте содержимое, сохраните (Ctrl+O, Enter, Ctrl+X)

# Запустите проект
docker-compose up -d
```

### Вариант 2: Загрузка файлов через SCP
На вашем компьютере (PowerShell):
```powershell
scp -r C:\Users\vadim\Kontrollitud.ee root@65.109.166.160:~/
```

Затем на сервере:
```bash
cd ~/Kontrollitud.ee
docker-compose up -d
```

---

## ✅ ПРОВЕРКА

После всех настроек:

1. **Админ панель Nginx**: http://65.109.166.160:81 ✅
2. **Ваш сайт по IP**: http://65.109.166.160 ✅
3. **Ваш сайт по домену**: https://kontrollitud.ee 🔒

---

## 🔧 ПОЛЕЗНЫЕ КОМАНДЫ

```bash
# Проверка статуса Nginx Proxy Manager
cd ~/proxy
docker-compose ps
docker-compose logs -f app

# Перезапуск
docker-compose restart

# Остановка
docker-compose down

# Проверка статуса вашего проекта
cd ~/Kontrollitud.ee
docker-compose ps
docker-compose logs -f frontend backend
```

---

## 🚨 Troubleshooting

### Порт 81 недоступен
```bash
# Проверьте firewall
sudo ufw status
sudo ufw allow 81/tcp

# Проверьте контейнер
cd ~/proxy
docker-compose ps
```

### SSL сертификат не выдается
- Убедитесь, что DNS настроен и прошло 10-15 минут
- Проверьте, что порт 80 открыт
- Проверьте домен: https://dnschecker.org

### 502 Bad Gateway
```bash
# Проверьте, что ваш проект запущен
cd ~/Kontrollitud.ee
docker-compose ps

# Все контейнеры должны быть "Up"
```

---

## 📞 Следующие шаги

1. ✅ Подключитесь к серверу
2. ✅ Установите Nginx Proxy Manager
3. ✅ Откройте админ панель и смените пароль
4. ✅ Настройте DNS (A records → 65.109.166.160)
5. ✅ Загрузите проект на сервер
6. ✅ Добавьте Proxy Host для kontrollitud.ee
7. ✅ Получите SSL сертификат
8. ✅ Откройте https://kontrollitud.ee и наслаждайтесь! 🎉

---

**Удачи! 🚀**
