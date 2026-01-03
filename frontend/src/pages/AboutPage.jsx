// Kontrollitud.ee/frontend/src/pages/AboutPage.jsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShieldAlt, 
  faUsers, 
  faCheckCircle, 
  faStar,
  faGlobe,
  faHandshake,
  faChartLine,
  faLock
} from '@fortawesome/free-solid-svg-icons';
import '../styles/AboutPage.scss';
import logo from '../assets/logokontroll.jpg';

function AboutPage() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('about_page_title')} | Kontrollitud.ee</title>
        <meta name="description" content={t('about_page_description')} />
        <link rel="canonical" href="https://kontrollitud.ee/about" />
      </Helmet>

      <div className="about-page">
        {/* Hero Section */}
        <section className="about-hero">
          <div className="about-hero-content">
            <img src={logo} alt="Kontrollitud.ee Logo" className="about-logo" />
            <h1 className="about-hero-title">{t('about_hero_title')}</h1>
            <p className="about-hero-subtitle">{t('about_hero_subtitle')}</p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="about-section mission-section">
          <div className="container">
            <div className="section-header">
              <FontAwesomeIcon icon={faShieldAlt} className="section-icon" />
              <h2>{t('our_mission')}</h2>
            </div>
            <p className="mission-text">{t('mission_description')}</p>
          </div>
        </section>

        {/* Features Section */}
        <section className="about-section features-section">
          <div className="container">
            <h2 className="section-title">{t('why_kontrollitud')}</h2>
            
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <FontAwesomeIcon icon={faCheckCircle} />
                </div>
                <h3>{t('verified_businesses')}</h3>
                <p>{t('verified_businesses_desc')}</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <FontAwesomeIcon icon={faStar} />
                </div>
                <h3>{t('real_reviews')}</h3>
                <p>{t('real_reviews_desc')}</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <FontAwesomeIcon icon={faGlobe} />
                </div>
                <h3>{t('multilingual')}</h3>
                <p>{t('multilingual_desc')}</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <FontAwesomeIcon icon={faLock} />
                </div>
                <h3>{t('secure_platform')}</h3>
                <p>{t('secure_platform_desc')}</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <FontAwesomeIcon icon={faUsers} />
                </div>
                <h3>{t('community_driven')}</h3>
                <p>{t('community_driven_desc')}</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <FontAwesomeIcon icon={faHandshake} />
                </div>
                <h3>{t('free_for_all')}</h3>
                <p>{t('free_for_all_desc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="about-section stats-section">
          <div className="container">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">1000+</div>
                <div className="stat-label">{t('businesses')}</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">5000+</div>
                <div className="stat-label">{t('reviews')}</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">3</div>
                <div className="stat-label">{t('languages')}</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">100%</div>
                <div className="stat-label">{t('free')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="about-section how-it-works-section">
          <div className="container">
            <h2 className="section-title">{t('how_it_works')}</h2>
            
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-number">1</div>
                <h3>{t('step_1_title')}</h3>
                <p>{t('step_1_desc')}</p>
              </div>

              <div className="step-card">
                <div className="step-number">2</div>
                <h3>{t('step_2_title')}</h3>
                <p>{t('step_2_desc')}</p>
              </div>

              <div className="step-card">
                <div className="step-number">3</div>
                <h3>{t('step_3_title')}</h3>
                <p>{t('step_3_desc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="about-section cta-section">
          <div className="container">
            <div className="cta-content">
              <h2>{t('join_kontrollitud')}</h2>
              <p>{t('join_kontrollitud_desc')}</p>
              <div className="cta-buttons">
                <Link to="/add-business" className="btn btn-primary">
                  <FontAwesomeIcon icon={faChartLine} />
                  {t('add_business')}
                </Link>
                <Link to="/catalog" className="btn btn-secondary">
                  <FontAwesomeIcon icon={faUsers} />
                  {t('browse_businesses')}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="about-section contact-section">
          <div className="container">
            <h2 className="section-title">{t('contact_us')}</h2>
            <div className="contact-info">
              <p>
                <strong>{t('email')}:</strong> info@kontrollitud.ee
              </p>
              <p>
                <strong>{t('website')}:</strong> https://kontrollitud.ee
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default AboutPage;
