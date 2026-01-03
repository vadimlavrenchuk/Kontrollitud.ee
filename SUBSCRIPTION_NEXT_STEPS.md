# Subscription Management - Next Steps

## ✅ Что уже сделано

1. ✅ Установлены зависимости: `node-cron`, `nodemailer`
2. ✅ Добавлены поля в схему: `planExpiresAt`, `planReminderSent`, `planDowngradedAt`
3. ✅ Созданы функции:
   - `getEmailTransporter()` - настройка SMTP
   - `sendExpirationReminderEmail()` - отправка предупреждений за 3 дня
   - `sendExpiredNotificationEmail()` - уведомление об истечении
   - `downgradeExpiredSubscriptions()` - автоматический downgrade
   - `sendExpirationReminders()` - поиск компаний с истекающей подпиской
   - `checkSubscriptions()` - главная функция-оркестратор
4. ✅ Настроен Cron Job: ежедневно в 3:00 AM (Europe/Tallinn)
5. ✅ Добавлен API endpoint: `PATCH /api/companies/:id/extend-subscription`
6. ✅ Docker контейнеры пересобраны
7. ✅ Документация создана: `SUBSCRIPTION_EXPIRATION.md`

## 📋 Следующие шаги

### 1. Настроить SMTP (обязательно для отправки email)

**Вариант A: Gmail (для тестирования)**

1. Перейти: https://myaccount.google.com/apppasswords
2. Создать App Password (требуется 2FA)
3. Добавить в `backend/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ваш-email@gmail.com
SMTP_PASS=сгенерированный-пароль-приложения
```

**Вариант B: SendGrid (рекомендуется для production)**

1. Зарегистрироваться: https://sendgrid.com
2. Создать API ключ
3. Добавить в `backend/.env`:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=ваш-api-ключ
```

### 2. Протестировать систему

**Создать тестовую компанию:**

```bash
curl -X POST http://localhost:5000/api/companies \
-H "Content-Type: application/json" \
-d '{
  "name": "Тестовая Pro Компания",
  "email": "info@testcompany.ee",
  "userEmail": "ваш-email@gmail.com",
  "phone": "+372 5555 5555",
  "subscriptionLevel": "pro",
  "planExpiresAt": "2024-01-01",
  "image": "https://via.placeholder.com/300",
  "instagramUrl": "https://instagram.com/test",
  "approvalStatus": "approved",
  "isVerified": true
}'
```

**Вручную запустить проверку (временный endpoint для теста):**

Добавить в `backend/server.js` перед `app.listen()`:

```javascript
// TEMPORARY: Test subscription check
app.get('/api/admin/test-subscription-check', async (req, res) => {
    console.log('🧪 Manual subscription check triggered');
    await checkSubscriptions();
    res.json({ success: true, message: 'Subscription check completed' });
});
```

Затем вызвать:

```bash
curl http://localhost:5000/api/admin/test-subscription-check
```

**Проверить результаты:**

```bash
# 1. Логи Docker
docker logs kontrollitudee-backend-1 -f

# 2. Проверить в MongoDB
docker exec -it kontrollitudee-mongodb-1 mongosh
use test
db.companies.findOne({name: "Тестовая Pro Компания"})

# Ожидаемый результат:
# - subscriptionLevel: "basic" (было "pro")
# - image: null
# - instagramUrl: null
# - isVerified: false
# - planDowngradedAt: текущая дата
```

### 3. Добавить поддержку webhook для автоматического продления

Когда пользователь оплачивает подписку (Stripe/PayPal), нужно автоматически продлевать:

```javascript
// Webhook уже есть в server.js: POST /api/webhooks/payment
// Добавить продление подписки:

app.post('/api/webhooks/payment', async (req, res) => {
    const { companyId, subscriptionLevel, months = 1 } = req.body;
    
    const company = await Company.findById(companyId);
    
    // Calculate new expiry
    const newExpiry = new Date();
    newExpiry.setMonth(newExpiry.getMonth() + months);
    
    company.subscriptionLevel = subscriptionLevel;
    company.planExpiresAt = newExpiry;
    company.planReminderSent = false;
    company.approvalStatus = 'approved';
    company.isVerified = true;
    
    await company.save();
    
    res.json({ success: true, message: 'Payment confirmed' });
});
```

### 4. Интегрировать в Admin Dashboard

Добавить в `frontend/src/AdminDashboard.jsx`:

```javascript
// Показывать planExpiresAt для pro/enterprise компаний
{company.subscriptionLevel !== 'basic' && (
  <div className="subscription-info">
    <p>Expires: {new Date(company.planExpiresAt).toLocaleDateString()}</p>
    {new Date(company.planExpiresAt) < new Date() && (
      <span className="badge-expired">Expired</span>
    )}
  </div>
)}

// Кнопка продления
<button onClick={() => extendSubscription(company._id, 1, 'pro')}>
  Extend 1 Month
</button>
```

### 5. Настроить уведомления админа

Добавить в `sendExpiredNotificationEmail()` копию админу:

```javascript
// Дополнительно отправить админу
await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: 'admin@kontrollitud.ee',
    subject: `🔔 Subscription expired: ${company.name}`,
    text: `Company "${company.name}" subscription has expired and was downgraded to basic.`
});
```

### 6. Production Deployment

**Обновить docker-compose.yml:**

```yaml
backend:
  environment:
    - SMTP_HOST=${SMTP_HOST}
    - SMTP_PORT=${SMTP_PORT}
    - SMTP_USER=${SMTP_USER}
    - SMTP_PASS=${SMTP_PASS}
```

**На сервере:**

```bash
# Установить переменные окружения
export SMTP_HOST="smtp.sendgrid.net"
export SMTP_PORT="587"
export SMTP_USER="apikey"
export SMTP_PASS="ваш-api-ключ"

# Пересобрать
docker-compose down
docker-compose up --build -d

# Проверить
docker logs kontrollitudee-backend-1 | grep "Cron job scheduled"
```

## 🔍 Мониторинг

**Ежедневная проверка логов:**

```bash
docker logs kontrollitudee-backend-1 -f | grep -E "subscription|Cron"
```

**Ожидаемые логи (каждый день в 3:00 AM):**

```
⏰ Cron job triggered: Daily subscription check
📧 Sending expiration reminders...
   Found 2 companies expiring in 3 days
   ✅ Reminder sent to user1@example.com
⬇️ Downgrading expired subscriptions...
   Found 1 expired subscriptions
   ✅ Downgraded "Company XYZ" from pro to basic
```

## 📚 Документация

- **Основная**: `SUBSCRIPTION_EXPIRATION.md`
- **Детальная**: `AUTOMATED_MODERATION.md` (секция 6)
- **Примеры API**: Внутри документации выше

## ⚠️ Важные замечания

1. **SMTP обязателен**: Без настройки SMTP email не будут отправляться (но downgrade будет работать)
2. **Тестирование**: Сначала протестировать на staging с реальными email адресами
3. **Timezone**: Cron использует Europe/Tallinn (UTC+2/+3)
4. **Частота**: По умолчанию 1 раз в день, можно изменить в `cron.schedule()`
5. **Graceful degradation**: Если email fails, система продолжит работать (downgrade выполнится)

## 🐛 Troubleshooting

**Проблема**: Email не отправляются  
**Решение**: Проверить SMTP credentials, для Gmail использовать App Password

**Проблема**: Cron не запускается  
**Решение**: Проверить логи: `docker logs kontrollitudee-backend-1 | grep Cron`

**Проблема**: Downgrade не работает  
**Решение**: Проверить MongoDB connection и наличие поля `planExpiresAt`

**Проблема**: Timezone неправильный  
**Решение**: Изменить в cron.schedule: `timezone: "Europe/Tallinn"`
