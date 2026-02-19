// Kontrollitud.ee/frontend/src/Footer.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './styles/Footer.scss';
import logo from './assets/logokontroll.webp';

function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-content">
                    {/* Logo & About */}
                    <div className="footer-section">
                        <Link to="/" className="footer-logo">
                            <img src={logo} alt="Kontrollitud.ee" width="40" height="40" />
                            <h3>Kontrollitud.ee</h3>
                        </Link>
                        <p className="footer-about">{t('footer_about')}</p>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-section">
                        <h4>{t('footer_quick_links')}</h4>
                        <ul className="footer-links">
                            <li><Link to="/">{t('home')}</Link></li>
                            <li><Link to="/add-business">{t('add_business')}</Link></li>
                            <li><Link to="/terms">{t('footer_terms')}</Link></li>
                            <li><Link to="/privacy">{t('footer_privacy')}</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="footer-section">
                        <h4>{t('footer_contact_us')}</h4>
                        <ul className="footer-links">
                            <li>info@kontrollitud.ee</li>
                            <li>+372 538 015 65</li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="footer-bottom">
                    <p>{t('footer_copyright')}</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
