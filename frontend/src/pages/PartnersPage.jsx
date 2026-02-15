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
        const apiUrl = import.meta.env.VITE_API_URL || '';
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
              {t('learn_more')}
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

      {/* Free Listing Section */}
      <section id="pricing" className="partners-pricing">
        <div className="partners-container">
          <div className="free-listing-block">
            <h2 className="section-title">{t('simple_transparent_pricing')}</h2>
            <p className="free-listing-text">
              {t('pricing_subtitle')}
            </p>
            <button 
              onClick={() => navigate('/add-business')}
              className="create-profile-button"
            >
              {t('create_profile')}
            </button>
          </div>
        </div>
      </section>

      {/* Footer CTA Section */}
      <section className="partners-footer-cta">
        <div className="partners-container">
          <h2>{t('ready_to_grow')}</h2>
          <p>{t('join_verified_businesses')}</p>
          <button 
            onClick={() => navigate('/add-business')}
            className="cta-button-large"
          >
            {t('create_profile')}
          </button>
        </div>
      </section>
    </>
  );
}

export default PartnersPage;
