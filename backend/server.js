// Kontrollitud.ee/backend/server.js

// 1. ИМПОРТЫ
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { verifyToken, optionalAuth } = require('./middleware/authMiddleware');
const app = express();
const PORT = 5000;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// 2. MIDDLEWARE (Настройки приложения)
app.use(cors()); 
app.use(express.json());

app.get('/test', (req, res) => {
    res.send('Бэкенд работает!');
});

// 1. ПОДКЛЮЧЕНИЕ К БАЗЕ ДАННЫХ
const DB_URI = process.env.DB_URI || 'mongodb+srv://Kontrollitud:6MXhF8u4qfK5qBUs@kontrollituddbcluster.bxlehah.mongodb.net/?appName=KontrollitudDBCluster';


mongoose.connect(DB_URI)
  .then(() => console.log('✅ MongoDB: Успешно подключено.'))
  .catch(err => console.error('❌ MongoDB: Ошибка подключения:', err));

// 2. СХЕМА ДАННЫХ (Определяем, как выглядит компания)
const companySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    category: { 
        type: String, 
        enum: ['SPA', 'Restaurants', 'Shops', 'Kids', 'Travel', 'Auto', 'Services'],
        required: true 
    },
    city: { 
        type: String, 
        enum: ['Tallinn', 'Tartu', 'Narva', 'Pärnu', 'Kohtla-Järve', 'Viljandi', 
               'Maardu', 'Rakvere', 'Kuressaare', 'Sillamäe', 'Valga', 'Võru', 
               'Jõhvi', 'Haapsalu', 'Keila', 'Paide'],
        required: true 
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    },
    rating: { 
        type: Number, 
        default: 0,
        min: 0,
        max: 5 
    },
    reviewsCount: { 
        type: Number, 
        default: 0,
        min: 0 
    },
    description: {
        et: { type: String },
        en: { type: String },
        ru: { type: String }
    },
    image: { 
        type: String 
    },
    workingHours: {
        type: Object
    },
    // Social media URLs
    tiktokUrl: {
        type: String
    },
    instagramUrl: {
        type: String
    },
    youtubeUrl: {
        type: String
    },
    // Reviewer information
    reviewerName: {
        type: String
    },
    // Subscription and approval
    subscriptionLevel: {
        type: String,
        enum: ['free', 'lite', 'medium', 'strong'],
        default: 'free'
    },
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    // Additional fields for map and sorting
    latitude: {
        type: Number
    },
    longitude: {
        type: Number
    },
    priority: {
        type: Number,
        default: 0
    },
    email: {
        type: String
    },
    phone: {
        type: String
    },
    website: {
        type: String
    },
    // User tracking for submissions
    userId: {
        type: String // Firebase UID
    },
    userEmail: {
        type: String // User's email for reference
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
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

// Static method to calculate average rating for a company
reviewSchema.statics.getAverageRating = async function(companyId) {
    try {
        const stats = await this.aggregate([
            {
                $match: { companyId: companyId }
            },
            {
                $group: {
                    _id: '$companyId',
                    averageRating: { $avg: '$rating' },
                    reviewsCount: { $sum: 1 }
                }
            }
        ]);

        // Update the Company document with new rating and count
        if (stats.length > 0) {
            await mongoose.model('Company').findByIdAndUpdate(companyId, {
                rating: Math.round(stats[0].averageRating * 10) / 10, // Round to 1 decimal
                reviewsCount: stats[0].reviewsCount
            });
        } else {
            // No reviews, reset to defaults
            await mongoose.model('Company').findByIdAndUpdate(companyId, {
                rating: 0,
                reviewsCount: 0
            });
        }
    } catch (error) {
        console.error('Error calculating average rating:', error);
    }
};

// Post-save hook to automatically update company rating after each review
reviewSchema.post('save', async function() {
    await this.constructor.getAverageRating(this.companyId);
});

// Post-remove hook to update rating when a review is deleted
reviewSchema.post('remove', async function() {
    await this.constructor.getAverageRating(this.companyId);
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
        
        // Only show approved companies by default (unless admin requests otherwise)
        if (req.query.includeUnapproved !== 'true') {
            filter.approvalStatus = 'approved';
        }
        
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

        // 4. Добавляем фильтр по городу
        if (req.query.city && req.query.city !== 'Все') {
            filter.city = req.query.city;
        }

        // 5. Добавляем фильтр по верификации
        if (req.query.isVerified === 'true') {
            filter.isVerified = true;
        }

        // 6. Добавляем фильтр по статусу верификации (legacy support)
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
            { 
                name: 'Tallinn Luxury SPA', 
                category: 'SPA', 
                city: 'Tallinn',
                isVerified: true,
                rating: 4.8,
                reviewsCount: 127,
                description: {
                    et: 'Parim SPA-keskus Tallinnas. Professionaalne teenindus ja lõõgastav atmosfäär.',
                    en: 'Best SPA center in Tallinn. Professional service and relaxing atmosphere.',
                    ru: 'Лучший СПА-центр в Таллинне. Профессиональное обслуживание и расслабляющая атмосфера.'
                },
                image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&h=250&fit=crop',
                workingHours: {
                    monday: '10:00-20:00',
                    tuesday: '10:00-20:00',
                    wednesday: '10:00-20:00',
                    thursday: '10:00-20:00',
                    friday: '10:00-22:00',
                    saturday: '10:00-22:00',
                    sunday: '10:00-18:00'
                }
            },
            { 
                name: 'Tartu Family Restaurant', 
                category: 'Restaurants', 
                city: 'Tartu',
                isVerified: true,
                rating: 4.5,
                reviewsCount: 89,
                description: {
                    et: 'Peresõbralik restoran Tartu südames. Maitsvad toidud ja sõbralik teenindus.',
                    en: 'Family-friendly restaurant in the heart of Tartu. Delicious food and friendly service.',
                    ru: 'Семейный ресторан в центре Тарту. Вкусная еда и дружелюбное обслуживание.'
                },
                image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop',
                workingHours: {
                    monday: '11:00-22:00',
                    tuesday: '11:00-22:00',
                    wednesday: '11:00-22:00',
                    thursday: '11:00-22:00',
                    friday: '11:00-23:00',
                    saturday: '11:00-23:00',
                    sunday: '11:00-21:00'
                }
            },
            { 
                name: 'TechnoShop Electronics', 
                category: 'Shops', 
                city: 'Tallinn',
                isVerified: false,
                rating: 3.9,
                reviewsCount: 45,
                description: {
                    et: 'Elektroonika- ja nutiseadmete pood. Lai valik ja konkurentsivõimelised hinnad.',
                    en: 'Electronics and smart devices store. Wide selection and competitive prices.',
                    ru: 'Магазин электроники и умных устройств. Широкий ассортимент и конкурентные цены.'
                },
                image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=250&fit=crop',
                workingHours: {
                    monday: '09:00-19:00',
                    tuesday: '09:00-19:00',
                    wednesday: '09:00-19:00',
                    thursday: '09:00-19:00',
                    friday: '09:00-19:00',
                    saturday: '10:00-17:00',
                    sunday: 'Closed'
                }
            },
            { 
                name: 'Kids Paradise', 
                category: 'Kids', 
                city: 'Pärnu',
                isVerified: true,
                rating: 4.9,
                reviewsCount: 156,
                description: {
                    et: 'Laste mängukeskus Pärnus. Turvaline ja lõbus keskkond lastele.',
                    en: 'Children\'s play center in Pärnu. Safe and fun environment for kids.',
                    ru: 'Детский игровой центр в Пярну. Безопасная и веселая среда для детей.'
                },
                image: 'https://images.unsplash.com/photo-1544041144-5f0f51d73bb6?w=400&h=250&fit=crop',
                workingHours: {
                    monday: '10:00-20:00',
                    tuesday: '10:00-20:00',
                    wednesday: '10:00-20:00',
                    thursday: '10:00-20:00',
                    friday: '10:00-21:00',
                    saturday: '10:00-21:00',
                    sunday: '10:00-19:00'
                }
            },
            { 
                name: 'Baltic Travel Agency', 
                category: 'Travel', 
                city: 'Tallinn',
                isVerified: true,
                rating: 4.6,
                reviewsCount: 203,
                description: {
                    et: 'Reisibüroo, mis pakub parimaid puhkusepakette ja reisiteenuseid.',
                    en: 'Travel agency offering the best vacation packages and travel services.',
                    ru: 'Туристическое агентство, предлагающее лучшие туристические пакеты и услуги.'
                },
                image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=250&fit=crop',
                workingHours: {
                    monday: '09:00-18:00',
                    tuesday: '09:00-18:00',
                    wednesday: '09:00-18:00',
                    thursday: '09:00-18:00',
                    friday: '09:00-18:00',
                    saturday: '10:00-14:00',
                    sunday: 'Closed'
                }
            },
            { 
                name: 'AutoService Pro', 
                category: 'Auto', 
                city: 'Narva',
                isVerified: false,
                rating: 4.2,
                reviewsCount: 67,
                description: {
                    et: 'Autoremont ja hooldus. Professionaalsed mehaaniikud ja kvaliteetne teenindus.',
                    en: 'Car repair and maintenance. Professional mechanics and quality service.',
                    ru: 'Ремонт и обслуживание автомобилей. Профессиональные механики и качественный сервис.'
                },
                image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=250&fit=crop',
                workingHours: {
                    monday: '08:00-18:00',
                    tuesday: '08:00-18:00',
                    wednesday: '08:00-18:00',
                    thursday: '08:00-18:00',
                    friday: '08:00-18:00',
                    saturday: '09:00-14:00',
                    sunday: 'Closed'
                }
            },
            { 
                name: 'Home Cleaning Experts', 
                category: 'Services', 
                city: 'Tartu',
                isVerified: true,
                rating: 4.7,
                reviewsCount: 94,
                description: {
                    et: 'Professionaalne kodukoristusteenus. Kiire, usaldusväärne ja taskukohane.',
                    en: 'Professional home cleaning service. Fast, reliable and affordable.',
                    ru: 'Профессиональная служба уборки. Быстро, надежно и доступно.'
                },
                image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=250&fit=crop',
                workingHours: {
                    monday: '08:00-20:00',
                    tuesday: '08:00-20:00',
                    wednesday: '08:00-20:00',
                    thursday: '08:00-20:00',
                    friday: '08:00-20:00',
                    saturday: '09:00-17:00',
                    sunday: 'Closed'
                }
            }
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

        // Validate that company exists
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ error: 'Компания не найдена.' });
        }

        // Create new review with numeric rating (ensure type safety)
        const newReview = new Review({ 
            companyId, 
            userName: userName || 'Анонимный пользователь', 
            comment, 
            rating: Number(rating) // Ensure numeric type
        });
        
        // Save review - post-save hook will automatically update company rating
        const savedReview = await newReview.save();

        // Return the saved review
        res.status(201).json(savedReview);

    } catch (error) {
        console.error("Ошибка при добавлении отзыва:", error);
        res.status(400).json({ error: error.message });
    }
});

// POST /api/business-submission - Protected route for authenticated users to submit their business
app.post('/api/business-submission', verifyToken, async (req, res) => {
    try {
        const businessData = {
            ...req.body,
            userId: req.user.uid, // Add authenticated user's ID
            userEmail: req.user.email, // Add user's email for reference
            approvalStatus: 'pending',
            subscriptionLevel: 'free',
            isVerified: false
        };
        
        const newBusiness = new Company(businessData);
        const savedBusiness = await newBusiness.save();
        
        res.status(201).json({ 
            success: true,
            message: 'Business submitted successfully. It will appear after admin approval.',
            business: savedBusiness
        });
    } catch (error) {
        console.error("Error submitting business:", error);
        res.status(400).json({ error: error.message });
    }
});

// GET /api/admin/pending-requests - Get all pending business submissions
app.get('/api/admin/pending-requests', async (req, res) => {
    try {
        const pendingBusinesses = await Company.find({ approvalStatus: 'pending' })
            .sort({ createdAt: -1 });
        res.json(pendingBusinesses);
    } catch (error) {
        console.error("Error fetching pending requests:", error);
        res.status(500).json({ error: 'Failed to fetch pending requests' });
    }
});

// PUT /api/admin/approve/:id - Approve a business submission
app.put('/api/admin/approve/:id', async (req, res) => {
    try {
        const { subscriptionLevel } = req.body;
        const companyId = req.params.id;
        
        const updateData = {
            approvalStatus: 'approved',
            subscriptionLevel: subscriptionLevel || 'free'
        };
        
        // If upgrading to medium or strong, mark as verified
        if (subscriptionLevel === 'medium' || subscriptionLevel === 'strong') {
            updateData.isVerified = true;
        }
        
        const updatedCompany = await Company.findByIdAndUpdate(
            companyId,
            updateData,
            { new: true }
        );
        
        if (!updatedCompany) {
            return res.status(404).json({ error: 'Business not found' });
        }
        
        res.json({ 
            success: true,
            message: `Business approved as ${subscriptionLevel}`,
            company: updatedCompany
        });
    } catch (error) {
        console.error("Error approving business:", error);
        res.status(400).json({ error: error.message });
    }
});

// DELETE /api/admin/reject/:id - Reject/delete a business submission
app.delete('/api/admin/reject/:id', async (req, res) => {
    try {
        const companyId = req.params.id;
        const deletedCompany = await Company.findByIdAndDelete(companyId);
        
        if (!deletedCompany) {
            return res.status(404).json({ error: 'Business not found' });
        }
        
        res.json({ 
            success: true,
            message: 'Business submission deleted',
            company: deletedCompany
        });
    } catch (error) {
        console.error("Error deleting business:", error);
        res.status(400).json({ error: error.message });
    }
});

// GET /api/user/submissions - Get user's business submissions by userId
app.get('/api/user/submissions', verifyToken, async (req, res) => {
    try {
        const { userId } = req.query;
        
        // If userId query param provided, use it (for backward compatibility)
        // Otherwise use the authenticated user's ID from token
        const searchUserId = userId || req.user.uid;
        
        if (!searchUserId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        
        // Security: Regular users can only see their own submissions
        // Allow if: userId matches token OR no userId param provided (defaults to token user)
        if (userId && userId !== req.user.uid) {
            // Check if requesting user is admin (implement your admin logic here)
            // For now, only allow users to see their own submissions
            return res.status(403).json({ error: 'You can only view your own submissions' });
        }
        
        // Find all businesses submitted by this user
        const userSubmissions = await Company.find({ userId: searchUserId })
            .sort({ createdAt: -1 })
            .select('-__v'); // Exclude version field
        
        res.json(userSubmissions);
    } catch (error) {
        console.error("Error fetching user submissions:", error);
        res.status(500).json({ error: 'Failed to fetch user submissions' });
    }
});

// POST /api/admin/login - Simple admin authentication
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (password === adminPassword) {
        // Generate a simple token (in production, use JWT)
        const token = Buffer.from(`admin:${Date.now()}`).toString('base64');
        res.json({ 
            success: true, 
            token,
            message: 'Login successful' 
        });
    } else {
        res.status(401).json({ 
            error: 'Invalid password' 
        });
    }
});

// POST /api/upload - Upload image to Cloudinary
app.post('/api/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Check if Cloudinary is configured
        if (!process.env.CLOUDINARY_CLOUD_NAME) {
            return res.status(500).json({ 
                error: 'Cloudinary not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env file' 
            });
        }

        // Upload to Cloudinary using upload_stream
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'kontrollitud',
                transformation: [
                    { width: 800, height: 500, crop: 'limit' },
                    { quality: 'auto' }
                ]
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return res.status(500).json({ error: 'Upload failed' });
                }
                res.json({ 
                    url: result.secure_url,
                    public_id: result.public_id 
                });
            }
        );

        // Pipe the buffer to Cloudinary
        const { Readable } = require('stream');
        const bufferStream = new Readable();
        bufferStream.push(req.file.buffer);
        bufferStream.push(null);
        bufferStream.pipe(uploadStream);

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/companies/:id - Delete a company
app.delete('/api/companies/:id', async (req, res) => {
    try {
        const companyId = req.params.id;
        
        // Find and delete the company
        const deletedCompany = await Company.findByIdAndDelete(companyId);
        
        if (!deletedCompany) {
            return res.status(404).json({ error: 'Company not found.' });
        }
        
        // Also delete all reviews associated with this company
        await Review.deleteMany({ companyId: companyId });
        
        res.json({ 
            message: 'Company and associated reviews deleted successfully',
            company: deletedCompany 
        });

    } catch (error) {
        console.error("Error deleting company:", error);
        res.status(500).json({ error: 'Failed to delete company.' });
    }
});

// GET /sitemap.xml - Generate dynamic sitemap for SEO
app.get('/sitemap.xml', async (req, res) => {
    try {
        const companies = await Company.find({});
        const baseUrl = 'https://kontrollitud.ee'; // Change to your production domain
        
        // Build XML sitemap
        let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
        sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
        
        // Homepage
        sitemap += '  <url>\n';
        sitemap += `    <loc>${baseUrl}/</loc>\n`;
        sitemap += '    <changefreq>daily</changefreq>\n';
        sitemap += '    <priority>1.0</priority>\n';
        sitemap += '  </url>\n';
        
        // Company pages
        companies.forEach(company => {
            sitemap += '  <url>\n';
            sitemap += `    <loc>${baseUrl}/companies/${company._id}</loc>\n`;
            sitemap += '    <changefreq>weekly</changefreq>\n';
            sitemap += '    <priority>0.8</priority>\n';
            sitemap += '  </url>\n';
        });
        
        sitemap += '</urlset>';
        
        res.header('Content-Type', 'application/xml');
        res.send(sitemap);
        
    } catch (error) {
        console.error('Error generating sitemap:', error);
        res.status(500).send('Error generating sitemap');
    }
});

// 4. ЗАПУСК СЕРВЕРА
app.listen(PORT, () => {
    console.log(`🚀 Бэкенд запущен на http://localhost:${PORT}`);
});