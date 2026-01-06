// Kontrollitud.ee/frontend/src/pages/PartnersPage.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShieldAlt, 
  faChartLine, 
  faStar, 
  faCheckCircle, 
  faEnvelope,
  faRocket,
  faCrown,
  faBolt,
  faSpinner,
  faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import '../styles/PartnersPage.scss';

function PartnersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userCompanies, setUserCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user's companies
  useEffect(() => {
    const fetchUserCompanies = async () => {
      if (!user) {
        setUserCompanies([]);
        return;
      }

      setLoadingCompanies(true);
      try {
        const token = await user.getIdToken();
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/companies`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const companies = await response.json();
          // Filter companies that belong to this user
          const myCompanies = companies.filter(c => c.userId === user.uid);
          setUserCompanies(myCompanies);
        }
      } catch (err) {
        console.error('Error fetching companies:', err);
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchUserCompanies();
  }, [user]);

  // Smart routing for plan selection
  const handlePlanClick = (plan) => {
    // Plan can be: 'basic', 'pro', 'enterprise'
    
    // If not logged in, go to auth page
    if (!user) {
      navigate('/auth');
      return;
    }

    // If logged in but no companies, go to add business
    if (userCompanies.length === 0) {
      navigate('/add-business');
      return;
    }

    // If user has companies
    if (plan === 'basic') {
      // For basic plan, always go to add business form
      navigate('/add-business');
    } else {
      // For pro/enterprise
      // Check if user has a basic plan company
      const basicCompany = userCompanies.find(c => c.subscriptionLevel === 'basic');
      
      if (basicCompany) {
        // Upgrade existing basic company
        navigate('/payment', { 
          state: { 
            companyId: basicCompany._id,
            subscriptionLevel: plan,
            isUpgrade: true
          } 
        });
      } else {
        // User already has paid plan or just use first company
        const firstCompany = userCompanies[0];
        navigate('/payment', { 
          state: { 
            companyId: firstCompany._id,
            subscriptionLevel: plan 
          } 
        });
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError(t('invalid_email'));
      setLoading(false);
      return;
    }

    try {
      // Save to Firestore
      await addDoc(collection(db, 'partner_requests'), {
        businessName: formData.businessName,
        email: formData.email,
        message: formData.message,
        timestamp: serverTimestamp(),
        status: 'new'
      });

      // Success
      setSubmitted(true);
      setFormData({ businessName: '', email: '', message: '' });
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(t('form_submit_error'));
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: faShieldAlt,
      title: t('trust_badge'),
      description: t('trust_badge_desc')
    },
    {
      icon: faChartLine,
      title: t('increased_visibility'),
      description: t('increased_visibility_desc')
    },
    {
      icon: faStar,
      title: t('reputation_management'),
      description: t('reputation_management_desc')
    }
  ];

  const pricingPlans = [
    {
      name: t('basic_plan'),
      price: t('free'),
      icon: faRocket,
      features: [
        t('feature_simple_listing'),
        t('feature_basic_contact'),
        t('feature_category_placement'),
        t('feature_customer_reviews'),
        t('feature_mobile_friendly')
      ],
      ctaText: t('get_started'),
      ctaLink: '/add-business',
      popular: false
    },
    {
      name: t('pro_plan'),
      price: '€29',
      period: t('per_month'),
      icon: faBolt,
      features: [
        t('feature_everything_basic'),
        t('feature_verified_badge'),
        t('feature_priority_search'),
        t('feature_analytics_dashboard'),
        t('feature_featured_category'),
        t('feature_social_media'),
        t('feature_premium_support')
      ],
      ctaText: t('upgrade_to_pro'),
      ctaLink: '#contact',
      popular: true
    },
    {
      name: t('enterprise_plan'),
      price: t('custom'),
      icon: faCrown,
      features: [
        t('feature_everything_pro'),
        t('feature_featured_homepage'),
        t('feature_account_manager'),
        t('feature_custom_branding'),
        t('feature_api_access'),
        t('feature_advanced_analytics'),
        t('feature_priority_support')
      ],
      ctaText: t('contact_sales'),
      ctaLink: '#contact',
      popular: false
    }
  ];

  return (
    <>
      <Helmet>
        <title>{t('partners_title')} - {t('app_title')}</title>
        <meta name="description" content={t('partners_new_hero_subtitle')} />
        <meta name="keywords" content="business partners, Estonia, verified companies, trust badge, SEO, business growth" />
      </Helmet>

      {/* Hero Section */}
      <section className="partners-hero">
        <div className="partners-hero-container">
          <h1 className="partners-hero-title">{t('partners_title')}</h1>
          <p className="partners-hero-subtitle">
            {t('partners_new_hero_subtitle')}
          </p>
          <div className="partners-hero-actions">
            <Link to="/add-business" className="btn-hero-primary">
              <FontAwesomeIcon icon={faRocket} />
              {t('get_started_free')}
            </Link>
            <a href="#pricing" className="btn-hero-secondary">
              {t('view_pricing')}
            </a>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="partners-benefits">
        <div className="partners-container">
          <h2 className="section-title">{t('why_partner_with_us')}</h2>
          <p className="section-subtitle">
            {t('why_partner_subtitle')}
          </p>
          
          <div className="benefits-grid">
            {benefits.map((benefit, index) => (
              <div key={index} className="benefit-card">
                <div className="benefit-icon">
                  <FontAwesomeIcon icon={benefit.icon} />
                </div>
                <h3 className="benefit-title">{benefit.title}</h3>
                <p className="benefit-description">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="partners-pricing">
        <div className="partners-container">
          <h2 className="section-title">{t('simple_transparent_pricing')}</h2>
          <p className="section-subtitle">
            {t('pricing_subtitle')}
          </p>
          
          <div className="pricing-preview-grid">
            {/* BASIC PLAN */}
            <div className="pricing-preview-card basic-preview">
              {/* Header */}
              <div className="preview-header">
                <span className="plan-badge">
                  <FontAwesomeIcon icon={faRocket} /> {t('basic_plan')}
                </span>
                <span className="plan-price-tag">{t('free')}</span>
              </div>

              {/* Preview Card */}
              <div className="business-card-preview">
                <div className="preview-image basic-image">
                  <i className="fas fa-building" style={{ fontSize: '4rem', color: '#9ca3af' }}></i>
                </div>
                <div className="preview-content">
                  <h3 className="preview-business-name">{t('your_business') || t('business_name') || 'Ваш Бизнес'}</h3>
                  <div className="preview-meta">
                    <span>{t('category') || 'Категория'}</span>
                    <span>{t('city') || 'Город'}</span>
                  </div>
                  <p className="preview-description">
                    {t('feature_simple_listing')}
                  </p>
                </div>
              </div>

              {/* Features Footer */}
              <div className="preview-footer">
                <small>
                  ✗ {t('no_photo') || 'Без фото'} • ✗ {t('no_rating') || 'Без рейтинга'} • ✗ {t('no_social') || 'Без соцсетей'}
                </small>
              </div>

              {/* CTA */}
              <button 
                onClick={() => handlePlanClick('basic')}
                className="pricing-cta"
              >
                <FontAwesomeIcon icon={faRocket} /> {t('get_started')}
              </button>
            </div>

            {/* PRO PLAN */}
            <div className="pricing-preview-card pro-preview popular">
              
              {/* Header */}
              <div className="preview-header">
                <span className="plan-badge pro-badge">
                  <FontAwesomeIcon icon={faBolt} /> {t('pro_plan')}
                </span>
                <span className="plan-price-tag">€29/{t('per_month')}</span>
              </div>

              {/* Preview Card */}
              <div className="business-card-preview verified-preview">
                <div className="preview-image pro-image">
                  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%233b82f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='white' font-weight='bold'%3E%D0%92%D0%B0%D1%88%D0%B5 %D1%84%D0%BE%D1%82%D0%BE%3C/text%3E%3C/svg%3E" alt="Preview" />
                  <div className="preview-verified-badge">
                    <FontAwesomeIcon icon={faShieldAlt} />
                    <span>Verified</span>
                  </div>
                </div>
                <div className="preview-content">
                  <h3 className="preview-business-name">
                    {t('your_business') || t('business_name') || 'Ваш Бизнес'} <span className="pro-checkmark">✔️</span>
                  </h3>
                  <div className="preview-meta">
                    <span>{t('category') || 'Категория'}</span>
                    <span>{t('city') || 'Город'}</span>
                  </div>
                  <div className="preview-rating">
                    <span className="stars">★★★★★</span>
                    <span className="rating-text">5.0 (10 {t('reviews') || 'отзывов'})</span>
                  </div>
                  <p className="preview-description">
                    {t('feature_priority_search')}
                  </p>
                  <div className="preview-social">
                    <span className="social-icon instagram"><i className="fab fa-instagram"></i></span>
                    <span className="social-icon tiktok"><i className="fab fa-tiktok"></i></span>
                    <span className="social-icon youtube"><i className="fab fa-youtube"></i></span>
                  </div>
                </div>
              </div>

              {/* Features Footer */}
              <div className="preview-footer">
                <small>
                  ✓ {t('photo') || 'Фото'} • ✓ {t('rating') || 'Рейтинг'} • ✓ {t('social') || 'Соцсети'} • ✓ {t('blue_checkmark') || 'Синяя галочка'}
                </small>
              </div>

              {/* CTA */}
              <button 
                onClick={() => handlePlanClick('pro')}
                className="pricing-cta cta-popular"
              >
                <FontAwesomeIcon icon={faBolt} /> {t('upgrade_to_pro')}
              </button>
            </div>

            {/* ENTERPRISE PLAN */}
            <div className="pricing-preview-card enterprise-preview">
              {/* Header */}
              <div className="preview-header">
                <span className="plan-badge enterprise-badge">
                  <FontAwesomeIcon icon={faCrown} /> {t('enterprise_plan')}
                </span>
                <span className="plan-price-tag">€50/{t('per_month')}</span>
              </div>

              {/* Preview Card */}
              <div className="business-card-preview enterprise-card">
                <div className="preview-image enterprise-image">
                  <div className="top-priority-badge">
                    <FontAwesomeIcon icon={faCrown} /> TOP Priority
                  </div>
                  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Cdefs%3E%3ClinearGradient id='gold' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23fbbf24'/%3E%3Cstop offset='100%25' style='stop-color:%23f59e0b'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='300' height='200' fill='url(%23gold)'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='white' font-weight='bold'%3E%D0%9F%D0%A0%D0%95%D0%9C%D0%98%D0%A3%D0%9C %D0%91%D0%90%D0%9D%D0%9D%D0%95%D0%A0%3C/text%3E%3C/svg%3E" alt="Premium" />
                </div>
                <div className="preview-content">
                  <h3 className="preview-business-name">
                    {t('your_business') || t('business_name') || 'Ваш Бизнес'} <span className="enterprise-crown">🏆</span>
                  </h3>
                  <div className="preview-meta">
                    <span>{t('category') || 'Категория'}</span>
                    <span>{t('city') || 'Город'}</span>
                  </div>
                  <div className="preview-rating">
                    <span className="stars gold-stars">★★★★★</span>
                    <span className="rating-text">5.0 (50+ {t('reviews') || 'отзывов'})</span>
                  </div>
                  <p className="preview-description">
                    {t('feature_featured_homepage')}
                  </p>
                  <div className="preview-social">
                    <span className="social-icon instagram"><i className="fab fa-instagram"></i></span>
                    <span className="social-icon tiktok"><i className="fab fa-tiktok"></i></span>
                    <span className="social-icon youtube"><i className="fab fa-youtube"></i></span>
                  </div>
                  <button className="preview-blog-button" type="button">
                    📰 {t('read_blog_review') || 'Читать обзор в блоге'}
                  </button>
                </div>
              </div>

              {/* Features Footer */}
              <div className="preview-footer">
                <small>
                  ✓ {t('all_from_pro') || 'Все из Pro'} • ✓ {t('gold_frame') || 'Золотая рамка'} • ✓ {t('blog') || 'Блог'} • ✓ {t('top_1') || 'ТОП-1'}
                </small>
              </div>

              {/* CTA */}
              <button 
                onClick={() => handlePlanClick('enterprise')}
                className="pricing-cta"
              >
                <FontAwesomeIcon icon={faCrown} /> {t('buy_luxury') || 'Купить Люкс'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA Section */}
      <section className="partners-footer-cta">
        <div className="partners-container">
          <h2>{t('ready_to_grow')}</h2>
          <p>{t('join_verified_businesses')}</p>
          <button 
            onClick={() => handlePlanClick('basic')}
            className="cta-button-large"
          >
            {t('get_started')}
          </button>
        </div>
      </section>
    </>
  );
}

export default PartnersPage;
