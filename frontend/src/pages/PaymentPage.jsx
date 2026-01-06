import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import PaymentButton from '../components/PaymentButton';
import './PaymentPage.css';

function PaymentPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const { companyId, subscriptionLevel } = location.state || {};
    
    // Redirect if missing required data
    React.useEffect(() => {
        if (!user) {
            navigate('/auth');
        } else if (!companyId || !subscriptionLevel) {
            navigate('/dashboard');
        }
    }, [user, companyId, subscriptionLevel, navigate]);
    
    if (!companyId || !subscriptionLevel) {
        return null;
    }
    
    const planInfo = {
        pro: {
            name: 'Pro Plan',
            price: '€29.99/мес',
            color: '#3b82f6'
        },
        enterprise: {
            name: 'Enterprise Plan',
            price: '€99.99/мес',
            color: '#fbbf24'
        }
    };
    
    const plan = planInfo[subscriptionLevel];
    
    return (
        <div className="payment-page">
            <div className="payment-container">
                <div className="payment-header">
                    <button 
                        className="back-button"
                        onClick={() => navigate(-1)}
                    >
                        ← Назад
                    </button>
                    <h1>Оформление подписки</h1>
                </div>
                
                <div className="payment-content">
                    <div className="plan-summary">
                        <h2>Выбранный план</h2>
                        <div className="plan-card" style={{ borderColor: plan.color }}>
                            <h3>{plan.name}</h3>
                            <div className="plan-price">{plan.price}</div>
                        </div>
                    </div>
                    
                    <div className="payment-section">
                        <PaymentButton 
                            companyId={companyId}
                            subscriptionLevel={subscriptionLevel}
                            currentLevel="basic"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PaymentPage;
