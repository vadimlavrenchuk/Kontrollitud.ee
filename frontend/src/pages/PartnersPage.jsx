// Kontrollitud.ee/frontend/src/pages/PartnersPage.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
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
  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

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
          
          <div className="pricing-grid">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
                {plan.popular && <div className="popular-badge">{t('most_popular')}</div>}
                
                <div className="pricing-icon">
                  <FontAwesomeIcon icon={plan.icon} />
                </div>
                
                <h3 className="pricing-name">{plan.name}</h3>
                
                <div className="pricing-price">
                  <span className="price">{plan.price}</span>
                  {plan.period && <span className="period">{plan.period}</span>}
                </div>
                
                <ul className="pricing-features">
                  {plan.features.map((feature, idx) => (
                    <li key={idx}>
                      <FontAwesomeIcon icon={faCheckCircle} className="check-icon" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {plan.ctaLink.startsWith('#') ? (
                  <a href={plan.ctaLink} className={`pricing-cta ${plan.popular ? 'cta-popular' : ''}`}>
                    {plan.ctaText}
                  </a>
                ) : (
                  <Link to={plan.ctaLink} className={`pricing-cta ${plan.popular ? 'cta-popular' : ''}`}>
                    {plan.ctaText}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact" className="partners-contact">
        <div className="partners-container">
          <div className="contact-header">
            <h2 className="section-title">{t('get_in_touch_title')}</h2>
            <p className="section-subtitle">
              {t('get_in_touch_subtitle')}
            </p>
          </div>

          <div className="contact-form-wrapper">
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="businessName">{t('business_name')} *</label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                  placeholder={t('business_name_placeholder')}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">{t('email_address')} *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder={t('email_placeholder')}
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="message">{t('message_label')} *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder={t('message_placeholder')}
                ></textarea>
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    {t('sending')}
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faEnvelope} />
                    {t('send_message_btn')}
                  </>
                )}
              </button>

              {submitted && (
                <div className="success-message">
                  <FontAwesomeIcon icon={faCheckCircle} />
                  {t('success_message')}
                </div>
              )}

              {error && (
                <div className="error-message">
                  <FontAwesomeIcon icon={faExclamationCircle} />
                  {error}
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

export default PartnersPage;
