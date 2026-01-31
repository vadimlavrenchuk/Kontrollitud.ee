# 🚨 КРИТИЧЕСКИЙ КОНТЕКСТ СЕССИИ

## 📌 Два Проекта на Одном Сервере

**Сервер:** 65.109.166.160

| Проект | Домен | Nginx Config | Статус |
|--------|-------|--------------|--------|
| **Kontrollitud.ee** | kontrollitud.ee | `/data/nginx/proxy_host/1.conf` | ✅ **НАШ ПРОЕКТ** |
| MechanicPro | verifed-est.ee | `/data/nginx/proxy_host/2.conf` | ❌ **НЕ ТРОГАТЬ** |

## ⚠️ ПРАВИЛА ДЛЯ ИИ

1. **ВСЕГДА используй конфиг #1** (`1.conf`) для kontrollitud.ee
2. **НИКОГДА не модифицируй** `2.conf` или `/var/www/mechanic-pro-demo/`
3. При деплое frontend → `/var/www/kontrollitud.ee/frontend/` (статика в Nginx)
4. Backend работает отдельно (Firebase + Node.js Express на порту 5000)

## 🎯 Быстрые Команды

```bash
# Деплой Frontend (Kontrollitud.ee)
cd frontend && npm run build
scp -r dist/* root@65.109.166.160:/var/www/kontrollitud.ee/frontend/

# Деплой Backend (Kontrollitud.ee)
cd backend
scp -r *.js package.json root@65.109.166.160:/var/www/kontrollitud.ee/backend/
ssh root@65.109.166.160 "cd /var/www/kontrollitud.ee/backend && npm install && pm2 restart kontrollitud-backend"

# Проверка конфигов
docker exec proxy_app_1 cat /data/nginx/proxy_host/1.conf  # ✅ Наш проект
docker exec proxy_app_1 cat /data/nginx/proxy_host/2.conf  # ❌ Не трогать (MechanicPro)
```

## 🔍 Что Проверить При Ошибке

- [ ] Используется ли правильный конфиг (`1.conf`)?
- [ ] Путь `/var/www/kontrollitud.ee/` (НЕ mechanic-pro-demo)?
- [ ] Backend на порту 5000 (PM2 или Node)?
- [ ] Firestore правила настроены?

## 📂 Структура (Упрощенно)

```
/var/www/
├── kontrollitud.ee/        ✅ НАШ ПРОЕКТ
│   ├── frontend/           (статика в Nginx)
│   └── backend/            (Node.js Express + Firebase)
│
└── mechanic-pro-demo/      ❌ НЕ ТРОГАТЬ (другой проект)
    ├── frontend/
    └── backend/
```

## 🛠️ Технологический Стек (Kontrollitud.ee)

- **Frontend:** React + Vite, размещен статически в Nginx
- **Backend:** Node.js + Express (порт 5000)
- **Database:** Firebase Firestore (cloud)
- **Auth:** Firebase Authentication
- **Storage:** Cloudinary (изображения)
- **Proxy:** Nginx Proxy Manager (конфиг 1.conf)

---

**Скопируй это в начало каждой новой сессии!**
