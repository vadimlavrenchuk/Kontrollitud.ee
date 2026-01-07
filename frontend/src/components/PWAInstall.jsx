// PWA Install Prompt Component
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './PWAInstall.css';

const PWAInstall = () => {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then((registration) => {
            console.log('SW registered:', registration);
          })
          .catch((error) => {
            console.log('SW registration failed:', error);
          });
      });
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);

      // Show install prompt after user has spent some time on site
      // This prevents aggressive prompting
      setTimeout(() => {
        // Check if user hasn't dismissed the prompt before
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        const installed = localStorage.getItem('pwa-installed');
        
        if (!dismissed && !installed) {
          setShowInstallPrompt(true);
        }
      }, 30000); // Show after 30 seconds
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detect if app is already installed
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      localStorage.setItem('pwa-installed', 'true');
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    if (outcome === 'accepted') {
      localStorage.setItem('pwa-installed', 'true');
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
    // Allow showing again after 7 days
    setTimeout(() => {
      localStorage.removeItem('pwa-install-dismissed');
    }, 7 * 24 * 60 * 60 * 1000);
  };

  const handleRemindLater = () => {
    setShowInstallPrompt(false);
    // Show again after 24 hours
    setTimeout(() => {
      setShowInstallPrompt(true);
    }, 24 * 60 * 60 * 1000);
  };

  if (!showInstallPrompt) {
    return null;
  }

  return (
    <div className="pwa-install-prompt">
      <div className="pwa-install-card">
        <button className="pwa-close-btn" onClick={handleDismiss}>
          ×
        </button>
        
        <div className="pwa-install-icon">
          📱
        </div>
        
        <h3 className="pwa-install-title">
          {t('pwa_install_title')}
        </h3>
        
        <p className="pwa-install-description">
          {t('pwa_install_description')}
        </p>
        
        <div className="pwa-install-benefits">
          <div className="pwa-benefit">
            <span className="pwa-benefit-icon">⚡</span>
            <span>{t('pwa_benefit_fast')}</span>
          </div>
          <div className="pwa-benefit">
            <span className="pwa-benefit-icon">📴</span>
            <span>{t('pwa_benefit_offline')}</span>
          </div>
          <div className="pwa-benefit">
            <span className="pwa-benefit-icon">🏠</span>
            <span>{t('pwa_benefit_homescreen')}</span>
          </div>
        </div>
        
        <div className="pwa-install-actions">
          <button className="pwa-install-btn" onClick={handleInstallClick}>
            {t('pwa_install_button')}
          </button>
          <button className="pwa-remind-btn" onClick={handleRemindLater}>
            {t('pwa_remind_later')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstall;
