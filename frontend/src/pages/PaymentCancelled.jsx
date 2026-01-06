import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './PaymentCancelled.css';

function PaymentCancelled() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const companyId = searchParams.get('company_id');
    
    const handleRetry = () => {
        if (companyId) {
            navigate(`/dashboard`);
        } else {
            navigate('/dashboard');
        }
    };
    
    return (
        <div className="payment-cancelled-page">
            <div className="payment-cancelled-container">
                <div className="cancelled-icon">
                    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                        <circle cx="40" cy="40" r="38" stroke="#e74c3c" strokeWidth="4"/>
                        <path d="M30 30L50 50M50 30L30 50" stroke="#e74c3c" strokeWidth="4" strokeLinecap="round"/>
                    </svg>
                </div>
                
                <h1>Оплата отменена</h1>
                
                <div className="cancelled-message">
                    <p>Процесс оплаты был отменен.</p>
                    <p>Не беспокойтесь, с вашей карты не было снято никаких средств.</p>
                </div>
                
                <div className="cancelled-options">
                    <h3>Что дальше?</h3>
                    <ul>
                        <li>Вы можете попробовать оплатить снова</li>
                        <li>Или продолжить с бесплатным планом</li>
                        <li>Свяжитесь с нами, если у вас возникли проблемы</li>
                    </ul>
                </div>
                
                <div className="action-buttons">
                    <button 
                        className="retry-button"
                        onClick={handleRetry}
                    >
                        Попробовать снова
                    </button>
                    
                    <button 
                        className="dashboard-button"
                        onClick={() => navigate('/dashboard')}
                    >
                        Вернуться в панель управления
                    </button>
                </div>
                
                <div className="support-info">
                    <p>Нужна помощь? <a href="mailto:support@kontrollitud.ee">Свяжитесь с нами</a></p>
                </div>
            </div>
        </div>
    );
}

export default PaymentCancelled;
