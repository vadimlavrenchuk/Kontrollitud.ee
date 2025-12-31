# Nginx Reverse Proxy Configuration

## Архитектура

```
User Request
    ↓
Nginx (port 3000)
    ├─→ / → Frontend (React SPA)
    └─→ /api → Backend (Express, port 5000)
```

## Как это решает проблему CORS

**До:** Frontend (localhost:3000) → Backend (localhost:5000) = CORS error ❌

**После:** Frontend → Nginx → Backend = Same origin ✅

Все запросы идут через один origin (localhost:3000), поэтому браузер не видит cross-origin запросов.

## Конфигурация

### Frontend API calls

Теперь в вашем React коде используйте относительные пути:

```javascript
// Было (CORS проблемы)
fetch('http://localhost:5000/api/companies')

// Стало (без CORS проблем)
fetch('/api/companies')
```

### Environment Variables

Создайте `.env` файлы для разных окружений:

**Development (без Docker):**
```env
VITE_API_URL=http://localhost:5000
```

**Production (с Docker):**
```env
VITE_API_URL=
```

**В коде:**
```javascript
const API_URL = import.meta.env.VITE_API_URL || '';
fetch(`${API_URL}/api/companies`)
```

## Возможности nginx.conf

✅ **Reverse Proxy** - перенаправление `/api` на backend
✅ **SPA Support** - все маршруты React Router работают
✅ **CORS Fix** - единая точка входа
✅ **Gzip compression** - сжатие ответов
✅ **Static caching** - кеширование JS/CSS на 1 год
✅ **No HTML caching** - актуальная версия приложения
✅ **File uploads** - поддержка до 10MB
✅ **Health check** - эндпоинт `/health`
✅ **WebSocket ready** - заголовки для будущей поддержки WS

## Тестирование

```bash
# Запустите Docker
docker-compose up -d --build

# Проверьте frontend
curl http://localhost:3000

# Проверьте API через nginx
curl http://localhost:3000/api/companies

# Health check
curl http://localhost:3000/health
```

## Логи nginx

```bash
# Смотрим логи nginx внутри контейнера
docker-compose exec frontend tail -f /var/log/nginx/access.log
docker-compose exec frontend tail -f /var/log/nginx/error.log
```

## Production готовность

- ✅ Оптимизировано для production
- ✅ Безопасные заголовки
- ✅ Кеширование статики
- ✅ Gzip компрессия
- ✅ Таймауты настроены
- ✅ Health check для мониторинга

## Важно

Backend больше НЕ нужен напрямую снаружи. Можно убрать порт 5000 из docker-compose.yml:

```yaml
backend:
  # ports:
  #   - "5000:5000"  # Не нужно - доступ только через nginx
```

Это повысит безопасность - API доступно только через nginx proxy.
