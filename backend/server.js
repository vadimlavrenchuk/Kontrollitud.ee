// Kontrollitud.ee/backend/server.js

// 1. ИМПОРТЫ
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const cron = require('node-cron');
const nodemailer = require('nodemailer');
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
// Поддержка обеих переменных для совместимости
const DB_URI = process.env.MONGODB_URI || process.env.DB_URI;

if (!DB_URI) {
    console.error('❌ КРИТИЧЕСКАЯ ОШИБКА: MONGODB_URI не найден в переменных окружения!');
    console.error('Создайте файл .env в корне проекта (Kontrollitud.ee/.env) с переменной MONGODB_URI');
    process.exit(1);
}

console.log('🔄 Подключаюсь к MongoDB Atlas...');
console.log('URI (первые 50 символов):', DB_URI.substring(0, 50) + '...');

const mongooseOptions = {
  family: 4, // Принудительно использовать IPv4 (важно для Docker на Windows)
  serverSelectionTimeoutMS: 5000, // Таймаут выбора сервера 5 сек
  socketTimeoutMS: 45000, // Таймаут сокета 45 сек
  connectTimeoutMS: 10000, // Таймаут подключения 10 сек
  maxPoolSize: 10, // Максимум 10 соединений в пуле
  minPoolSize: 2, // Минимум 2 соединения
  retryWrites: true, // Повторять записи при ошибках
  retryReads: true, // Повторять чтения при ошибках
};

mongoose.connect(DB_URI, mongooseOptions)
  .then(() => {
    console.log('✅ MongoDB Atlas: Успешно подключено!');
    console.log('✅ Database:', mongoose.connection.name);
    console.log('✅ Host:', mongoose.connection.host);
  })
  .catch(err => {
    console.error('❌ MongoDB Atlas: Ошибка подключения!');
    console.error('❌ Тип ошибки:', err.constructor.name);
    console.error('❌ Сообщение:', err.message);
    console.error('❌ Код ошибки:', err.code);
    if (err.reason) {
      console.error('❌ Причина:', err.reason);
    }
    console.error('❌ Полная ошибка:', err);
    process.exit(1); // Выходим, если не можем подключиться
  });

// Отслеживание состояния подключения
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose: Соединение установлено');
});

mongoose.connection.on('error', (err) => {
  console.error('⚠️ Mongoose: Ошибка соединения:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ Mongoose: Соединение разорвано');
});

// 3. ЧЕРНЫЙ СПИСОК И ФУНКЦИИ ПРОВЕРКИ
// Blacklist words for automatic rejection (Estonian + international)
const blackListWords = [
    // Profanity (Estonian)
    'pask', 'sitt', 'kurat', 'vittu', 'persse', 'loll', 'idioot', 'türa',
    
    // Profanity (Russian - common in Estonia)
    'блять', 'сука', 'хуй', 'пизда', 'ебать', 'мудак', 'дерьмо',
    
    // Profanity (English)
    'fuck', 'shit', 'bitch', 'asshole', 'damn', 'bastard', 'crap',
    
    // Scam/fraud trigger words
    'scam', 'fraud', 'fake', 'steal', 'cheat', 'ponzi', 'pyramid',
    'fast money', 'quick cash', 'get rich', 'easy money', 'free money',
    'casino online', 'gambling', 'bitcoin hack', 'crypto scam',
    
    // Spam patterns
    '!!!!!!', 'AAAAAAA', '$$$$$$', '###', 'CLICK HERE', 'BUY NOW',
    'LIMITED TIME', '100% FREE', 'GUARANTEED', 'NO RISK',
    
    // Competitors (add your specific competitors)
    // 'competitor1', 'competitor2', etc.
    
    // Inappropriate content
    'porn', 'sex', 'xxx', 'adult', 'escort', 'drugs', 'weapon'
];

// Function to check text against blacklist
function containsBlacklistedWords(text) {
    if (!text) return false;
    
    const normalizedText = text.toLowerCase().trim();
    
    // Check for exact matches and partial matches
    for (const word of blackListWords) {
        const normalizedWord = word.toLowerCase();
        
        // Check if blacklisted word appears as whole word or part of text
        if (normalizedText.includes(normalizedWord)) {
            console.log(`🚫 Blacklisted word detected: "${word}" in text: "${text.substring(0, 50)}..."`);
            return true;
        }
    }
    
    // Check for excessive repetition (spam pattern like "AAAAAA" or "!!!!!!")
    const repetitionPattern = /(.)\1{5,}/g; // 6+ repeated characters
    if (repetitionPattern.test(normalizedText)) {
        console.log(`🚫 Spam pattern detected (excessive repetition) in: "${text.substring(0, 50)}..."`);
        return true;
    }
    
    // Note: Excessive caps are handled by normalization, not rejection
    // They will be auto-corrected to Title Case instead of being rejected
    
    return false;
}

// Function to send admin notification (Telegram or Email)
async function sendAdminNotification(companyName, action, subscriptionLevel) {
    const message = `
🔔 Новая компания автоматически ${action === 'approved' ? 'одобрена' : 'отклонена'}

📊 Название: ${companyName}
💰 План: ${subscriptionLevel}
⏰ Время: ${new Date().toLocaleString('et-EE', { timeZone: 'Europe/Tallinn' })}
    `.trim();
    
    console.log('📧 Admin notification:', message);
    
    // TODO: Implement actual notification (Telegram or Email)
    // For Telegram:
    // const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    // const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    // await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    //     chat_id: TELEGRAM_CHAT_ID,
    //     text: message
    // });
    
    // For Email (using nodemailer):
    // const transporter = nodemailer.createTransport({ ... });
    // await transporter.sendMail({
    //     from: 'noreply@kontrollitud.ee',
    //     to: process.env.ADMIN_EMAIL,
    //     subject: 'Новая компания добавлена',
    //     text: message
    // });
}

// Function to activate 30-day trial period for new companies
function activateTrial(companyData) {
    const now = new Date();
    const trialEndDate = new Date(now);
    trialEndDate.setDate(trialEndDate.getDate() + 30); // 30 days from now
    
    return {
        ...companyData,
        subscriptionLevel: 'pro', // Upgrade to Pro during trial
        trialActive: true,
        trialStartDate: now,
        trialEndDate: trialEndDate,
        trialUsed: true, // Mark as used to prevent reactivation
        trialReminderSent: false,
        isVerified: true // Pro benefits include verified badge
    };
}

// Function to check if trial has expired and downgrade if needed
async function checkTrialExpiration(company) {
    if (!company.trialActive) {
        return company;
    }
    
    const now = new Date();
    if (now >= company.trialEndDate) {
        console.log(`⏰ Trial expired for ${company.name}, downgrading to basic`);
        
        // Downgrade to basic
        company.subscriptionLevel = 'basic';
        company.trialActive = false;
        company.isVerified = false;
        company.planDowngradedAt = now;
        
        await company.save();
        
        // Send expiration email
        await sendTrialExpirationEmail(company);
    }
    
    return company;
}

// Function to send trial expiration reminder (3 days before end)
async function sendTrialReminderEmail(company) {
    const transporter = getEmailTransporter();
    
    if (!transporter || !company.userEmail) {
        console.log(`⚠️ Cannot send trial reminder: transporter or email missing for ${company.name}`);
        return false;
    }
    
    const daysLeft = Math.ceil((company.trialEndDate - new Date()) / (1000 * 60 * 60 * 24));
    
    const message = {
        from: `"Kontrollitud.ee" <${process.env.SMTP_USER}>`,
        to: company.userEmail,
        subject: 'Ваш пробный период Pro заканчивается через 3 дня',
        html: `
            <h2>Привет, ${company.name}!</h2>
            <p>Ваш 30-дневный пробный период Pro заканчивается через <strong>${daysLeft} дня</strong>.</p>
            <p>Не упустите возможность продолжить использовать все преимущества Pro:</p>
            <ul>
                <li>✅ Приоритет в результатах поиска</li>
                <li>✅ Значок верификации</li>
                <li>✅ Выделение в каталоге</li>
                <li>✅ Расширенная аналитика</li>
            </ul>
            <p><a href="https://kontrollitud.ee/partners#pricing" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Перейти на Pro</a></p>
            <p>С уважением,<br>Команда Kontrollitud.ee</p>
        `
    };
    
    try {
        await transporter.sendMail(message);
        console.log(`✅ Trial reminder email sent to ${company.userEmail}`);
        
        // Mark reminder as sent
        company.trialReminderSent = true;
        await company.save();
        
        return true;
    } catch (error) {
        console.error(`❌ Error sending trial reminder email:`, error);
        return false;
    }
}

// Function to send trial expiration email
async function sendTrialExpirationEmail(company) {
    const transporter = getEmailTransporter();
    
    if (!transporter || !company.userEmail) {
        return false;
    }
    
    const message = {
        from: `"Kontrollitud.ee" <${process.env.SMTP_USER}>`,
        to: company.userEmail,
        subject: 'Ваш пробный период Pro завершился',
        html: `
            <h2>Привет, ${company.name}!</h2>
            <p>Ваш 30-дневный пробный период Pro завершился.</p>
            <p>Ваша компания была переведена на базовый тариф.</p>
            <p>Чтобы вернуть все преимущества Pro, выберите подходящий тариф:</p>
            <p><a href="https://kontrollitud.ee/partners#pricing" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Выбрать тариф</a></p>
            <p>С уважением,<br>Команда Kontrollitud.ee</p>
        `
    };
    
    try {
        await transporter.sendMail(message);
        console.log(`✅ Trial expiration email sent to ${company.userEmail}`);
        return true;
    } catch (error) {
        console.error(`❌ Error sending trial expiration email:`, error);
        return false;
    }
}

// Function to normalize company name (fix excessive CAPS)
function normalizeName(name) {
    if (!name) return name;
    
    const trimmedName = name.trim();
    
    // Check if name is ALL CAPS (more than 80% uppercase letters)
    const uppercaseCount = (trimmedName.match(/[A-ZА-ЯÄÖÜÕ]/g) || []).length;
    const letterCount = (trimmedName.match(/[A-Za-zА-Яа-яÄäÖöÜüÕõ]/g) || []).length;
    
    if (letterCount > 0 && (uppercaseCount / letterCount) > 0.8) {
        // Convert to title case: first letter of each word capitalized
        const normalized = trimmedName
            .toLowerCase()
            .split(' ')
            .map(word => {
                if (word.length === 0) return word;
                // Capitalize first letter, keep rest lowercase
                return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join(' ');
        
        console.log(`📝 Normalized name from "${trimmedName}" to "${normalized}"`);
        return normalized;
    }
    
    return trimmedName;
}

// Function to remove excessive punctuation (max 3 consecutive ! or ?)
function removeExcessivePunctuation(text) {
    if (!text) return text;
    
    // Replace 4+ consecutive exclamation marks with 3
    let cleaned = text.replace(/!{4,}/g, '!!!');
    
    // Replace 4+ consecutive question marks with 3
    cleaned = cleaned.replace(/\?{4,}/g, '???');
    
    // Replace 4+ consecutive dots with 3
    cleaned = cleaned.replace(/\.{4,}/g, '...');
    
    // Log if changes were made
    if (cleaned !== text) {
        console.log(`✂️ Removed excessive punctuation from: "${text.substring(0, 50)}..." to "${cleaned.substring(0, 50)}..."`);
    }
    
    return cleaned;
}

// Function to validate and sanitize business data
function validateAndSanitizeBusinessData(data) {
    const sanitized = { ...data };
    
    // 1. Normalize company name (fix CAPS)
    if (sanitized.name) {
        sanitized.name = normalizeName(sanitized.name);
        sanitized.name = removeExcessivePunctuation(sanitized.name);
    }
    
    // 2. Clean description
    if (sanitized.description) {
        if (typeof sanitized.description === 'string') {
            sanitized.description = removeExcessivePunctuation(sanitized.description);
        } else if (typeof sanitized.description === 'object') {
            // Handle multilingual descriptions
            if (sanitized.description.et) {
                sanitized.description.et = removeExcessivePunctuation(sanitized.description.et);
            }
            if (sanitized.description.en) {
                sanitized.description.en = removeExcessivePunctuation(sanitized.description.en);
            }
            if (sanitized.description.ru) {
                sanitized.description.ru = removeExcessivePunctuation(sanitized.description.ru);
            }
        }
    }
    
    // 3. Clean other text fields
    if (sanitized.reviewerName) {
        sanitized.reviewerName = removeExcessivePunctuation(sanitized.reviewerName);
    }
    
    return sanitized;
}

// EMAIL TRANSPORTER SETUP
let emailTransporter = null;

function getEmailTransporter() {
    if (!emailTransporter && process.env.SMTP_HOST && process.env.SMTP_USER) {
        emailTransporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
        console.log('✅ Email transporter configured');
    }
    return emailTransporter;
}

// Function to send subscription expiration reminder email
async function sendExpirationReminderEmail(company) {
    const transporter = getEmailTransporter();
    
    if (!transporter || !company.userEmail) {
        console.log(`⚠️ Cannot send reminder: transporter or email missing for ${company.name}`);
        return false;
    }
    
    const daysLeft = Math.ceil((company.planExpiresAt - new Date()) / (1000 * 60 * 60 * 24));
    
    const message = {
        from: `"Kontrollitud.ee" <${process.env.SMTP_USER}>`,
        to: company.userEmail,
        subject: `⏰ Ваша подписка ${company.subscriptionLevel.toUpperCase()} скоро закончится`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #f59e0b;">⏰ Напоминание о подписке</h2>
                <p>Здравствуйте!</p>
                <p>Ваша подписка <strong>${company.subscriptionLevel.toUpperCase()}</strong> для компании <strong>${company.name}</strong> истекает через <strong>${daysLeft} ${daysLeft === 1 ? 'день' : daysLeft < 5 ? 'дня' : 'дней'}</strong>.</p>
                
                <h3>Что произойдет после истечения:</h3>
                <ul>
                    <li>План автоматически изменится на <strong>Basic (бесплатный)</strong></li>
                    <li>Фотографии компании будут удалены</li>
                    <li>Ссылки на социальные сети будут скрыты</li>
                    <li>Значки верификации будут сняты</li>
                    ${company.subscriptionLevel === 'enterprise' ? '<li>Ссылка на блог будет удалена</li>' : ''}
                </ul>
                
                <p>Чтобы продлить подписку и сохранить все функции, пожалуйста, свяжитесь с нами.</p>
                
                <p style="margin-top: 30px;">
                    <a href="mailto:support@kontrollitud.ee" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Продлить подписку</a>
                </p>
                
                <p style="color: #6b7280; font-size: 0.875rem; margin-top: 30px;">
                    С уважением,<br>
                    Команда Kontrollitud.ee
                </p>
            </div>
        `
    };
    
    try {
        await transporter.sendMail(message);
        console.log(`📧 Reminder sent to ${company.userEmail} for ${company.name} (${daysLeft} days left)`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to send reminder to ${company.userEmail}:`, error.message);
        return false;
    }
}

// Function to send subscription expired notification
async function sendExpiredNotificationEmail(company) {
    const transporter = getEmailTransporter();
    
    if (!transporter || !company.userEmail) {
        console.log(`⚠️ Cannot send expiration notice: transporter or email missing for ${company.name}`);
        return false;
    }
    
    const message = {
        from: `"Kontrollitud.ee" <${process.env.SMTP_USER}>`,
        to: company.userEmail,
        subject: `❌ Ваша подписка ${company.subscriptionLevel.toUpperCase()} истекла`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #ef4444;">❌ Подписка истекла</h2>
                <p>Здравствуйте!</p>
                <p>Ваша подписка <strong>${company.subscriptionLevel.toUpperCase()}</strong> для компании <strong>${company.name}</strong> истекла.</p>
                
                <h3>Что изменилось:</h3>
                <ul>
                    <li>План автоматически изменен на <strong>Basic (бесплатный)</strong></li>
                    <li>Фотографии компании удалены</li>
                    <li>Ссылки на социальные сети скрыты</li>
                    <li>Значки верификации сняты</li>
                    ${company.subscriptionLevel === 'enterprise' ? '<li>Ссылка на блог удалена</li>' : ''}
                </ul>
                
                <p>Вы можете продолжать использовать <strong>Basic план</strong> бесплатно или обновить подписку для восстановления всех функций.</p>
                
                <p style="margin-top: 30px;">
                    <a href="mailto:support@kontrollitud.ee" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Обновить подписку</a>
                </p>
                
                <p style="color: #6b7280; font-size: 0.875rem; margin-top: 30px;">
                    С уважением,<br>
                    Команда Kontrollitud.ee
                </p>
            </div>
        `
    };
    
    try {
        await transporter.sendMail(message);
        console.log(`📧 Expiration notice sent to ${company.userEmail} for ${company.name}`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to send expiration notice to ${company.userEmail}:`, error.message);
        return false;
    }
}

// Function to downgrade expired subscriptions
async function downgradeExpiredSubscriptions() {
    const now = new Date();
    
    try {
        // Find all companies with expired paid plans
        const expiredCompanies = await Company.find({
            subscriptionLevel: { $in: ['pro', 'enterprise'] },
            planExpiresAt: { $lt: now }
        });
        
        console.log(`🔍 Found ${expiredCompanies.length} expired subscriptions`);
        
        for (const company of expiredCompanies) {
            const oldPlan = company.subscriptionLevel;
            
            // Downgrade to basic
            company.subscriptionLevel = 'basic';
            company.isVerified = false;
            company.planDowngradedAt = now;
            company.planReminderSent = false; // Reset for next subscription cycle
            
            // Clear paid-tier-only fields
            company.image = null;
            company.tiktokUrl = null;
            company.instagramUrl = null;
            company.youtubeUrl = null;
            company.blogArticleUrl = null;
            
            await company.save();
            
            console.log(`⬇️ Downgraded ${company.name} from ${oldPlan} to basic`);
            
            // Send notification email
            await sendExpiredNotificationEmail(company);
        }
        
        return expiredCompanies.length;
    } catch (error) {
        console.error('❌ Error downgrading expired subscriptions:', error);
        return 0;
    }
}

// Function to send 3-day expiration reminders
async function sendExpirationReminders() {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 4);
    
    try {
        // Find companies with plans expiring in 3 days that haven't received reminder
        const companiesNeedingReminder = await Company.find({
            subscriptionLevel: { $in: ['pro', 'enterprise'] },
            planExpiresAt: {
                $gte: threeDaysFromNow,
                $lt: tomorrow
            },
            planReminderSent: { $ne: true }
        });
        
        console.log(`🔔 Found ${companiesNeedingReminder.length} companies needing expiration reminders`);
        
        for (const company of companiesNeedingReminder) {
            const reminderSent = await sendExpirationReminderEmail(company);
            
            if (reminderSent) {
                company.planReminderSent = true;
                await company.save();
            }
        }
        
        return companiesNeedingReminder.length;
    } catch (error) {
        console.error('❌ Error sending expiration reminders:', error);
        return 0;
    }
}

// Main subscription check function
async function checkSubscriptions() {
    console.log('\n⏰ Starting daily subscription check...');
    const startTime = Date.now();
    
    // Step 1: Send 3-day reminders
    const remindersCount = await sendExpirationReminders();
    
    // Step 2: Downgrade expired subscriptions
    const downgradedCount = await downgradeExpiredSubscriptions();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Subscription check complete in ${duration}s: ${remindersCount} reminders sent, ${downgradedCount} plans downgraded\n`);
}

// 2. СХЕМА ДАННЫХ (Определяем, как выглядит компания)
const companySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    slug: {
        type: String,
        unique: true,
        sparse: true // Allow null values while maintaining uniqueness for non-null
    },
    phone: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true 
    },
    // Legacy category field - kept for backward compatibility
    category: { 
        type: String, 
        enum: [
            // Old categories
            'SPA', 'Restaurants', 'Shops', 'Kids', 'Travel', 'Auto', 'Services',
            // Puhkus (Rest) subcategories
            'Hotellid', 'Camping', 'Kuurordid', 'Wellness',
            // Toit (Food) subcategories
            'Restoranid', 'Kohvikud', 'Kiirtoitlustus', 'Baarid',
            // Auto subcategories
            'Autoteenus', 'Autopesu', 'Varuosad', 'Rehviteenus', 'Autopuhastus',
            // Teenused (Services) subcategories
            'Koristus', 'Remont', 'Õigusteenused', 'Konsultatsioonid', 'IT teenused',
            // Ilu (Beauty) subcategories
            'Juuksurid', 'Küünesalongid', 'Kosmeetika', 'Massaaž', 'Barbershops',
            // Ostlemine (Shopping) subcategories
            'Poed', 'Kaubanduskeskused', 'Butiigid', 'Turud', 'E-poed',
            // Lapsed (Kids) subcategories
            'Mänguväljakud', 'Lasteaiad', 'Laste tegevused', 'Mänguasja poed', 'Haridus',
            // Reisimine (Travel) subcategories
            'Reisibürood', 'Ekskursioonid', 'Autorent', 'Giidid', 'Transport',
            // Legacy values for backward compatibility
            'Hotels', 'Resorts', 'Wellness Centers', 'Cafes', 'Fast Food', 
            'Fine Dining', 'Bakeries', 'Malls', 'Boutiques', 'Markets', 'Online Stores',
            'Playgrounds', 'Daycare', 'Kids Activities', 'Toy Stores', 'Education',
            'Travel Agencies', 'Tours', 'Car Rental', 'Guides',
            'Car Service', 'Car Wash', 'Parts', 'Tire Service', 'Detailing',
            'Cleaning', 'Repair', 'Legal', 'Consulting', 'IT Services',
            'Hair Salons', 'Nail Salons', 'Makeup', 'Cosmetics',
            'Clinics', 'Dentists', 'Pharmacy', 'Medical Labs', 'Therapy',
            'Cinema', 'Theaters', 'Clubs', 'Events', 'Museums'
        ]
    },
    // New multi-level category system
    mainCategory: {
        type: String,
        enum: ['Puhkus', 'Toit', 'Auto', 'Teenused', 'Ilu', 'Ostlemine', 'Lapsed', 'Reisimine']
    },
    subCategory: {
        type: String
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
    // Blog article URL (for enterprise tier)
    blogArticleUrl: {
        type: String
    },
    // Subscription and approval
    subscriptionLevel: {
        type: String,
        enum: ['basic', 'pro', 'enterprise'],
        default: 'basic'
    },
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'pending_payment'],
        default: 'pending'
    },
    rejectionReason: {
        type: String // Reason for automatic rejection (e.g., "blacklist")
    },
    paymentConfirmedAt: {
        type: Date // When payment was confirmed for pro/enterprise
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
    // Subscription management
    planExpiresAt: {
        type: Date // When the current paid plan expires
    },
    planReminderSent: {
        type: Boolean,
        default: false // Track if 3-day reminder was sent
    },
    planDowngradedAt: {
        type: Date // When plan was auto-downgraded to basic
    },
    // Trial period management
    trialActive: {
        type: Boolean,
        default: false // Is trial period currently active
    },
    trialStartDate: {
        type: Date // When trial started
    },
    trialEndDate: {
        type: Date // When trial expires
    },
    trialUsed: {
        type: Boolean,
        default: false // Has company used trial before (prevent reactivation)
    },
    trialReminderSent: {
        type: Boolean,
        default: false // Track if 3-day trial ending reminder was sent
    },
    // Stripe payment fields
    stripeSessionId: {
        type: String // Checkout session ID
    },
    stripeSubscriptionId: {
        type: String // Subscription ID for recurring payments
    },
    stripeCustomerId: {
        type: String // Customer ID in Stripe
    },
    // View statistics
    views: {
        type: Number,
        default: 0 // Total views all time
    },
    weeklyViews: [{
        date: Date, // Date of view
        count: { type: Number, default: 1 } // Count of views that day
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Company = mongoose.model('Company', companySchema);

// ===== PAYMENT ROUTES SETUP =====
// Import and initialize payment routes
const { initializePaymentRoutes } = require('./routes/payment');
const paymentRouter = initializePaymentRoutes(Company);

// Mount payment routes (must be before other middleware for webhook)
app.use('/api', paymentRouter);

// ===== HELPER FUNCTIONS =====

/**
 * Generate URL-friendly slug from company name
 * @param {string} name - Company name
 * @returns {string} - URL-friendly slug
 */
function generateSlug(name) {
    return name
        .toLowerCase()
        .trim()
        // Replace Estonian characters
        .replace(/ä/g, 'a')
        .replace(/ö/g, 'o')
        .replace(/ü/g, 'u')
        .replace(/õ/g, 'o')
        .replace(/š/g, 's')
        .replace(/ž/g, 'z')
        // Replace spaces and special characters with hyphens
        .replace(/[^a-z0-9]+/g, '-')
        // Remove leading/trailing hyphens
        .replace(/^-+|-+$/g, '');
}

// ===== ROUTES =====

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
        // Search across: name, category, subcategory, mainCategory, and all description languages
        if (req.query.search) {
            const searchRegex = { $regex: req.query.search, $options: 'i' };
            filter.$or = [
                { name: searchRegex },
                { category: searchRegex },
                { mainCategory: searchRegex },
                { subCategory: searchRegex },
                { 'description.et': searchRegex },
                { 'description.en': searchRegex },
                { 'description.ru': searchRegex }
            ];
        }

        // 3. Добавляем фильтр по категории
        if (req.query.category && req.query.category !== 'Все') {
            filter.category = req.query.category;
        }

        // 3b. Добавляем фильтр по основной категории (mainCategory)
        if (req.query.mainCategory && req.query.mainCategory !== 'Все') {
            filter.mainCategory = req.query.mainCategory;
        }

        // 3c. Добавляем фильтр по подкатегории (subCategory)
        if (req.query.subCategory && req.query.subCategory !== 'Все') {
            filter.subCategory = req.query.subCategory;
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
        
        // Сортируем компании по уровню подписки: enterprise -> pro -> basic
        const subscriptionPriority = {
            'enterprise': 3,
            'pro': 2,
            'basic': 1
        };
        
        companies.sort((a, b) => {
            const priorityA = subscriptionPriority[a.subscriptionLevel] || 0;
            const priorityB = subscriptionPriority[b.subscriptionLevel] || 0;
            return priorityB - priorityA;
        });
        
        res.json(companies);

    } catch (error) {
        console.error("Ошибка при получении компаний:", error);
        res.status(500).json({ error: 'Не удалось загрузить данные компаний.' });
    }
});

// GET /api/companies/:id - Получить компанию по ID или slug
app.get('/api/companies/:id', async (req, res) => {
    try {
        let company;
        
        // Try to find by slug first, then by ID
        if (req.params.id.includes('-')) {
            // Likely a slug (contains hyphens)
            company = await Company.findOne({ slug: req.params.id });
        }
        
        // If not found by slug or doesn't look like a slug, try by ID
        if (!company) {
            company = await Company.findById(req.params.id);
        }
        
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


// 🔒 PRODUCTION: Закомментировано для безопасности. Раскомментируйте только для локального тестирования.
// Дополнительный маршрут для добавления тестовых данных (seed)
/*
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
*/

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
// 🟢 AUTOMATED MODERATION: Validation + Blacklist check + auto-approval
app.post('/api/companies', async (req, res) => {
    try {
        // 🟢 SECURITY: Не позволяем пользователю устанавливать статус вручную
        const { status, approvalStatus, ...safeData } = req.body;
        
        // 📝 STEP 0: Validate and sanitize data (fix CAPS, remove excessive punctuation)
        const sanitizedData = validateAndSanitizeBusinessData(safeData);
        
        // Generate slug from sanitized company name
        const slug = generateSlug(sanitizedData.name);
        
        // 🚫 STEP 1: Check blacklist (name + description)
        const nameCheck = containsBlacklistedWords(sanitizedData.name);
        const descCheck = containsBlacklistedWords(
            typeof sanitizedData.description === 'string' 
                ? sanitizedData.description 
                : JSON.stringify(sanitizedData.description)
        );
        
        if (nameCheck || descCheck) {
            console.log(`🚫 Company rejected due to blacklist: ${sanitizedData.name}`);
            
            // Auto-reject if blacklisted words found
            const companyData = { 
                ...sanitizedData, 
                slug,
                approvalStatus: 'rejected',
                rejectionReason: 'Содержит запрещенные слова или спам-паттерны'
            };
            
            const newCompany = new Company(companyData);
            const savedCompany = await newCompany.save();
            
            return res.status(400).json({ 
                error: 'Заявка отклонена: содержит недопустимый контент',
                company: savedCompany
            });
        }
        
        // ✅ STEP 2: Auto-approval logic based on subscription level
        const subscriptionLevel = sanitizedData.subscriptionLevel || 'basic';
        let finalApprovalStatus = 'pending';
        let isVerified = false;
        let companyData = { ...sanitizedData, slug };
        
        if (subscriptionLevel === 'basic') {
            // ✅ Basic tier: Auto-approve and activate 30-day Pro trial
            finalApprovalStatus = 'approved';
            
            // 🎁 Activate 30-day trial for new companies
            companyData = activateTrial(companyData);
            
            console.log(`✅ Basic company auto-approved with 30-day Pro trial: ${sanitizedData.name}`);
            
            // Send notification to admin with sanitized name
            await sendAdminNotification(sanitizedData.name, 'approved', 'basic (30-day Pro trial)');
            
        } else if (subscriptionLevel === 'pro' || subscriptionLevel === 'enterprise') {
            // 💰 Paid tiers: Set to pending_payment (will be approved after payment webhook)
            finalApprovalStatus = 'pending_payment';
            isVerified = false; // Will be set to true after payment
            console.log(`💰 ${subscriptionLevel} company set to pending_payment: ${sanitizedData.name}`);
        }
        
        // Set final approval status
        companyData.approvalStatus = finalApprovalStatus;
        if (!companyData.hasOwnProperty('isVerified')) {
            companyData.isVerified = isVerified;
        }
        
        const newCompany = new Company(companyData);
        const savedCompany = await newCompany.save();
        
        // Success response
        res.status(201).json({
            success: true,
            message: finalApprovalStatus === 'approved' 
                ? 'Компания автоматически одобрена и опубликована!' 
                : 'Заявка принята. Ожидает оплаты.',
            company: savedCompany,
            approvalStatus: finalApprovalStatus
        });
        
    } catch (error) {
        console.error('Error creating company:', error);
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
// 🟢 AUTOMATED MODERATION: Validation + Blacklist check + auto-approval
app.post('/api/business-submission', verifyToken, async (req, res) => {
    try {
        // Get subscription level from request (set by user in AddBusiness form)
        const subscriptionLevel = req.body.subscriptionLevel || req.body.plan || 'basic';
        
        // 📝 STEP 0: Validate and sanitize data
        const sanitizedData = validateAndSanitizeBusinessData(req.body);
        
        // 🚫 STEP 1: Check blacklist
        const nameCheck = containsBlacklistedWords(sanitizedData.name);
        const descCheck = containsBlacklistedWords(
            typeof sanitizedData.description === 'string' 
                ? sanitizedData.description 
                : JSON.stringify(sanitizedData.description)
        );
        
        if (nameCheck || descCheck) {
            console.log(`🚫 Business submission rejected due to blacklist: ${sanitizedData.name}`);
            
            return res.status(400).json({ 
                error: 'Заявка отклонена: содержит недопустимый контент или спам-паттерны',
                reason: 'blacklist'
            });
        }
        
        // ✅ STEP 2: Auto-approval logic
        let approvalStatus = 'pending';
        let isVerified = false;
        
        if (subscriptionLevel === 'basic') {
            // Basic: Auto-approve
            approvalStatus = 'approved';
            console.log(`✅ Basic business auto-approved: ${sanitizedData.name}`);
            await sendAdminNotification(sanitizedData.name, 'approved', 'basic');
            
        } else if (subscriptionLevel === 'pro' || subscriptionLevel === 'enterprise') {
            // Paid tiers: Pending payment
            approvalStatus = 'pending_payment';
            console.log(`💰 ${subscriptionLevel} business pending payment: ${sanitizedData.name}`);
        }
        
        // Prepare business data with sanitized fields
        const businessData = {
            ...sanitizedData,
            userId: req.user.uid,
            userEmail: req.user.email,
            approvalStatus,
            subscriptionLevel,
            isVerified
        };
        
        // If category is not provided but subCategory is, use subCategory as category
        if (!businessData.category && businessData.subCategory) {
            businessData.category = businessData.subCategory;
        }
        
        const newBusiness = new Company(businessData);
        const savedBusiness = await newBusiness.save();
        
        res.status(201).json({ 
            success: true,
            message: approvalStatus === 'approved'
                ? 'Ваш бизнес автоматически одобрен и опубликован!'
                : approvalStatus === 'pending_payment'
                ? 'Заявка принята. Ожидает подтверждения оплаты.'
                : 'Заявка отправлена на модерацию.',
            business: savedBusiness,
            approvalStatus
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
            subscriptionLevel: subscriptionLevel || 'basic'
        };
        
        // If upgrading to pro or enterprise, mark as verified
        if (subscriptionLevel === 'pro' || subscriptionLevel === 'enterprise') {
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

// PATCH /api/companies/:id/extend-subscription - Extend/renew company subscription
app.patch('/api/companies/:id/extend-subscription', async (req, res) => {
    try {
        const { months, plan } = req.body;
        const companyId = req.params.id;
        
        if (!months || !plan) {
            return res.status(400).json({ error: 'months and plan are required' });
        }
        
        if (!['basic', 'pro', 'enterprise'].includes(plan)) {
            return res.status(400).json({ error: 'Invalid plan. Must be: basic, pro, or enterprise' });
        }
        
        const company = await Company.findById(companyId);
        
        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }
        
        // Calculate new expiry date
        const currentExpiry = company.planExpiresAt || new Date();
        const newExpiry = new Date(currentExpiry);
        newExpiry.setMonth(newExpiry.getMonth() + months);
        
        // Update subscription
        company.subscriptionLevel = plan;
        company.planExpiresAt = newExpiry;
        company.planReminderSent = false; // Reset reminder flag
        
        // If upgrading to paid plan, mark as verified
        if (plan === 'pro' || plan === 'enterprise') {
            company.isVerified = true;
        }
        
        await company.save();
        
        console.log(`✅ Subscription extended: ${company.name} → ${plan} until ${newExpiry.toLocaleDateString()}`);
        
        res.json({ 
            success: true,
            message: `Subscription extended for ${months} months`,
            company: {
                id: company._id,
                name: company.name,
                subscriptionLevel: company.subscriptionLevel,
                planExpiresAt: company.planExpiresAt,
                newExpiry: newExpiry
            }
        });
    } catch (error) {
        console.error("Error extending subscription:", error);
        res.status(400).json({ error: error.message });
    }
});

// 🧪 TEST ENDPOINT: Set expired date for testing (for testing only)
app.patch('/api/admin/test-set-expired/:id', async (req, res) => {
    try {
        const { daysAgo, plan } = req.body;
        const companyId = req.params.id;
        
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }
        
        // Set expiry date in the past
        const expiredDate = new Date();
        expiredDate.setDate(expiredDate.getDate() - (daysAgo || 3));
        
        company.subscriptionLevel = plan || 'pro';
        company.planExpiresAt = expiredDate;
        company.isVerified = true;
        company.planReminderSent = false;
        company.approvalStatus = 'approved';
        
        await company.save();
        
        console.log(`🧪 TEST: Set ${company.name} to expired ${plan || 'pro'} (${daysAgo || 3} days ago)`);
        
        res.json({ 
            success: true,
            message: 'Company updated for testing',
            company: {
                name: company.name,
                subscriptionLevel: company.subscriptionLevel,
                planExpiresAt: company.planExpiresAt,
                isVerified: company.isVerified
            }
        });
    } catch (error) {
        console.error('❌ Error setting test data:', error);
        res.status(500).json({ error: error.message });
    }
});

// 🧪 TEST ENDPOINT: Manual subscription check (for testing only)
app.get('/api/admin/test-subscription-check', async (req, res) => {
    try {
        console.log('🧪 Manual subscription check triggered via API');
        await checkSubscriptions();
        res.json({ 
            success: true,
            message: 'Subscription check completed. Check server logs for details.'
        });
    } catch (error) {
        console.error('❌ Error during manual subscription check:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
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

// POST /api/companies/:id/view - Track company view
app.post('/api/companies/:id/view', async (req, res) => {
    try {
        const { id } = req.params;
        
        const company = await Company.findById(id);
        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }
        
        // Increment total views
        company.views = (company.views || 0) + 1;
        
        // Track weekly views
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of day
        
        // Find or create entry for today
        const todayEntry = company.weeklyViews.find(entry => {
            const entryDate = new Date(entry.date);
            entryDate.setHours(0, 0, 0, 0);
            return entryDate.getTime() === today.getTime();
        });
        
        if (todayEntry) {
            todayEntry.count += 1;
        } else {
            company.weeklyViews.push({ date: today, count: 1 });
        }
        
        // Keep only last 7 days
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        company.weeklyViews = company.weeklyViews.filter(entry => 
            new Date(entry.date) >= weekAgo
        );
        
        await company.save();
        
        res.json({ success: true, views: company.views });
    } catch (error) {
        console.error("Error tracking view:", error);
        res.status(500).json({ error: 'Failed to track view' });
    }
});

// PUT /api/user/companies/:id - Update user's company
app.put('/api/user/companies/:id', verifyToken, upload.single('logo'), async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;
        
        // Find company and verify ownership
        const company = await Company.findById(id);
        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }
        
        if (company.userId !== userId) {
            return res.status(403).json({ error: 'You can only edit your own companies' });
        }
        
        // Parse JSON fields from form data
        const updateData = {};
        
        // Simple text fields
        if (req.body.name) updateData.name = req.body.name;
        if (req.body.phone) updateData.phone = req.body.phone;
        if (req.body.email) updateData.email = req.body.email;
        if (req.body.website) updateData.website = req.body.website;
        if (req.body.instagramUrl) updateData.instagramUrl = req.body.instagramUrl;
        if (req.body.tiktokUrl) updateData.tiktokUrl = req.body.tiktokUrl;
        if (req.body.youtubeUrl) updateData.youtubeUrl = req.body.youtubeUrl;
        if (req.body.subscriptionLevel) updateData.subscriptionLevel = req.body.subscriptionLevel;
        
        // Multi-language description
        if (req.body.description) {
            try {
                updateData.description = JSON.parse(req.body.description);
            } catch (e) {
                // If not JSON, treat as single language
                updateData.description = {
                    et: req.body.description,
                    en: req.body.description,
                    ru: req.body.description
                };
            }
        }
        
        // Working hours
        if (req.body.workingHours) {
            try {
                updateData.workingHours = JSON.parse(req.body.workingHours);
            } catch (e) {
                console.error('Error parsing workingHours:', e);
            }
        }
        
        // Handle logo upload
        if (req.file) {
            try {
                const b64 = Buffer.from(req.file.buffer).toString('base64');
                const dataURI = `data:${req.file.mimetype};base64,${b64}`;
                
                const uploadResult = await cloudinary.uploader.upload(dataURI, {
                    folder: 'kontrollitud',
                    resource_type: 'auto',
                    format: 'webp',
                    transformation: [
                        { width: 400, height: 400, crop: 'limit', quality: 'auto:good' },
                        { fetch_format: 'auto' }
                    ]
                });
                
                updateData.image = uploadResult.secure_url;
            } catch (uploadError) {
                console.error('Error uploading logo:', uploadError);
                return res.status(500).json({ error: 'Failed to upload logo' });
            }
        }
        
        // Update company
        const updatedCompany = await Company.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );
        
        res.json({ 
            success: true, 
            message: 'Company updated successfully',
            company: updatedCompany 
        });
    } catch (error) {
        console.error("Error updating company:", error);
        res.status(500).json({ error: 'Failed to update company' });
    }
});

// DELETE /api/user/companies/:id - Delete user's company
app.delete('/api/user/companies/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;
        
        // Find company and verify ownership
        const company = await Company.findById(id);
        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }
        
        if (company.userId !== userId) {
            return res.status(403).json({ error: 'You can only delete your own companies' });
        }
        
        // Delete company
        await Company.findByIdAndDelete(id);
        
        res.json({ 
            success: true, 
            message: 'Company deleted successfully' 
        });
    } catch (error) {
        console.error("Error deleting company:", error);
        res.status(500).json({ error: 'Failed to delete company' });
    }
});

// POST /api/admin/login - Simple admin authentication
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminPassword) {
        return res.status(500).json({ 
            success: false, 
            message: 'Admin password not configured. Set ADMIN_PASSWORD in .env file.' 
        });
    }
    
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

// 🔔 POST /api/webhooks/payment - Webhook for payment confirmation
// This endpoint will be called by your payment provider (Stripe, PayPal, etc.)
app.post('/api/webhooks/payment', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        // TODO: Verify webhook signature from payment provider
        // For Stripe: stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
        // For PayPal: verify signature according to PayPal docs
        
        const paymentData = req.body;
        
        console.log('💳 Payment webhook received:', paymentData);
        
        // Extract company ID and payment status from webhook
        // Structure depends on your payment provider
        const { companyId, status, amount, subscriptionLevel } = paymentData;
        
        if (status === 'succeeded' || status === 'completed') {
            // Find company by ID
            const company = await Company.findById(companyId);
            
            if (!company) {
                console.error(`❌ Company not found: ${companyId}`);
                return res.status(404).json({ error: 'Company not found' });
            }
            
            // Check if company was waiting for payment
            if (company.approvalStatus !== 'pending_payment') {
                console.warn(`⚠️ Company ${companyId} not in pending_payment status`);
                return res.status(400).json({ error: 'Company not awaiting payment' });
            }
            
            // ✅ Auto-approve after successful payment
            company.approvalStatus = 'approved';
            company.isVerified = true;
            company.paymentConfirmedAt = new Date();
            
            await company.save();
            
            console.log(`✅ Company auto-approved after payment: ${company.name} (${subscriptionLevel})`);
            
            // Send notification to admin
            await sendAdminNotification(
                company.name, 
                'approved', 
                company.subscriptionLevel
            );
            
            res.json({ 
                success: true, 
                message: 'Payment confirmed and company approved',
                company 
            });
            
        } else {
            console.log(`💳 Payment failed or pending for company: ${companyId}`);
            res.json({ 
                success: false, 
                message: 'Payment not completed' 
            });
        }
        
    } catch (error) {
        console.error('❌ Error processing payment webhook:', error);
        res.status(500).json({ error: error.message });
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
                    { width: 1200, height: 800, crop: 'limit', quality: 'auto:good' },
                    { fetch_format: 'auto' }
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

// Function to check trial periods daily
async function checkTrialPeriods() {
    try {
        const now = new Date();
        const threeDaysFromNow = new Date(now);
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        
        // Find all companies with active trial
        const companiesWithTrial = await Company.find({ trialActive: true });
        
        console.log(`📋 Found ${companiesWithTrial.length} companies with active trial period`);
        
        for (const company of companiesWithTrial) {
            // Check if trial has expired
            if (now >= company.trialEndDate) {
                console.log(`⏰ Trial expired for ${company.name}, downgrading to basic`);
                
                company.subscriptionLevel = 'basic';
                company.trialActive = false;
                company.isVerified = false;
                company.planDowngradedAt = now;
                
                await company.save();
                await sendTrialExpirationEmail(company);
                
            } else if (
                now >= threeDaysFromNow && 
                company.trialEndDate <= threeDaysFromNow && 
                !company.trialReminderSent
            ) {
                // Send 3-day reminder
                console.log(`📧 Sending 3-day trial reminder to ${company.name}`);
                await sendTrialReminderEmail(company);
            }
        }
        
        console.log('✅ Trial period check completed');
    } catch (error) {
        console.error('❌ Error during trial period check:', error);
    }
}

// 🕐 CRON JOB: Daily subscription check at 3:00 AM
// Schedule: '0 3 * * *' = Every day at 3:00 AM (Europe/Tallinn timezone)
// For testing: '*/5 * * * *' = Every 5 minutes
// For testing: '* * * * *' = Every minute
// For testing: '0 * * * *' = Every hour

// Daily check for trial period expiration and reminders
cron.schedule('0 2 * * *', async () => {
    console.log('⏰ Cron job triggered: Daily trial period check');
    await checkTrialPeriods();
}, {
    scheduled: true,
    timezone: "Europe/Tallinn"
});

// Daily check for subscriptions
cron.schedule('0 3 * * *', async () => {
    console.log('⏰ Cron job triggered: Daily subscription check');
    await checkSubscriptions();
}, {
    scheduled: true,
    timezone: "Europe/Tallinn"
});

console.log('✅ Cron job scheduled: Trial period check at 2:00 AM (Europe/Tallinn)');
console.log('✅ Cron job scheduled: Daily subscription check at 3:00 AM (Europe/Tallinn)');

// Run initial check on server startup (optional, for testing)
if (process.env.RUN_SUBSCRIPTION_CHECK_ON_STARTUP === 'true') {
    setTimeout(async () => {
        console.log('🔄 Running initial subscription check on startup...');
        await checkSubscriptions();
    }, 5000); // Wait 5 seconds for DB connection
}

// 4. ЗАПУСК СЕРВЕРА
app.listen(PORT, () => {
    console.log(`🚀 Бэкенд запущен на http://localhost:${PORT}`);
});