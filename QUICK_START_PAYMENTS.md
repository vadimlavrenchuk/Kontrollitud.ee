# 🚀 Быстрый старт: интеграция платежей

## Шаг 1: Установка зависимостей

### Backend
```bash
cd backend
npm install stripe
```

### Frontend
```bash
cd frontend
npm install @stripe/stripe-js
```

## Шаг 2: Регистрация в Stripe

1. Перейдите на https://stripe.com/
2. Зарегистрируйтесь (выберите Estonia)
3. Войдите в Dashboard

## Шаг 3: Получение API ключей

1. В Stripe Dashboard → **Developers** → **API keys**
2. Скопируйте:
   - **Publishable key** (pk_test_...)
   - **Secret key** (sk_test_...)

## Шаг 4: Создание продуктов

1. В Stripe Dashboard → **Products** → **Add Product**

### Создайте Product #1: Pro Plan
- Name: `Pro Plan - Kontrollitud`
- Description: `Pro subscription with premium features`
- Pricing:
  - Price: `29.99 EUR`
  - Billing period: `Monthly`
  - Click **Save**
- Скопируйте **Price ID** (начинается с `price_...`)

### Создайте Product #2: Enterprise Plan
- Name: `Enterprise Plan - Kontrollitud`
- Description: `Enterprise subscription with all features`
- Pricing:
  - Price: `99.99 EUR`
  - Billing period: `Monthly`
  - Click **Save**
- Скопируйте **Price ID** (начинается с `price_...`)

## Шаг 5: Обновите .env файл

Откройте файл `.env` в корне проекта и добавьте/обновите:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_ВАШ_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_ВАШ_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_временно_оставьте_пустым

# Stripe Price IDs
STRIPE_PRICE_PRO=price_ВАШ_PRO_PRICE_ID
STRIPE_PRICE_ENTERPRISE=price_ВАШ_ENTERPRISE_PRICE_ID

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

Также создайте файл `frontend/.env`:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_ВАШ_PUBLISHABLE_KEY
```

## Шаг 6: Настройка маршрутов в App.jsx

Добавьте новые маршруты в `frontend/src/App.jsx`:

```jsx
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancelled from './pages/PaymentCancelled';

// В разделе routes:
<Route path="/payment-success" element={<PaymentSuccess />} />
<Route path="/payment-cancelled" element={<PaymentCancelled />} />
```

## Шаг 7: Использование компонента PaymentButton

Пример использования в вашем компоненте:

```jsx
import PaymentButton from './components/PaymentButton';

function MyComponent() {
    const companyId = "..."; // ID компании
    const currentLevel = "basic"; // Текущий план
    
    return (
        <div>
            <h2>Выберите план</h2>
            
            <PaymentButton 
                companyId={companyId}
                subscriptionLevel="pro"
                currentLevel={currentLevel}
            />
            
            <PaymentButton 
                companyId={companyId}
                subscriptionLevel="enterprise"
                currentLevel={currentLevel}
            />
        </div>
    );
}
```

## Шаг 8: Запуск и тестирование

### 1. Запустите backend:
```bash
cd backend
npm start
```

### 2. Запустите frontend:
```bash
cd frontend
npm run dev
```

### 3. Тестирование:

#### Тестовые карты Stripe:
- **Успешная оплата:** `4242 4242 4242 4242`
- **Требуется 3D Secure:** `4000 0027 6000 3184`
- **Отклонена:** `4000 0000 0000 0002`

**Для всех карт:**
- CVC: любые 3 цифры (например, 123)
- Дата истечения: любая будущая дата (например, 12/25)
- ZIP: любой код (например, 12345)

### 4. Процесс тестирования:

1. Зарегистрируйте новую компанию с Pro или Enterprise планом
2. Нажмите кнопку "Подписаться"
3. Вас перенаправит на Stripe Checkout
4. Используйте тестовую карту `4242 4242 4242 4242`
5. Заполните остальные поля произвольно
6. Нажмите "Pay"
7. Вас перенаправит на страницу успеха
8. Проверьте в MongoDB, что компания теперь `approved` и `subscriptionLevel` обновлен

## Шаг 9: Настройка Webhooks (для production)

### Локальная разработка (опционально):

```bash
# Установите Stripe CLI
scoop install stripe  # Windows

# Войдите в аккаунт
stripe login

# Запустите webhook локально
stripe listen --forward-to localhost:5000/api/webhooks/stripe
```

Скопируйте `webhook signing secret` (начинается с `whsec_...`) и добавьте в `.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_ВАШ_WEBHOOK_SECRET
```

### Production:

1. Перейдите в Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. URL: `https://your-domain.com/api/webhooks/stripe`
4. Выберите события:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Скопируйте **Signing secret** и добавьте в production `.env`

## Шаг 10: Переход в Production режим

Когда готовы принимать реальные платежи:

1. В Stripe Dashboard активируйте аккаунт (заполните все данные компании)
2. Переключитесь с Test mode на Live mode (переключатель в верхнем правом углу)
3. Получите **новые ключи** (Live keys)
4. Создайте **новые продукты** в Live mode
5. Обновите `.env` с Live ключами
6. Настройте Webhook для production URL
7. Обновите `FRONTEND_URL` на реальный домен

## ⚠️ Важные замечания

1. **Никогда не коммитьте `.env` файл в git!**
2. В production используйте HTTPS (обязательно для Stripe)
3. Регулярно проверяйте Stripe Dashboard на наличие ошибок
4. Храните Secret keys в безопасности
5. Тестируйте все сценарии перед продакшеном:
   - Успешная оплата
   - Отмена оплаты
   - Отклонение карты
   - Продление подписки
   - Отмена подписки

## 📞 Поддержка

- **Stripe документация:** https://stripe.com/docs
- **Stripe Dashboard:** https://dashboard.stripe.com
- **Тестовые карты:** https://stripe.com/docs/testing

## ✅ Чеклист

- [ ] Зарегистрировались в Stripe
- [ ] Получили API ключи
- [ ] Создали продукты (Pro и Enterprise)
- [ ] Обновили .env файлы
- [ ] Установили зависимости (stripe, @stripe/stripe-js)
- [ ] Добавили маршруты в App.jsx
- [ ] Протестировали с тестовой картой
- [ ] Настроили webhooks (опционально для локальной разработки)
- [ ] Все работает! 🎉

---

**Готово!** Теперь у вас полностью работающая система платежей! 💳✨
