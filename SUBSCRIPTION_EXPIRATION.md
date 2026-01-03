# Subscription Expiration Management

## Overview

Автоматическая система проверки подписок работает через cron job:

- **Расписание**: Каждый день в 3:00 утра (Europe/Tallinn)
- **Функции**:
  1. За 3 дня до истечения → отправка предупреждающего email
  2. После истечения → автоматический downgrade на Basic план + удаление платных функций

## Quick Setup

### 1. Configure SMTP (Email Sending)

**Gmail Example:**

1. Включить 2FA в Google аккаунте
2. Создать App Password: https://myaccount.google.com/apppasswords
3. Добавить в `backend/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
```

**Alternative Providers:**

- **SendGrid**: `smtp.sendgrid.net:587` (рекомендуется для production)
- **Mailgun**: `smtp.mailgun.org:587`
- **Outlook**: `smtp-mail.outlook.com:587`

### 2. Testing Subscription Check

**Создать тестовую компанию с истекшей подпиской:**

```bash
curl -X POST http://localhost:5000/api/companies \
-H "Content-Type: application/json" \
-d '{
  "name": "Test Pro Company",
  "email": "test@example.com",
  "userEmail": "user@example.com",
  "phone": "+372 5555 5555",
  "subscriptionLevel": "pro",
  "planExpiresAt": "2024-01-01",
  "image": "https://example.com/photo.jpg",
  "instagramUrl": "https://instagram.com/test",
  "approvalStatus": "approved",
  "isVerified": true
}'
```

**Вручную запустить проверку (для теста):**

Временно добавить тестовый endpoint в `backend/server.js`:

```javascript
app.get('/api/admin/test-subscription-check', async (req, res) => {
    await checkSubscriptions();
    res.json({ message: 'Subscription check completed' });
});
```

Затем вызвать:

```bash
curl http://localhost:5000/api/admin/test-subscription-check
```

**Проверить результаты:**

```bash
# Логи Docker
docker logs kontrollitudee-backend-1 -f

# Проверить в MongoDB
docker exec -it kontrollitudee-mongodb-1 mongosh
use kontrollitudDB
db.companies.findOne({name: "Test Pro Company"})
```

**Ожидаемый результат:**

- `subscriptionLevel`: изменено с `"pro"` на `"basic"`
- `image`, `instagramUrl`, `tiktokUrl`, `youtubeUrl`, `blogArticleUrl`: очищены (null)
- `isVerified`: изменено на `false`
- `planDowngradedAt`: установлена текущая дата
- Email отправлен на `userEmail`

### 3. Cron Job Configuration

**По умолчанию**: 3:00 AM каждый день

**Изменить расписание в `backend/server.js`:**

```javascript
// Каждые 5 минут (для теста):
cron.schedule('*/5 * * * *', async () => { ... })

// Каждый час (для теста):
cron.schedule('0 * * * *', async () => { ... })

// Каждый день в 2:00 AM:
cron.schedule('0 2 * * *', async () => { ... })

// Каждую неделю в понедельник в 3:00 AM:
cron.schedule('0 3 * * 1', async () => { ... })
```

**Запуск проверки при старте сервера (для теста):**

В `.env`:
```env
RUN_SUBSCRIPTION_CHECK_ON_STARTUP=true
```

### 4. Manual Subscription Extension (API)

**Продлить подписку:**

```bash
curl -X PATCH http://localhost:5000/api/companies/:companyId/extend-subscription \
-H "Content-Type: application/json" \
-d '{
  "months": 1,
  "plan": "pro"
}'
```

**Response:**

```json
{
  "success": true,
  "message": "Subscription extended for 1 months",
  "company": {
    "id": "...",
    "name": "Company Name",
    "subscriptionLevel": "pro",
    "planExpiresAt": "2025-03-15T00:00:00.000Z",
    "newExpiry": "2025-03-15T00:00:00.000Z"
  }
}
```

## Schema Fields

```javascript
planExpiresAt: Date          // Дата истечения подписки (для pro/enterprise)
planReminderSent: Boolean    // Флаг: отправлено ли напоминание за 3 дня?
planDowngradedAt: Date       // Когда был сделан downgrade на basic
```

## Email Templates

**3-Day Reminder:**

```
Subject: ⚠️ Your subscription expires in 3 days

Dear [Company Name],

Your "Pro/Enterprise" subscription on Kontrollitud.ee expires on [date].

To continue enjoying premium features, please renew your subscription.

Contact: info@kontrollitud.ee

Best regards,
Kontrollitud.ee Team
```

**Expiration Notice:**

```
Subject: ❌ Your subscription has expired

Dear [Company Name],

Your subscription has expired and your plan has been downgraded to Basic.

Features removed:
- Company photo
- Social media links (Instagram, TikTok, YouTube)
- Blog article link
- Verified badge

To restore these features, please renew your subscription.

Contact: info@kontrollitud.ee

Best regards,
Kontrollitud.ee Team
```

## Production Deployment

**Update docker-compose.yml:**

```yaml
backend:
  environment:
    - SMTP_HOST=${SMTP_HOST}
    - SMTP_PORT=${SMTP_PORT}
    - SMTP_USER=${SMTP_USER}
    - SMTP_PASS=${SMTP_PASS}
```

**Set environment variables on server:**

```bash
export SMTP_HOST="smtp.gmail.com"
export SMTP_PORT="587"
export SMTP_USER="your-email@gmail.com"
export SMTP_PASS="your-app-password"
```

**Rebuild and deploy:**

```bash
docker-compose down
docker-compose up --build -d
```

**Verify cron job is running:**

```bash
docker logs kontrollitudee-backend-1 | grep "Cron job scheduled"
```

## Monitoring

**Check logs for subscription checks:**

```bash
docker logs kontrollitudee-backend-1 -f | grep "subscription"
```

**Expected log output:**

```
⏰ Cron job triggered: Daily subscription check
📧 Sending expiration reminders...
   Found 2 companies expiring in 3 days
   ✅ Reminder sent to user1@example.com
   ✅ Reminder sent to user2@example.com
⬇️ Downgrading expired subscriptions...
   Found 1 expired subscriptions
   ✅ Downgraded "Company XYZ" from pro to basic
✅ Subscription check completed successfully
```

## Troubleshooting

**Emails not sending:**

1. Check SMTP credentials in `.env`
2. For Gmail: ensure App Password is used (not regular password)
3. Check logs: `docker logs kontrollitudee-backend-1 | grep "Error"`
4. Test SMTP connection manually

**Cron job not running:**

1. Verify cron job initialization: `docker logs kontrollitudee-backend-1 | grep "Cron"`
2. Check timezone settings
3. Temporarily change to frequent schedule for testing: `*/5 * * * *`

**Downgrade not working:**

1. Check MongoDB connection
2. Verify company has `planExpiresAt` field set
3. Check logs for errors during downgrade process
4. Manually query database to verify changes

## Complete Documentation

See [AUTOMATED_MODERATION.md](../AUTOMATED_MODERATION.md#6-subscription-expiration-management) for complete documentation including:
- Detailed API endpoints
- Email template customization
- Advanced configuration options
- Integration examples
