// Kontrollitud.ee/backend/server.js

// 1. ИМПОРТЫ
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
const app = express();
const PORT = 5000;

// 2. MIDDLEWARE (Настройки приложения)
app.use(cors()); 
app.use(express.json());

app.get('/test', (req, res) => {
    res.send('Бэкенд работает!');
});

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
    contactEmail: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'verified', 'rejected'], 
        default: 'pending',
        required: true
    },
    // 🟢 РЕЙТИНГ И ОТЗЫВЫ
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 }
});

const Company = mongoose.model('Company', companySchema);

// 🟢 НОВАЯ СХЕМА: Отзывы
const reviewSchema = new mongoose.Schema({
    // Ссылка на компанию, к которой относится отзыв
    companyId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Company', 
        required: true 
    },
    // Имя пользователя (пока без аутентификации)
    userName: { 
        type: String, 
        required: true, 
        default: 'Анонимный пользователь' 
    },
    // Текст отзыва
    comment: { 
        type: String, 
        required: true 
    },
    // Оценка (от 1 до 5)
    rating: { 
        type: Number, 
        required: true, 
        min: 1, 
        max: 5 
    },
    // Дата создания
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Создаем модель Review
const Review = mongoose.model('Review', reviewSchema);

// 3. API-МАРШРУТЫ

// 🟢 API CONTRACT: COMPANY STATUS SYSTEM
// 
// GET endpoints: Return company objects with `status` field
// - GET /api/companies - List all companies with optional filters
// - GET /api/companies?status=pending|verified|rejected - Filter by status
// - GET /api/companies/:id - Get single company by ID
//
// Status filtering:
// - Valid values: 'pending', 'verified', 'rejected'
// - Invalid status param → HTTP 400 with error message
//
// POST/PUT endpoints: Status is admin-only (future feature)
// - Public POST /api/companies → Always sets status='pending'
// - User cannot override status via request body
// - Future PATCH /api/companies/:id/status → Admin-only endpoint
//

app.get('/api/companies', async (req, res) => {
    try {
        // 1. Создаем объект фильтра на основе параметров запроса (req.query)
        const filter = {};
        
        // 2. Добавляем фильтр по поисковому запросу (search)
        if (req.query.search) {
            
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
        if (req.query.status) {
            // Позволяем фильтровать по статусу: 'pending', 'verified', 'rejected'
            if (['pending', 'verified', 'rejected'].includes(req.query.status)) {
                filter.status = req.query.status;
            } else {
                // Отклоняем невалидные значения статуса
                return res.status(400).json({ 
                    error: `Invalid status value. Allowed values: 'pending', 'verified', 'rejected'` 
                });
            }
        }

        // Выполняем поиск в MongoDB с учетом созданного объекта filter
        const companies = await Company.find(filter);
        res.json(companies);

    } catch (error) {
        console.error("Ошибка при получении компаний:", error);
        res.status(500).json({ error: 'Не удалось загрузить данные компаний.' });
    }
});

// GET /api/companies/:id - Получить компанию по ID
app.get('/api/companies/:id', async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        
        // Если компания не найдена
        if (!company) {
            return res.status(404).json({ error: 'Компания не найдена.' });
        }
        
        // Отправляем найденную компанию
        res.json(company);

    } catch (error) {
        // Ошибка, если ID имеет неверный формат MongoDB (CastError)
        console.error("Ошибка при получении компании по ID:", error);
        res.status(500).json({ error: 'Не удалось загрузить данные компании.' });
    }
});


// Дополнительный маршрут для добавления тестовых данных (seed)
app.get('/api/seed', async (req, res) => {
    try {
        await Company.deleteMany({});
        const companies = [
            { name: 'Kontrollitud Spa', description: 'Лучший СПА-салон, проверен.', category: 'Спа', status: 'verified', contactEmail: 'spa@test.ee' },
            { name: 'Быстрый Магазин', description: 'Онлайн-магазин электроники.', category: 'Магазин', status: 'verified', contactEmail: 'shop@test.ee' },
            { name: 'Местный Сервис', description: 'Ремонт техники. Ожидает проверки.', category: 'Услуги', status: 'pending', contactEmail: 'service@test.ee' }
        ];
        await Company.insertMany(companies);
        res.json({ message: 'Тестовые данные успешно добавлены!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🟢 НОВЫЙ МАРШРУТ: GET /api/reviews/:companyId - Получить все отзывы для компании
app.get('/api/reviews/:companyId', async (req, res) => {
    try {
        const reviews = await Review.find({ companyId: req.params.companyId })
                                    .sort({ createdAt: -1 }); // Сортируем по новым
        res.json(reviews);
    } catch (error) {
        console.error("Ошибка при получении отзывов:", error);
        res.status(500).json({ error: 'Не удалось загрузить отзывы.' });
    }
});

// POST /api/companies - Добавить новую компанию
// 🟢 SECURITY: Status is NOT user-controllable. Always defaults to 'pending'.
// Admin status changes will be handled by a separate authenticated endpoint (future).
app.post('/api/companies', async (req, res) => {
    try {
        // 🟢 SECURITY: Не позволяем пользователю устанавливать статус вручную
        // Статус должен быть установлен только администратором через отдельный эндпоинт
        const { status, ...safeData } = req.body;
        
        // Всегда устанавливаем статус в 'pending' для новых компаний
        const companyData = { ...safeData, status: 'pending' };
        
        // Создаем и сохраняем компанию с защищенными данными
        const newCompany = new Company(companyData); 
        const savedCompany = await newCompany.save();
        
        // Отправляем обратно успешный статус и сохраненный объект
        res.status(201).json(savedCompany); 
    } catch (error) {
        // Если, например, поле 'name' уже существует (unique: true)
        res.status(400).json({ error: error.message }); 
    }
});

// 🟢 НОВЫЙ МАРШРУТ: POST /api/reviews/:companyId - Добавить новый отзыв
app.post('/api/reviews/:companyId', async (req, res) => {
    try {
        const { userName, comment, rating } = req.body;
        const companyId = req.params.companyId;

        // 1. Создаем новый отзыв
        const newReview = new Review({ 
            companyId, 
            userName, 
            comment, 
            rating 
        });
        const savedReview = await newReview.save();

        // 2. Обновляем статистику компании (средний рейтинг и счетчик)
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ error: 'Компания не найдена.' });
        }
        
        // Пересчет среднего рейтинга
        const newReviewCount = company.reviewCount + 1;
        const newAverageRating = 
            (company.averageRating * company.reviewCount + rating) / newReviewCount;

        company.reviewCount = newReviewCount;
        company.averageRating = newAverageRating;
        await company.save();

        // 3. Отправляем новый отзыв
        res.status(201).json(savedReview);

    } catch (error) {
        console.error("Ошибка при добавлении отзыва:", error);
        res.status(400).json({ error: error.message });
    }
});

// 4. ЗАПУСК СЕРВЕРА
app.listen(PORT, () => {
    console.log(`🚀 Бэкенд запущен на http://localhost:${PORT}`);
});