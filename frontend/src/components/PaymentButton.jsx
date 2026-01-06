import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import './PaymentButton.css';

// Initialize Stripe with publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function PaymentButton({ companyId, subscriptionLevel, currentLevel = 'basic' }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Plan details
    const planDetails = {
        pro: {
            name: 'Pro Plan',
            price: '€29.99/мес',
            features: [
                'Изображение компании',
                'Ссылки на соцсети (Instagram, TikTok, YouTube)',
                'Верификация компании',
                'Приоритет в поиске'
            ]
        },
        enterprise: {
            name: 'Enterprise Plan',
            price: '€99.99/мес',
            features: [
                'Все возможности Pro',
                'Статья в блоге',
                'Максимальный приоритет',
                'Персональный менеджер'
            ]
        }
    };
    
    const plan = planDetails[subscriptionLevel];
    
    const handlePayment = async () => {
        if (!companyId || !subscriptionLevel) {
            setError('Недостаточно данных для оплаты');
            return;
        }
        
        setLoading(true);
        setError(null);
        
        try {
            // Get auth token
            const token = localStorage.getItem('authToken');
            
            if (!token) {
                throw new Error('Вы должны быть авторизованы для оплаты');
            }
            
            // Create checkout session
            const response = await fetch('http://localhost:5000/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    companyId,
                    subscriptionLevel
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка создания сессии оплаты');
            }
            
            const { url } = await response.json();
            
            // Redirect to Stripe Checkout
            window.location.href = url;
            
        } catch (err) {
            console.error('Payment error:', err);
            setError(err.message || 'Не удалось начать процесс оплаты');
            setLoading(false);
        }
    };
    
    // Don't show button if already on this plan
    if (currentLevel === subscriptionLevel) {
        return (
            <div className="payment-button-container">
                <div className="current-plan-badge">
                    ✓ Текущий план
                </div>
            </div>
        );
    }
    
    return (
        <div className="payment-button-container">
            {plan && (
                <div className="plan-info">
                    <h3>{plan.name}</h3>
                    <div className="plan-price">{plan.price}</div>
                    <ul className="plan-features">
                        {plan.features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                        ))}
                    </ul>
                </div>
            )}
            
            <button 
                onClick={handlePayment}
                disabled={loading}
                className={`payment-button ${loading ? 'loading' : ''}`}
            >
                {loading ? (
                    <>
                        <span className="spinner"></span>
                        Обработка...
                    </>
                ) : (
                    `Подписаться на ${plan?.name || subscriptionLevel}`
                )}
            </button>
            
            {error && (
                <div className="payment-error">
                    ⚠️ {error}
                </div>
            )}
            
            <div className="payment-secure-badge">
                🔒 Защищенная оплата через Stripe
            </div>
        </div>
    );
}

export default PaymentButton;
