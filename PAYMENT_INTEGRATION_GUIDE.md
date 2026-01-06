# 💳 Интеграция платежной системы Stripe

**Статус:** Руководство по настройке  
**Дата:** 6 января 2026

---

## 📋 Выбор платежной системы

### ✅ Рекомендуется: Stripe

**Преимущества:**
- ✅ Работает в Эстонии (EU)
- ✅ Поддержка EUR и других валют
- ✅ Простая интеграция с Node.js
- ✅ Автоматические recurring payments
- ✅ Встроенная система webhooks
- ✅ PCI DSS compliance из коробки
- ✅ Отличная документация на русском

### Альтернативы для Эстонии:
- **Montonio** - локальный эстонский провайдер
- **Maksekeskus** - эстонская платежная система
- **PayPal** - международный стандарт

---

## 🚀 Установка Stripe

### 1. Установите пакет

```bash
cd backend
npm install stripe
```

### 2. Зарегистрируйтесь на Stripe

1. Перейдите на https://stripe.com/
2. Создайте аккаунт (выберите Estonia как страну)
3. Получите API ключи в Dashboard → Developers → API keys

### 3. Добавьте ключи в .env

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Цены для планов (Price IDs из Stripe Dashboard)
STRIPE_PRICE_PRO=price_xxxxxxxxxxxxx
STRIPE_PRICE_ENTERPRISE=price_xxxxxxxxxxxxx
```

---

## 💻 Настройка Backend

### 1. Создайте продукты в Stripe Dashboard

Перейдите в Dashboard → Products → Create Product:

**Продукт 1: Pro Plan**
- Название: "Pro Plan - Kontrollitud.ee"
- Цена: €29.99/month (или ваша цена)
- Recurring: Monthly
- Скопируйте `Price ID` → добавьте в .env как `STRIPE_PRICE_PRO`

**Продукт 2: Enterprise Plan**
- Название: "Enterprise Plan - Kontrollitud.ee"
- Цена: €99.99/month (или ваша цена)
- Recurring: Monthly
- Скопируйте `Price ID` → добавьте в .env как `STRIPE_PRICE_ENTERPRISE`

### 2. Добавьте эндпоинт для создания платежной сессии

Добавьте в `backend/server.js`:

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Endpoint для создания Checkout Session
app.post('/api/create-checkout-session', verifyToken, async (req, res) => {
    try {
        const { companyId, subscriptionLevel } = req.body;
        
        // Проверяем компанию
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }
        
        // Определяем Price ID в зависимости от плана
        let priceId;
        if (subscriptionLevel === 'pro') {
            priceId = process.env.STRIPE_PRICE_PRO;
        } else if (subscriptionLevel === 'enterprise') {
            priceId = process.env.STRIPE_PRICE_ENTERPRISE;
        } else {
            return res.status(400).json({ error: 'Invalid subscription level' });
        }
        
        // Создаем Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: priceId,
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`,
            metadata: {
                companyId: companyId,
                subscriptionLevel: subscriptionLevel,
            },
            customer_email: company.userEmail,
        });
        
        // Обновляем статус компании
        company.approvalStatus = 'pending_payment';
        company.stripeSessionId = session.id;
        await company.save();
        
        res.json({ sessionId: session.id, url: session.url });
        
    } catch (error) {
        console.error('Stripe checkout error:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});

// Webhook для обработки платежей
app.post('/api/webhooks/stripe', 
    express.raw({ type: 'application/json' }), 
    async (req, res) => {
        const sig = req.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        
        let event;
        
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
        
        // Обрабатываем успешную оплату
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            
            const companyId = session.metadata.companyId;
            const subscriptionLevel = session.metadata.subscriptionLevel;
            
            try {
                const company = await Company.findById(companyId);
                
                if (company && company.approvalStatus === 'pending_payment') {
                    // Обновляем компанию
                    company.approvalStatus = 'approved';
                    company.isVerified = true;
                    company.subscriptionLevel = subscriptionLevel;
                    company.stripeSubscriptionId = session.subscription;
                    company.paymentConfirmedAt = new Date();
                    
                    // Устанавливаем срок действия подписки (1 месяц)
                    const expiresAt = new Date();
                    expiresAt.setMonth(expiresAt.getMonth() + 1);
                    company.planExpiresAt = expiresAt;
                    
                    await company.save();
                    
                    console.log(`✅ Payment confirmed for company: ${company.name}`);
                    
                    // Отправляем уведомления
                    await sendAdminNotification(company.name, 'approved', subscriptionLevel);
                    await sendPaymentConfirmationEmail(company);
                }
            } catch (error) {
                console.error('Error processing payment:', error);
            }
        }
        
        // Обрабатываем отмену подписки
        if (event.type === 'customer.subscription.deleted') {
            const subscription = event.data.object;
            
            try {
                const company = await Company.findOne({ 
                    stripeSubscriptionId: subscription.id 
                });
                
                if (company) {
                    company.subscriptionLevel = 'basic';
                    company.isVerified = false;
                    company.planExpiresAt = new Date();
                    await company.save();
                    
                    console.log(`❌ Subscription cancelled for: ${company.name}`);
                }
            } catch (error) {
                console.error('Error cancelling subscription:', error);
            }
        }
        
        res.json({ received: true });
});

// Email для подтверждения оплаты
async function sendPaymentConfirmationEmail(company) {
    const mailOptions = {
        from: process.env.SMTP_USER,
        to: company.userEmail,
        subject: '✅ Payment Confirmed - Kontrollitud.ee',
        html: `
            <h2>Payment Confirmed!</h2>
            <p>Hello ${company.name},</p>
            <p>Your payment has been successfully processed.</p>
            <p><strong>Subscription Level:</strong> ${company.subscriptionLevel}</p>
            <p><strong>Valid Until:</strong> ${company.planExpiresAt.toLocaleDateString()}</p>
            <p>Your company profile is now live on Kontrollitud.ee</p>
            <p>Best regards,<br>Kontrollitud.ee Team</p>
        `
    };
    
    try {
        await transporter.sendMail(mailOptions);
        console.log('✅ Payment confirmation email sent to:', company.userEmail);
    } catch (error) {
        console.error('❌ Failed to send payment confirmation email:', error);
    }
}
```

### 3. Обновите схему Company

Добавьте новые поля в схему MongoDB:

```javascript
const companySchema = new mongoose.Schema({
    // ... существующие поля ...
    
    // Payment fields
    stripeSessionId: String,
    stripeSubscriptionId: String,
    paymentConfirmedAt: Date,
    approvalStatus: {
        type: String,
        enum: ['pending', 'pending_payment', 'approved', 'rejected'],
        default: 'pending'
    }
});
```

---

## 🎨 Настройка Frontend

### 1. Установите Stripe.js

```bash
cd frontend
npm install @stripe/stripe-js
```

### 2. Создайте компонент оплаты

Создайте файл `frontend/src/components/PaymentButton.jsx`:

```jsx
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function PaymentButton({ companyId, subscriptionLevel, plan }) {
    const [loading, setLoading] = useState(false);
    
    const handlePayment = async () => {
        setLoading(true);
        
        try {
            // Создаем checkout session
            const response = await fetch('http://localhost:5000/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    companyId,
                    subscriptionLevel
                })
            });
            
            const { sessionId, url } = await response.json();
            
            // Перенаправляем на Stripe Checkout
            window.location.href = url;
            
        } catch (error) {
            console.error('Payment error:', error);
            alert('Failed to initiate payment. Please try again.');
            setLoading(false);
        }
    };
    
    return (
        <button 
            onClick={handlePayment}
            disabled={loading}
            className="payment-button"
        >
            {loading ? 'Processing...' : `Subscribe to ${plan}`}
        </button>
    );
}

export default PaymentButton;
```

### 3. Добавьте переменную окружения

В файл `frontend/.env`:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
```

### 4. Создайте страницы успеха/отмены

`frontend/src/pages/PaymentSuccess.jsx`:

```jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function PaymentSuccess() {
    const navigate = useNavigate();
    
    useEffect(() => {
        // Перенаправление через 5 секунд
        setTimeout(() => {
            navigate('/dashboard');
        }, 5000);
    }, []);
    
    return (
        <div className="payment-success">
            <h1>✅ Payment Successful!</h1>
            <p>Your subscription has been activated.</p>
            <p>Redirecting to dashboard...</p>
        </div>
    );
}

export default PaymentSuccess;
```

---

## 🔗 Настройка Webhooks

### 1. Локальная разработка (тестирование)

Установите Stripe CLI:
```bash
# Windows (через Scoop)
scoop install stripe

# Или скачайте с https://stripe.com/docs/stripe-cli
```

Запустите webhook локально:
```bash
stripe login
stripe listen --forward-to localhost:5000/api/webhooks/stripe
```

### 2. Production (продакшен)

1. Перейдите в Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. URL: `https://your-domain.com/api/webhooks/stripe`
4. Выберите события:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Скопируйте `Signing secret` → добавьте в .env как `STRIPE_WEBHOOK_SECRET`

---

## 🧪 Тестирование

### Тестовые карты Stripe:

- **Успешная оплата:** `4242 4242 4242 4242`
- **Требуется 3D Secure:** `4000 0027 6000 3184`
- **Отклонена:** `4000 0000 0000 0002`

**Любой:**
- CVC: любые 3 цифры
- Дата: любая будущая дата
- ZIP: любой

### Тест оплаты:

1. Откройте http://localhost:3000
2. Зарегистрируйте компанию с Pro планом
3. Нажмите кнопку оплаты
4. Используйте тестовую карту `4242 4242 4242 4242`
5. Проверьте, что компания одобрена после оплаты

---

## 📊 Цены (рекомендуемые)

| План | Цена | Функции |
|------|------|---------|
| **Basic** | Бесплатно | Базовые функции |
| **Pro** | €29.99/мес | + фото, соцсети, верификация |
| **Enterprise** | €99.99/мес | Всё + приоритет в поиске |

---

## 🔐 Безопасность

1. ✅ Никогда не храните данные карт на своем сервере
2. ✅ Используйте Stripe Checkout (PCI compliant)
3. ✅ Проверяйте webhook подпись
4. ✅ Используйте HTTPS в production
5. ✅ Храните Stripe ключи в .env (не в git)

---

## 📝 Чеклист настройки

- [ ] Создать аккаунт Stripe
- [ ] Получить API ключи
- [ ] Создать продукты в Stripe Dashboard
- [ ] Установить пакет `stripe` в backend
- [ ] Добавить эндпоинты в server.js
- [ ] Установить `@stripe/stripe-js` в frontend
- [ ] Создать компонент PaymentButton
- [ ] Настроить webhooks
- [ ] Добавить переменные в .env
- [ ] Протестировать с тестовыми картами
- [ ] Активировать production режим в Stripe

---

## 🆘 Поддержка

- **Stripe документация:** https://stripe.com/docs
- **Stripe Dashboard:** https://dashboard.stripe.com
- **Тестовые карты:** https://stripe.com/docs/testing
