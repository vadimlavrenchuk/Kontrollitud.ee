# Docker Setup для Kontrollitud.ee

## Быстрый старт

### 1. Настройте переменные окружения

Скопируйте `.env.example` в `.env` и заполните своими данными:

```bash
cp .env.example .env
```

### 2. Запустите все сервисы

```bash
docker-compose up -d
```

Это запустит:
- **Frontend** на `http://localhost:3000`
- **Backend** на `http://localhost:5000`
- **MongoDB** на `localhost:27017`

### 3. Остановите сервисы

```bash
docker-compose down
```

Для удаления данных MongoDB:
```bash
docker-compose down -v
```

## Команды для разработки

### Пересобрать контейнеры
```bash
docker-compose up -d --build
```

### Просмотр логов
```bash
# Все сервисы
docker-compose logs -f

# Только backend
docker-compose logs -f backend

# Только frontend
docker-compose logs -f frontend
```

### Зайти в контейнер
```bash
# Backend
docker-compose exec backend sh

# Frontend
docker-compose exec frontend sh
```

### Запустить миграции
```bash
docker-compose exec backend npm run migrate:slugs
```

### Сгенерировать sitemap
```bash
docker-compose exec backend npm run sitemap
```

## Структура проектов

```
├── frontend/
│   ├── Dockerfile          # Многоступенчатая сборка с nginx
│   └── ...
├── backend/
│   ├── Dockerfile          # Node.js production сервер
│   └── ...
├── docker-compose.yml      # Оркестрация всех сервисов
├── .dockerignore           # Исключения для Docker
└── .env                    # Переменные окружения (не в git!)
```

## Production Deployment

### С помощью Docker Swarm:
```bash
docker stack deploy -c docker-compose.yml kontrollitud
```

### С помощью Kubernetes:
Можно использовать kompose для конвертации:
```bash
kompose convert
```

## Важные замечания

1. **Безопасность**: Никогда не коммитьте `.env` файл в git
2. **MongoDB**: Данные сохраняются в volume `mongodb-data`
3. **Networking**: Все сервисы в одной сети `kontrollitud-network`
4. **Порты**: 
   - Frontend: 3000
   - Backend: 5000
   - MongoDB: 27017

## Troubleshooting

### Проблемы с подключением к MongoDB
Убедитесь, что в backend `.env` используется правильный hostname:
```
MONGODB_URI=mongodb://admin:password@mongodb:27017/kontrollitud?authSource=admin
```

### Ошибки сборки frontend
Очистите кэш Docker:
```bash
docker-compose build --no-cache frontend
```

### Проблемы с Firebase
Проверьте, что FIREBASE_PRIVATE_KEY правильно экранирован с `\n`.
