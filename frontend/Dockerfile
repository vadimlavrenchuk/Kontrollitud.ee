# Многоступенчатая сборка для React + Vite приложения

# Этап 1: Сборка приложения
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --legacy-peer-deps

# Копируем исходный код
COPY . .

# Собираем приложение для production
RUN npm run build

# Этап 2: Production сервер с nginx
FROM nginx:alpine

# Копируем собранное приложение из builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем конфигурацию nginx с поддержкой API proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
