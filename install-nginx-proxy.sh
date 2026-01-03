#!/bin/bash

# 🔐 Nginx Proxy Manager - Quick Install Script
# Для Ubuntu/Debian серверов

echo "================================================"
echo "🚀 Установка Nginx Proxy Manager"
echo "================================================"
echo ""

# Проверка прав root
if [[ $EUID -ne 0 ]]; then
   echo "❌ Этот скрипт нужно запускать с правами root (sudo)"
   echo "Попробуйте: sudo bash install-nginx-proxy.sh"
   exit 1
fi

echo "✅ Права root подтверждены"
echo ""

# Проверка Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен!"
    echo "Установите Docker: https://docs.docker.com/engine/install/"
    exit 1
fi

echo "✅ Docker найден: $(docker --version)"
echo ""

# Проверка Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не установлен!"
    echo "Установите Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker Compose найден: $(docker-compose --version)"
echo ""

# Создание директории
INSTALL_DIR="$HOME/proxy"
echo "📁 Создание директории: $INSTALL_DIR"

if [ -d "$INSTALL_DIR" ]; then
    echo "⚠️  Директория уже существует. Удалить? (y/n)"
    read -r response
    if [[ "$response" == "y" ]]; then
        rm -rf "$INSTALL_DIR"
        echo "✅ Старая директория удалена"
    else
        echo "❌ Установка отменена"
        exit 1
    fi
fi

mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR" || exit

echo "✅ Директория создана"
echo ""

# Создание docker-compose.yml
echo "📝 Создание docker-compose.yml"
cat > docker-compose.yml <<'EOF'
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
EOF

echo "✅ docker-compose.yml создан"
echo ""

# Настройка Firewall (UFW)
if command -v ufw &> /dev/null; then
    echo "🔥 Настройка UFW Firewall"
    ufw allow 80/tcp comment 'HTTP for Nginx Proxy Manager'
    ufw allow 443/tcp comment 'HTTPS for Nginx Proxy Manager'
    ufw allow 81/tcp comment 'Nginx Proxy Manager Admin Panel'
    echo "✅ Firewall настроен"
    echo ""
fi

# Запуск контейнера
echo "🚀 Запуск Nginx Proxy Manager"
docker-compose up -d

echo ""
echo "⏳ Ожидание запуска (30 секунд)..."
sleep 30

# Проверка статуса
echo ""
echo "📊 Статус контейнера:"
docker-compose ps

echo ""
echo "================================================"
echo "✅ Установка завершена!"
echo "================================================"
echo ""
echo "🌐 Админ панель: http://$(curl -s ifconfig.me):81"
echo ""
echo "🔑 Логин по умолчанию:"
echo "   Email: admin@example.com"
echo "   Password: changeme"
echo ""
echo "⚠️  ВАЖНО: Сразу смените пароль после входа!"
echo ""
echo "📚 Полная документация: NGINX_PROXY_SETUP.md"
echo ""
echo "Для просмотра логов:"
echo "cd $INSTALL_DIR && docker-compose logs -f app"
echo ""
echo "================================================"
