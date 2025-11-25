// Kontrollitud.ee/backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

const cors = require('cors'); // Убедись, что импортирован
app.use(cors()); // Это должно разрешить запросы с других портов
app.use(express.json()); // Это должно парсить входящие JSON данные

// 1. ПОДКЛЮЧЕНИЕ К БАЗЕ ДАННЫХ
// !!! ВАЖНО: Укажи здесь адрес своей MongoDB. Локальный или Atlas.
const DB_URI = 'mongodb+srv://Kontrollitud:6MXhF8u4qfK5qBUs@kontrollituddbcluster.bxlehah.mongodb.net/?appName=KontrollitudDBCluster';


mongoose.connect(DB_URI)
  .then(() => console.log('✅ MongoDB: Успешно подключено.'))
  .catch(err => console.error('❌ MongoDB: Ошибка подключения:', err));

// 2. СХЕМА ДАННЫХ (Определяем, как выглядит компания)
const companySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    category: { type: String, required: true }, 
    isVerified: { type: Boolean, default: false }, 
    contactEmail: { type: String, required: true }
});

const Company = mongoose.model('Company', companySchema);

// 3. API-МАРШРУТЫ

app.post('/api/companies', async (req, res) => {
    try {
        const company = new Company(req.body);
        await company.save();
        // Успешный ответ: 201 Created
        res.status(201).send(company); 
    } catch (error) {
        // Ответ с ошибкой: 400 Bad Request
        res.status(400).send({ error: 'Не удалось добавить компанию.' });
    }
});

// GET /api/companies - Получить все компании
// Kontrollitud.ee/backend/server.js

// ... (где-то после схемы Company и перед app.post)

// GET /api/companies - Получить все компании с фильтрацией
app.get('/api/companies', async (req, res) => {
    try {
        // 1. Создаем объект фильтра на основе параметров запроса (req.query)
        const filter = {};
        
        // 2. Добавляем фильтр по поисковому запросу (search)
        if (req.query.search) {
            // Ищем совпадения по названию (name) или описанию (description)
            // $or: позволяет искать по нескольким полям
            // $regex: позволяет искать часть строки (нечеткий поиск)
            // $options: 'i' делает поиск нечувствительным к регистру
            filter.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        // 3. Добавляем фильтр по категории
        if (req.query.category && req.query.category !== 'Все') {
            filter.category = req.query.category;
        }

        // 4. Добавляем фильтр по статусу верификации
        if (req.query.isVerified) {
            // Преобразуем строку 'true'/'false' в булево значение true/false
            filter.isVerified = req.query.isVerified === 'true';
        }

        // Выполняем поиск в MongoDB с учетом созданного объекта filter
        const companies = await Company.find(filter);
        res.json(companies);

    } catch (error) {
        console.error("Ошибка при получении компаний:", error);
        res.status(500).json({ error: 'Не удалось загрузить данные компаний.' });
    }
});


// Дополнительный маршрут для добавления тестовых данных (seed)
app.get('/api/seed', async (req, res) => {
    try {
        await Company.deleteMany({});
        const companies = [
            { name: 'Kontrollitud Spa', description: 'Лучший СПА-салон, проверен.', category: 'Спа', isVerified: true, contactEmail: 'spa@test.ee' },
            { name: 'Быстрый Магазин', description: 'Онлайн-магазин электроники.', category: 'Магазин', isVerified: true, contactEmail: 'shop@test.ee' },
            { name: 'Местный Сервис', description: 'Ремонт техники. Ожидает проверки.', category: 'Услуги', isVerified: false, contactEmail: 'service@test.ee' }
        ];
        await Company.insertMany(companies);
        res.json({ message: 'Тестовые данные успешно добавлены!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/companies - Добавить новую компанию
app.post('/api/companies', async (req, res) => {
    try {
        // req.body содержит данные, отправленные с формы React
        const newCompany = new Company(req.body); 
        const savedCompany = await newCompany.save();
        // Отправляем обратно успешный статус и сохраненный объект
        res.status(201).json(savedCompany); 
    } catch (error) {
        // Если, например, поле 'name' уже существует (unique: true)
        res.status(400).json({ error: error.message }); 
    }
});


// 4. ЗАПУСК СЕРВЕРА
app.listen(PORT, () => {
    console.log(`🚀 Бэкенд запущен на http://localhost:${PORT}`);
});