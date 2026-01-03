#!/bin/bash
# Nginx Proxy Manager - Быстрая установка на 65.109.166.160

echo "🚀 Установка Nginx Proxy Manager..."

# Проверка Docker
if ! command -v docker &> /dev/null; then
    echo "📦 Установка Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    apt install docker-compose -y
else
    echo "✅ Docker уже установлен: $(docker --version)"
fi

# Создание директории
echo "📁 Создание директории ~/proxy"
mkdir -p ~/proxy
cd ~/proxy

# Создание docker-compose.yml
echo "📝 Создание docker-compose.yml"
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

# Открытие портов в firewall
if command -v ufw &> /dev/null; then
    echo "🔥 Настройка UFW Firewall"
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 81/tcp
fi

# Запуск контейнера
echo "🚀 Запуск Nginx Proxy Manager"
docker-compose up -d

# Ожидание запуска
echo "⏳ Ожидание запуска (15 секунд)..."
sleep 15

# Проверка статуса
echo ""
echo "📊 Статус контейнера:"
docker-compose ps

echo ""
echo "================================================"
echo "✅ Установка завершена!"
echo "================================================"
echo ""
echo "🌐 Админ панель: http://65.109.166.160:81"
echo ""
echo "🔑 Логин:"
echo "   Email: admin@example.com"
echo "   Password: changeme"
echo ""
echo "⚠️  ВАЖНО: Сразу смените пароль!"
echo ""
echo "================================================"
