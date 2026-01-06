import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './PaymentSuccess.css';

function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(5);
    
    const sessionId = searchParams.get('session_id');
    
    useEffect(() => {
        // Countdown redirect to dashboard (users can manually add photos/social from there)
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/dashboard');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        
        return () => clearInterval(timer);
    }, [navigate]);
    
    return (
        <div className="payment-success-page">
            <div className="payment-success-container">
                <div className="success-icon">
                    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                        <circle cx="40" cy="40" r="38" stroke="#27ae60" strokeWidth="4"/>
                        <path d="M25 40L35 50L55 30" stroke="#27ae60" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                
                <h1>Оплата успешно завершена!</h1>
                
                <div className="success-message">
                    <p>Ваша подписка была успешно активирована.</p>
                    <p>Спасибо за выбор Kontrollitud.ee!</p>
                </div>
                
                <div className="success-details">
                    <div className="detail-item">
                        <span className="detail-icon">✓</span>
                        <span>Компания теперь активна</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-icon">✓</span>
                        <span>Все функции подписки разблокированы</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-icon">✓</span>
                        <span>Добавьте фото и соцсети в панели управления</span>
                    </div>
                </div>
                
                {sessionId && (
                    <div className="session-info">
                        <small>ID сессии: {sessionId}</small>
                    </div>
                )}
                
                <div className="redirect-info">
                    <p>Перенаправление в панель управления через {countdown} сек...</p>
                    <p className="hint-text">Там вы сможете добавить фото, соцсети и другую информацию</p>
                </div>
                
                <button 
                    className="dashboard-button"
                    onClick={() => navigate('/dashboard')}
                >
                    Перейти в панель управления
                </button>
            </div>
        </div>
    );
}

export default PaymentSuccess;
