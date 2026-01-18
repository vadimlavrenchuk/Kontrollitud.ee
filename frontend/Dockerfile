# Этап 1: Сборка приложения
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем только файлы зависимостей
COPY package*.json ./

# Устанавливаем чистые зависимости внутри Linux-контейнера
RUN npm ci --legacy-peer-deps

# Копируем исходный код (ВАЖНО: node_modules не должны копироваться!)
COPY . .

# Даем права на выполнение бинарникам Vite (на всякий случай)
RUN chmod -R +x node_modules/.bin

# Собираем приложение (Vite подхватит переменные из .env файла)
RUN npm run build

# Этап 2: Production сервер с nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]