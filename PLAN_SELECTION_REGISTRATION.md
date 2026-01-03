# Plan Selection in Registration - Implementation Complete

## Overview
Добавлен обязательный выбор плана подписки в форму регистрации. Пользователи теперь выбирают один из трех тарифов при создании аккаунта: `basic` (бесплатно), `pro` (€29/месяц), `enterprise` (€50/месяц).

## Changes Implemented

### 1. Frontend - AuthPage.jsx

#### Form State Updates
- Добавлено поле `plan` в начальное состояние формы со значением по умолчанию `'basic'`
- План передается в функцию `signUpWithEmail` при регистрации

#### Plan Selection UI
Новый блок выбора плана отображается только при регистрации (не при логине):

```jsx
{!isLogin && (
    <div className="form-group plan-selection">
        <label className="plan-label">
            Выберите тип аккаунта *
        </label>
        <div className="plan-options">
            {/* 3 radio buttons для выбора плана */}
        </div>
    </div>
)}
```

#### Visual Design
- **Basic** 📄: Бесплатно, простой листинг
- **Pro** ⚡: €29/месяц, быстрый старт + соцсети
- **Enterprise** 💎: €50/месяц, максимальный охват + топ

Каждая опция содержит:
- Иконку (emoji)
- Название плана
- Цену
- Краткое описание

### 2. Firebase Functions (firebase.js)

#### signUpWithEmail
Обновлена для приема параметра `plan` и сохранения его в Firestore:

```javascript
export const signUpWithEmail = async (email, password, displayName, plan = 'basic') => {
    // ... create user ...
    
    // Save user data with plan to Firestore
    await addDoc(collection(db, 'users'), {
        uid: result.user.uid,
        email: result.user.email,
        displayName: displayName || '',
        plan: plan,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });
}
```

#### Social Sign-In (Google & Facebook)
Обновлены для автоматического сохранения плана `'basic'` для новых пользователей:

```javascript
export const signInWithGoogle = async () => {
    // ... sign in ...
    
    // Save user data with default 'basic' plan
    await addDoc(collection(db, 'users'), {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName || '',
        plan: 'basic',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });
}
```

### 3. AddBusiness.jsx

#### Plan Integration
При добавлении бизнеса система автоматически получает план пользователя из Firestore:

```javascript
// Get user's subscription plan from Firestore
let userPlan = 'basic'; // Default
if (user?.uid) {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('uid', '==', user.uid));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        userPlan = userData.plan || 'basic';
    }
}

// Add to submission data
const submissionData = {
    // ... other fields ...
    subscriptionLevel: userPlan,
    // ...
};
```

### 4. Styles (AuthPage.scss)

#### Plan Selection Styles
```scss
.plan-selection {
    .plan-label {
        font-weight: 700;
        text-align: center;
    }
    
    .plan-options {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        
        @media (max-width: 768px) {
            grid-template-columns: 1fr; // Stack on mobile
        }
    }
    
    .plan-option {
        cursor: pointer;
        
        .plan-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 16px 12px;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            transition: all 0.2s ease;
            
            &:hover {
                border-color: #667eea;
                transform: translateY(-2px);
            }
        }
        
        &.selected .plan-card {
            border-color: #667eea;
            background: gradient;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
        }
    }
}
```

## User Flow

### Registration with Email
1. Пользователь заполняет имя, email, пароль
2. Выбирает один из трех планов (обязательно)
3. Подтверждает пароль
4. Нажимает "Register"
5. Данные сохраняются в Firebase Auth + Firestore с полем `plan`

### Registration with Google/Facebook
1. Пользователь нажимает "Continue with Google/Facebook"
2. Система автоматически создает профиль с планом `'basic'`
3. Пользователь может обновить план позже

### Adding Business
1. При добавлении бизнеса система автоматически получает план пользователя
2. Бизнес создается с `subscriptionLevel` = план пользователя
3. После одобрения админом, бизнес отображается с соответствующими функциями

## Database Structure

### users Collection
```javascript
{
    uid: "firebase_user_id",
    email: "user@example.com",
    displayName: "John Doe",
    plan: "basic" | "pro" | "enterprise",
    createdAt: Timestamp,
    updatedAt: Timestamp
}
```

### pending_companies / companies Collection
```javascript
{
    // ... other fields ...
    subscriptionLevel: "basic" | "pro" | "enterprise",
    ownerId: "firebase_user_id",
    ownerEmail: "user@example.com",
    // ...
}
```

## Features by Plan

| Feature | Basic | Pro | Enterprise |
|---------|-------|-----|------------|
| Листинг компании | ✅ | ✅ | ✅ |
| Фото и описание | ✅ | ✅ | ✅ |
| Звездный рейтинг | ❌ | ✅ | ✅ |
| Социальные сети | ❌ | ✅ | ✅ |
| Синяя галочка | ❌ | ✅ | ❌ |
| Золотой border + свечение | ❌ | ❌ | ✅ |
| Кнопка блога | ❌ | ❌ | ✅ |
| Приоритет сортировки | Low | Medium | High |

## Translation Keys to Add

```json
{
    "choose_plan": "Выберите тип аккаунта",
    "free": "Бесплатно",
    "month": "месяц",
    "basic_plan_desc": "Простой листинг",
    "pro_plan_desc": "Быстрый старт + соцсети",
    "enterprise_plan_desc": "Максимальный охват + топ"
}
```

## Testing Checklist

### Registration
- [ ] Регистрация с email показывает выбор плана
- [ ] Выбор плана обязателен (required)
- [ ] Выбранный план сохраняется в Firestore
- [ ] Google/Facebook sign-in создает профиль с планом 'basic'
- [ ] Вход не показывает выбор плана

### Business Creation
- [ ] При добавлении бизнеса система получает план пользователя
- [ ] Бизнес создается с правильным subscriptionLevel
- [ ] Незалогиненный пользователь создает бизнес с планом 'basic'

### Display
- [ ] Basic карточки отображаются без рейтинга
- [ ] Pro карточки показывают синюю галочку
- [ ] Enterprise карточки имеют золотой border и анимацию

## Files Modified

### Frontend
- `frontend/src/AuthPage.jsx`
  - Form state updated
  - Plan selection UI added
  - Plan passed to signUpWithEmail
  
- `frontend/src/firebase.js`
  - signUpWithEmail updated with plan parameter
  - signInWithGoogle saves plan to Firestore
  - signInWithFacebook saves plan to Firestore

- `frontend/src/AddBusiness.jsx`
  - Added logic to fetch user plan
  - Added subscriptionLevel to submission data

- `frontend/src/styles/AuthPage.scss`
  - Plan selection styles
  - Responsive design
  - Selected state styling

## Next Steps

1. **Payment Integration**: Интегрировать Stripe/PayPal для оплаты Pro/Enterprise планов
2. **Plan Management**: Добавить страницу управления подпиской
3. **Upgrade/Downgrade**: Реализовать возможность смены плана
4. **Admin Dashboard**: Добавить отображение плана пользователя в админке
5. **Email Notifications**: Отправлять письма при регистрации с информацией о плане

## Date: January 3, 2026
