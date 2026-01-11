// PWA Install Prompt Component with iOS Support
import React, { useState, useEffect, createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import './PWAInstall.css';

// Create context for PWA install state
const PWAContext = createContext();

export const usePWA = () => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within PWAProvider');
  }
  return context;
};

// PWA Provider Component
export const PWAProvider = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running on iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // Check if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      window.navigator.standalone || 
                      document.referrer.includes('android-app://');
    setIsStandalone(standalone);

    // Register Service Worker
    if ('serviceWorker' in navigator && !standalone) {
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

    // Listen for beforeinstallprompt event (Android/Desktop)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detect if app is installed
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      localStorage.setItem('pwa-installed', 'true');
      setIsInstallable(false);
      setDeferredPrompt(null);
      setIsStandalone(true);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) {
      return false;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      localStorage.setItem('pwa-installed', 'true');
    }

    setDeferredPrompt(null);
    setIsInstallable(false);
    return outcome === 'accepted';
  };

  return (
    <PWAContext.Provider value={{ 
      deferredPrompt, 
      isInstallable, 
      isIOS, 
      isStandalone,
      installPWA 
    }}>
      {children}
    </PWAContext.Provider>
  );
};

// PWA Install Button Component (for menu)
export const PWAInstallButton = () => {
  const { t } = useTranslation();
  const { isInstallable, isIOS, isStandalone, installPWA } = usePWA();
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  // Don't show if already installed
  if (isStandalone) {
    return null;
  }

  const handleClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
    } else if (isInstallable) {
      await installPWA();
    }
  };

  return (
    <>
      <button className="dropdown-item pwa-install-menu-item" onClick={handleClick}>
        <i className="fas fa-download"></i>
        <span>{t('pwa_install_app')}</span>
      </button>

      {showIOSInstructions && (
        <IOSInstallInstructions onClose={() => setShowIOSInstructions(false)} />
      )}
    </>
  );
};

// iOS Install Instructions Modal
const IOSInstallInstructions = ({ onClose }) => {
  const { t } = useTranslation();

  return (
    <div className="pwa-ios-modal-overlay" onClick={onClose}>
      <div className="pwa-ios-modal" onClick={(e) => e.stopPropagation()}>
        <button className="pwa-close-btn" onClick={onClose}>
          ×
        </button>
        
        <div className="pwa-ios-icon">📱</div>
        
        <h3 className="pwa-ios-title">{t('pwa_ios_install_title')}</h3>
        
        <div className="pwa-ios-instructions">
          <div className="pwa-ios-step">
            <div className="pwa-ios-step-number">1</div>
            <div className="pwa-ios-step-content">
              <p>{t('pwa_ios_step1')}</p>
              <div className="pwa-ios-icon-demo">
                <i className="fas fa-share"></i>
              </div>
            </div>
          </div>
          
          <div className="pwa-ios-step">
            <div className="pwa-ios-step-number">2</div>
            <div className="pwa-ios-step-content">
              <p>{t('pwa_ios_step2')}</p>
              <div className="pwa-ios-icon-demo">
                <i className="fas fa-plus-square"></i>
              </div>
            </div>
          </div>
          
          <div className="pwa-ios-step">
            <div className="pwa-ios-step-number">3</div>
            <div className="pwa-ios-step-content">
              <p>{t('pwa_ios_step3')}</p>
            </div>
          </div>
        </div>
        
        <button className="pwa-ios-close-btn" onClick={onClose}>
          {t('pwa_got_it')}
        </button>
      </div>
    </div>
  );
};

// Main PWA Install Component (Auto Banner)
const PWAInstall = () => {
  const { t } = useTranslation();
  const { isInstallable, isIOS, isStandalone, installPWA } = usePWA();
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Don't show banner if already installed
    if (isStandalone) {
      return;
    }

    // Check if user dismissed the banner
    const dismissed = localStorage.getItem('pwa-banner-dismissed');
    const dismissedTime = localStorage.getItem('pwa-banner-dismissed-time');
    
    // Show again after 7 days
    if (dismissed && dismissedTime) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // Show banner after 10 seconds for better UX
    const timer = setTimeout(() => {
      if (isInstallable || isIOS) {
        setShowBanner(true);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [isInstallable, isIOS, isStandalone]);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
    } else {
      const installed = await installPWA();
      if (installed) {
        setShowBanner(false);
      }
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-banner-dismissed', 'true');
    localStorage.setItem('pwa-banner-dismissed-time', Date.now().toString());
  };

  if (!showBanner || isStandalone) {
    return null;
  }

  return (
    <>
      <div className="pwa-install-banner">
        <div className="pwa-banner-content">
          <div className="pwa-banner-icon">📱</div>
          <div className="pwa-banner-text">
            <h4>{t('pwa_banner_title')}</h4>
            <p>{t('pwa_banner_description')}</p>
          </div>
        </div>
        <div className="pwa-banner-actions">
          <button className="pwa-banner-btn-install" onClick={handleInstall}>
            {t('pwa_install_button')}
          </button>
          <button className="pwa-banner-btn-dismiss" onClick={handleDismiss}>
            ×
          </button>
        </div>
      </div>

      {showIOSInstructions && (
        <IOSInstallInstructions onClose={() => setShowIOSInstructions(false)} />
      )}
    </>
  );
};

export default PWAInstall;
