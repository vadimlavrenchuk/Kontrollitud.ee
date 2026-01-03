# Node.js Express Backend

FROM node:20-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем только production зависимости
RUN npm ci --only=production

# Копируем исходный код
COPY . .

# Открываем порт
EXPOSE 5000

# Запускаем сервер
CMD ["node", "server.js"]
