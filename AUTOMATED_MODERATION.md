# Автоматизированная модерация заявок

## 🎯 Обзор системы

Система автоматической модерации обрабатывает новые заявки на добавление бизнеса по следующему алгоритму:

1. **Валидация и санитизация контента** → автоматическое исправление
2. **Проверка на черный список** → автоматическое отклонение
3. **Basic план** → автоматическое одобрение (если прошел проверку)
4. **Pro/Enterprise планы** → статус `pending_payment` → автоодобрение после оплаты
5. **Уведомления админу** о всех автоматически одобренных компаниях

---

## 📝 Валидация и санитизация контента

### Автоматические исправления:

#### 1. Нормализация КАПСА
**Проблема**: Название "ЛУЧШАЯ КОМПАНИЯ!!!"  
**Решение**: Автоматически преобразуется в "Лучшая Компания!!!"

- Проверяет, если более 80% букв в ВЕРХНЕМ РЕГИСТРЕ
- Применяет Title Case (первая буква каждого слова заглавная)
- Поддерживает эстонские символы (Ä, Ö, Ü, Õ)
- Логируется: `📝 Normalized name from "ЛУЧШАЯ КОМПАНИЯ" to "Лучшая Компания"`

```javascript
// Пример:
"КОНТОРА" → "Контора"
"BEST COMPANY" → "Best Company"
"PARIM ETTEVÕTE" → "Parim Ettevõte"
```

#### 2. Удаление избыточной пунктуации
**Проблема**: Название "Супер компания!!!!!!!!!!"  
**Решение**: Автоматически сокращается до "Супер компания!!!"

- Максимум 3 восклицательных знака подряд: `!!!!` → `!!!`
- Максимум 3 вопросительных знака подряд: `????` → `???`
- Максимум 3 точки подряд (многоточие): `....` → `...`
- Применяется к названию, описанию и другим текстовым полям
- Логируется: `✂️ Removed excessive punctuation from: "..."`

```javascript
// Примеры:
"Лучшая фирма!!!!!" → "Лучшая фирма!!!"
"Когда????" → "Когда???"
"Много текста....." → "Много текста..."
```

#### 3. Санитизация многоязычных описаний
- Обрабатывает описания на эстонском (et), английском (en), русском (ru)
- Применяет удаление избыточной пунктуации ко всем языкам
- Сохраняет структуру объекта описания

---

## 🚫 Черный список (Blacklist)

### Текущие категории запрещенных слов:

#### 1. Мат (Estonian)
- pask, sitt, kurat, vittu, persse, loll, idioot, türa

#### 2. Мат (Russian - распространен в Эстонии)
- блять, сука, хуй, пизда, ебать, мудак, дерьмо

#### 3. Мат (English)
- fuck, shit, bitch, asshole, damn, bastard, crap

#### 4. Scam/Мошенничество
- scam, fraud, fake, steal, cheat, ponzi, pyramid
- fast money, quick cash, get rich, easy money, free money
- casino online, gambling, bitcoin hack, crypto scam

#### 5. Spam-паттерны
- !!!!!! (6+ восклицательных знаков)
- AAAAAAA (6+ одинаковых символов подряд)
- $$$$$$, ###
- CLICK HERE, BUY NOW, LIMITED TIME
- 100% FREE, GUARANTEED, NO RISK

#### 6. Неприемлемый контент
- porn, sex, xxx, adult, escort, drugs, weapon

### Дополнительные проверки:

- **Повторяющиеся символы**: `/(.)\1{5,}/g` - более 6 одинаковых символов подряд
- **CAPS LOCK спам**: Более 70% заглавных букв в тексте длиннее 10 символов
- **Проверяются поля**: `name` (название) и `description` (описание)

### Как добавить новые слова:

Отредактируйте массив `blackListWords` в `backend/server.js`:

```javascript
const blackListWords = [
    // ... существующие слова
    'конкурент1', 
    'конкурент2',
    'ваше_запрещенное_слово'
];
```

---

## ✅ Логика авто-одобрения

### Basic план (бесплатный):
```
Подача заявки → Проверка черного списка → ✅ Автоматически APPROVED
                                       ↓
                         Уведомление админу в Telegram/Email
```

**Результат**: Компания сразу опубликована на сайте

### Pro план (€29/мес):
```
Подача заявки → Проверка черного списка → ⏳ Статус PENDING_PAYMENT
                                       ↓
                            Пользователь переходит к оплате
                                       ↓
                            Webhook от платежной системы
                                       ↓
                            ✅ Автоматически APPROVED + isVerified: true
                                       ↓
                            Уведомление админу
```

**Результат**: Компания опубликована после подтверждения оплаты

### Enterprise план (€50/мес):
```
Та же логика, что и Pro, но с дополнительными функциями:
- Золотая рамка и анимация
- Значок TOP Priority
- Кнопка для блога
```

---

## 🔔 Настройка уведомлений админу

### Вариант 1: Telegram Bot (рекомендуется)

#### Шаг 1: Создайте бота
1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте команду `/newbot`
3. Придумайте имя и username для бота
4. Скопируйте полученный токен (например: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

#### Шаг 2: Получите Chat ID
1. Откройте [@userinfobot](https://t.me/userinfobot)
2. Отправьте любое сообщение
3. Скопируйте ваш Chat ID (например: `987654321`)

#### Шаг 3: Установите зависимость
```bash
cd backend
npm install axios
```

#### Шаг 4: Добавьте в `.env`
```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=987654321
```

#### Шаг 5: Раскомментируйте код в `server.js`
```javascript
// В функции sendAdminNotification():
const axios = require('axios'); // Добавьте в начало файла

async function sendAdminNotification(companyName, action, subscriptionLevel) {
    const message = `
🔔 Новая компания автоматически ${action === 'approved' ? 'одобрена' : 'отклонена'}

📊 Название: ${companyName}
💰 План: ${subscriptionLevel}
⏰ Время: ${new Date().toLocaleString('et-EE', { timeZone: 'Europe/Tallinn' })}
    `.trim();
    
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
        try {
            await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                chat_id: TELEGRAM_CHAT_ID,
                text: message
            });
            console.log('✅ Telegram notification sent');
        } catch (error) {
            console.error('❌ Telegram notification failed:', error.message);
        }
    }
}
```

---

### Вариант 2: Email (через Nodemailer)

#### Шаг 1: Установите Nodemailer
```bash
cd backend
npm install nodemailer
```

#### Шаг 2: Добавьте в `.env`
```env
ADMIN_EMAIL=your-email@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

> **Важно для Gmail**: Используйте [App Password](https://support.google.com/accounts/answer/185833), а не обычный пароль

#### Шаг 3: Раскомментируйте код в `server.js`
```javascript
const nodemailer = require('nodemailer'); // Добавьте в начало файла

async function sendAdminNotification(companyName, action, subscriptionLevel) {
    const message = `
🔔 Новая компания автоматически ${action === 'approved' ? 'одобрена' : 'отклонена'}

📊 Название: ${companyName}
💰 План: ${subscriptionLevel}
⏰ Время: ${new Date().toLocaleString('et-EE', { timeZone: 'Europe/Tallinn' })}
    `.trim();
    
    if (process.env.ADMIN_EMAIL) {
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                secure: false,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });
            
            await transporter.sendMail({
                from: `"Kontrollitud.ee" <${process.env.SMTP_USER}>`,
                to: process.env.ADMIN_EMAIL,
                subject: `Новая компания автоматически ${action === 'approved' ? 'одобрена' : 'отклонена'}`,
                text: message
            });
            
            console.log('✅ Email notification sent');
        } catch (error) {
            console.error('❌ Email notification failed:', error.message);
        }
    }
}
```

---

## 💳 Webhook для платежей

### Endpoint: `POST /api/webhooks/payment`

Этот endpoint должен быть настроен в вашей платежной системе (Stripe, PayPal, и т.д.)

#### Для Stripe:

1. **Создайте Webhook** в [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. **URL**: `https://your-domain.com/api/webhooks/payment`
3. **События**: 
   - `payment_intent.succeeded`
   - `checkout.session.completed`

4. **Обработка в коде** (раскомментируйте в `server.js`):

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/webhooks/payment', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    if (event.type === 'payment_intent.succeeded' || event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        // Извлеките companyId из metadata
        const companyId = session.metadata.companyId;
        
        // Обновите компанию
        const company = await Company.findById(companyId);
        if (company && company.approvalStatus === 'pending_payment') {
            company.approvalStatus = 'approved';
            company.isVerified = true;
            company.paymentConfirmedAt = new Date();
            await company.save();
            
            await sendAdminNotification(company.name, 'approved', company.subscriptionLevel);
        }
    }
    
    res.json({ received: true });
});
```

#### Для PayPal:

1. **Настройте IPN/Webhooks** в [PayPal Dashboard](https://developer.paypal.com/)
2. **URL**: `https://your-domain.com/api/webhooks/payment`
3. **Проверьте подпись** согласно [PayPal документации](https://developer.paypal.com/docs/api-basics/notifications/webhooks/)

---

## 📊 Новые статусы компаний

| Статус | Описание | Когда устанавливается |
|--------|----------|----------------------|
| `pending` | Ожидает ручной модерации | Старый режим (не используется для auto) |
| `approved` | Одобрено, опубликовано | Basic: сразу; Pro/Enterprise: после оплаты |
| `rejected` | Отклонено | Автоматически при совпадении с черным списком |
| `pending_payment` | Ожидает оплаты | Pro/Enterprise до получения платежа |

---

## 🧪 Тестирование

### Тест 1: Валидация КАПСА (автоисправление)
```bash
curl -X POST http://localhost:5000/api/companies \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ЛУЧШАЯ КОМПАНИЯ",
    "description": "Отличный сервис",
    "subscriptionLevel": "basic",
    "email": "test@test.com",
    "phone": "+3725551234",
    "city": "Tallinn"
  }'
```

**Ожидается**: 
- Название автоматически преобразуется в "Лучшая Компания"
- `approvalStatus: "approved"`
- Лог: `📝 Normalized name from "ЛУЧШАЯ КОМПАНИЯ" to "Лучшая Компания"`

### Тест 2: Удаление избыточной пунктуации
```bash
curl -X POST http://localhost:5000/api/companies \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Супер компания!!!!!",
    "description": "Лучший сервис в городе?????",
    "subscriptionLevel": "basic",
    "email": "test@test.com",
    "phone": "+3725551234",
    "city": "Tallinn"
  }'
```

**Ожидается**: 
- Название: "Супер компания!!!"
- Описание: "Лучший сервис в городе???"
- `approvalStatus: "approved"`
- Лог: `✂️ Removed excessive punctuation from: ...`

### Тест 3: Basic план (автоодобрение с валидацией)
```bash
curl -X POST http://localhost:5000/api/companies \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Company",
    "description": "Normal description",
    "subscriptionLevel": "basic",
    "email": "test@test.com",
    "phone": "+3725551234",
    "city": "Tallinn"
  }'
```

**Ожидается**: `approvalStatus: "approved"`, уведомление админу

### Тест 4: Черный список (отклонение)
```bash
curl -X POST http://localhost:5000/api/companies \
  -H "Content-Type: application/json" \
  -d '{
    "name": "SCAM COMPANY!!!!!!",
    "description": "FAST MONEY GUARANTEED",
    "subscriptionLevel": "basic",
    "email": "test@test.com",
    "phone": "+3725551234",
    "city": "Tallinn"
  }'
```

**Ожидается**: `approvalStatus: "rejected"`, ошибка 400

### Тест 5: Pro план (ожидает оплаты)
```bash
curl -X POST http://localhost:5000/api/companies \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pro Company",
    "description": "Premium business",
    "subscriptionLevel": "pro",
    "email": "test@test.com",
    "phone": "+3725551234",
    "city": "Tallinn"
  }'
```

**Ожидается**: `approvalStatus: "pending_payment"`

### Тест 4: Webhook оплаты
```bash
curl -X POST http://localhost:5000/api/webhooks/payment \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "YOUR_COMPANY_ID_HERE",
    "status": "succeeded",
    "amount": 2900,
    "subscriptionLevel": "pro"
  }'
```

**Ожидается**: Компания обновлена до `approved`, уведомление отправлено

---

## �‍💼 Админ-панель (Обновления)

### Новая логика кнопок:

#### Для заявок со статусом `pending` или `pending_payment`:
- ✅ **Approve** - одобрить с текущим планом
- 📄 **Downgrade to Basic** - понизить до Basic (если не Basic)
- ⚡ **Change to Pro** - изменить на Pro (если не Pro)
- 💎 **Upgrade to Enterprise** - повысить до Enterprise (если не Enterprise)
- 🚫 **Reject** - отклонить заявку

#### Для заявок со статусом `approved`:
- ✅ **Already Approved** - бейдж (не кнопка)
- 🚫 **Ban/Block** - заблокировать/забанить компанию

### Логика отображения:
```jsx
{request.approvalStatus !== 'approved' && (
    // Показываем кнопки одобрения
)}

{request.approvalStatus === 'approved' && (
    // Показываем бейдж "Already Approved"
)}

// Кнопка Ban/Block всегда доступна
```

### Визуальные изменения:
- Зеленый бейдж "Already Approved" для одобренных
- Кнопка "Reject" меняется на "Ban/Block" для одобренных
- Скрываются кнопки изменения плана для уже одобренных
- Показываются только кнопки планов, отличных от текущего

---

## �🔧 Настройка переменных окружения

Добавьте в `.env`:

```env
# Telegram уведомления (рекомендуется)
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here

# Email уведомления (опционально)
ADMIN_EMAIL=admin@kontrollitud.ee
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Платежная система (Stripe пример)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Или PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_SECRET=your_paypal_secret
```

---

## 📝 Логи и мониторинг

Все действия автоматической модерации логируются в консоль:

**Валидация:**
- `📝 Normalized name from "НАЗВАНИЕ" to "Название"` - исправлен КАПС
- `✂️ Removed excessive punctuation from: ...` - удалена избыточная пунктуация

**Модерация:**
- `🚫 Blacklisted word detected: ...` - найдено запрещенное слово
- `🚫 Spam pattern detected (excessive repetition) in: ...` - обнаружен спам-паттерн
- `🚫 Excessive caps detected in: ...` - избыток заглавных букв (в описании)

**Авто-одобрение:**
- `✅ Basic company auto-approved: ...` - Basic план одобрен
- `💰 pro company pending payment: ...` - Pro/Enterprise ожидают оплаты
- `✅ Company auto-approved after payment: ...` - Оплата подтверждена

**Уведомления:**
- `📧 Admin notification: ...` - Уведомление отправлено

Проверяйте логи Docker:
```bash
docker logs kontrollitudee-backend-1 -f
```

---

## 🚀 Пересборка и запуск

После настройки пересоберите контейнеры:

```bash
docker-compose down
docker-compose up --build
```

---

## 📞 Поддержка

Для добавления новых слов в черный список или изменения логики автоодобрения редактируйте:
- `backend/server.js` → массив `blackListWords`
- `backend/server.js` → функция `containsBlacklistedWords()`
- `backend/server.js` → функция `sendAdminNotification()`

---

## 6. Subscription Expiration Management

### 6.1 Automatic Subscription Checks

**Cron Job Schedule:**
- **Daily Check:** 3:00 AM Europe/Tallinn timezone
- **For Testing:** Set to `*/5 * * * *` (every 5 minutes) or `0 * * * *` (every hour)

**What Happens Daily:**
1. **3-Day Reminders:** Find companies with `planExpiresAt` in 3 days → send warning email
2. **Downgrade Expired:** Find expired pro/enterprise plans → reset to basic, clear paid features

### 6.2 Email Configuration (SMTP)

Add to **backend/.env**:

```env
# SMTP Configuration (Gmail Example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# For Gmail: Enable 2FA → Generate App Password
# https://myaccount.google.com/apppasswords

# Optional: Run subscription check on server startup (for testing)
RUN_SUBSCRIPTION_CHECK_ON_STARTUP=true
```

**Other SMTP Providers:**
- **SendGrid:** `smtp.sendgrid.net:587` (recommended for production)
- **Mailgun:** `smtp.mailgun.org:587`
- **Outlook:** `smtp-mail.outlook.com:587`

### 6.3 Subscription Fields in Schema

```javascript
planExpiresAt: Date          // Expiration date for pro/enterprise plans
planReminderSent: Boolean    // Flag: was 3-day reminder sent?
planDowngradedAt: Date       // When was plan auto-downgraded to basic?
```

### 6.4 Email Templates

**3-Day Reminder Email:**
```
Subject: ⚠️ Your subscription expires in 3 days

Your "Pro/Enterprise" subscription expires on [date].
To renew, contact: info@kontrollitud.ee
```

**Expiration Notice Email:**
```
Subject: ❌ Your subscription has expired

Your plan has been downgraded to Basic.
Features removed: Photo, Social Links, Blog Article.
To restore, renew your subscription.
```

### 6.5 Testing Subscription Checks

**1. Create Test Company with Expired Plan:**

```bash
curl -X POST http://localhost:5000/api/companies \
-H "Content-Type: application/json" \
-d '{
  "name": "Test Pro Company",
  "email": "test@example.com",
  "subscriptionLevel": "pro",
  "planExpiresAt": "2024-01-01",
  "image": "https://example.com/photo.jpg",
  "instagramUrl": "https://instagram.com/test",
  "approvalStatus": "approved"
}'
```

**2. Manually Trigger Check (in Node console or temporary endpoint):**

```javascript
await checkSubscriptions();
```

**3. Verify Results:**
- Check MongoDB: `subscriptionLevel` changed to `"basic"`
- Paid fields cleared: `image`, `instagramUrl`, `tiktokUrl`, `youtubeUrl`, `blogArticleUrl` set to `null`
- Email sent to `userEmail`

**4. Check Logs:**

```
⏰ Cron job triggered: Daily subscription check
📧 Sending expiration reminders...
   Found 2 companies expiring in 3 days
   ✅ Reminder sent to test@example.com
⬇️ Downgrading expired subscriptions...
   Found 1 expired subscriptions
   ✅ Downgraded "Test Pro Company" from pro to basic
```

### 6.6 Production Deployment

**1. Update Docker Compose:**

Add SMTP variables to `docker-compose.yml`:

```yaml
backend:
  environment:
    - SMTP_HOST=smtp.gmail.com
    - SMTP_PORT=587
    - SMTP_USER=${SMTP_USER}
    - SMTP_PASS=${SMTP_PASS}
```

**2. Set Variables on Server:**

```bash
export SMTP_USER="your-email@gmail.com"
export SMTP_PASS="your-app-password"
```

**3. Rebuild Containers:**

```bash
docker-compose down
docker-compose up --build -d
```

**4. Verify Cron Job:**

```bash
docker logs backend-container | grep "Cron job scheduled"
```

### 6.7 Manual Subscription Renewal

**Admin can manually extend subscription via API:**

```bash
curl -X PATCH http://localhost:5000/api/companies/:id/extend-subscription \
-H "Content-Type: application/json" \
-d '{
  "months": 1,
  "plan": "pro"
}'
```

**Implementation (add to server.js):**

```javascript
app.patch('/api/companies/:id/extend-subscription', async (req, res) => {
    const { months, plan } = req.body;
    const company = await Company.findById(req.params.id);
    
    const currentExpiry = company.planExpiresAt || new Date();
    const newExpiry = new Date(currentExpiry);
    newExpiry.setMonth(newExpiry.getMonth() + months);
    
    company.subscriptionLevel = plan;
    company.planExpiresAt = newExpiry;
    company.planReminderSent = false;
    await company.save();
    
    res.json({ message: 'Subscription extended', newExpiry });
});
```

