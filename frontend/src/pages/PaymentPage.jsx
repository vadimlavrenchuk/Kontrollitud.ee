import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../AuthContext';
import PaymentButton from '../components/PaymentButton';
import './PaymentPage.css';

function PaymentPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useTranslation();
    
    const { companyId, subscriptionLevel: initialLevel } = location.state || {};
    const [selectedPlan, setSelectedPlan] = useState(initialLevel || 'pro');
    
    // Redirect if missing required data
    React.useEffect(() => {
        if (!user) {
            navigate('/auth');
        } else if (!companyId) {
            navigate('/dashboard');
        }
    }, [user, companyId, navigate]);
    
    if (!companyId) {
        return null;
    }
    
    const plans = {
        pro: {
            name: t('pro_plan'),
            price: '€29.99',
            period: t('per_month'),
            color: '#3b82f6',
            gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            features: [
                t('priority_placement'),
                t('social_media_links'),
                t('custom_branding'),
                t('analytics_dashboard')
            ]
        },
        enterprise: {
            name: t('enterprise_plan'),
            price: '€99.99',
            period: t('per_month'),
            color: '#fbbf24',
            gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            features: [
                t('all_pro_features'),
                t('dedicated_support'),
                t('api_access'),
                t('custom_integrations'),
                t('priority_support')
            ]
        }
    };
    
    return (
        <div className="payment-page">
            <div className="payment-container">
                <button 
                    className="back-button"
                    onClick={() => navigate(-1)}
                >
                    ← {t('back_to_home')}
                </button>
                <div className="payment-header">
                    <h1>{t('subscription_plan')}</h1>
                    <p className="payment-subtitle">{t('choose_plan')}</p>
                </div>
                
                <div className="payment-plans">
                    {/* Pro Plan */}
                    <div 
                        className={`payment-plan-card pro ${selectedPlan === 'pro' ? 'selected' : ''}`}
                        onClick={() => setSelectedPlan('pro')}
                    >
                        <div className="plan-badge" style={{ background: plans.pro.gradient }}>
                            {t('most_popular')}
                        </div>
                        <div className="plan-header">
                            <h2>{plans.pro.name}</h2>
                            <div className="plan-pricing">
                                <span className="price">{plans.pro.price}</span>
                                <span className="period">{plans.pro.period}</span>
                            </div>
                        </div>
                        <ul className="plan-features">
                            {plans.pro.features.map((feature, index) => (
                                <li key={index}>{feature}</li>
                            ))}
                        </ul>
                        <PaymentButton 
                            companyId={companyId}
                            subscriptionLevel="pro"
                            currentLevel="basic"
                            compact={true}
                        />
                    </div>
                    
                    {/* Enterprise Plan */}
                    <div 
                        className={`payment-plan-card enterprise ${selectedPlan === 'enterprise' ? 'selected' : ''}`}
                        onClick={() => setSelectedPlan('enterprise')}
                    >
                        <div className="plan-badge premium" style={{ background: plans.enterprise.gradient }}>
                            Premium
                        </div>
                        <div className="plan-header">
                            <h2>{plans.enterprise.name}</h2>
                            <div className="plan-pricing">
                                <span className="price">{plans.enterprise.price}</span>
                                <span className="period">{plans.enterprise.period}</span>
                            </div>
                        </div>
                        <ul className="plan-features">
                            {plans.enterprise.features.map((feature, index) => (
                                <li key={index}>{feature}</li>
                            ))}
                        </ul>
                        <PaymentButton 
                            companyId={companyId}
                            subscriptionLevel="enterprise"
                            currentLevel="basic"
                            compact={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PaymentPage;
