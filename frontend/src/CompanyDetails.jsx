// Kontrollitud.ee/frontend/src/CompanyDetails.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import ReviewForm from './ReviewForm.jsx';
import { getLocalizedContent, formatDate, formatRelativeTime, getLocaleFromLanguage } from './utils/localization';
import { getCategoryIcon } from './constants/categories';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCheck } from '@fortawesome/free-solid-svg-icons';
import { faInstagram, faTiktok, faYoutube } from '@fortawesome/free-brands-svg-icons';
import './styles/CompanyDetails.scss';

const API_COMPANY_BASE = 'http://localhost:5000/api/companies';
const API_REVIEW_BASE = 'http://localhost:5000/api/reviews';

function CompanyDetails() {
    const { id } = useParams();
    const { t, i18n } = useTranslation();
    const currentLocale = getLocaleFromLanguage(i18n.language);
    const [company, setCompany] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCompanyData = async () => {
        try {
            const companyResponse = await fetch(`${API_COMPANY_BASE}/${id}`);
            if (!companyResponse.ok) {
                throw new Error(t('company_not_found'));
            }
            const companyData = await companyResponse.json();
            setCompany(companyData);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Function to fetch reviews
    const fetchReviews = async () => {
        try {
            const reviewResponse = await fetch(`${API_REVIEW_BASE}/${id}`);
            const reviewData = await reviewResponse.json();
            setReviews(reviewData);
        } catch (err) {
            console.error(t('reviews_load_error'), err);
        }
    };
    
    // Function called after adding a new review
    const handleReviewAdded = (newReview) => {
        // Update reviews list by adding the new one at the beginning
        setReviews([newReview, ...reviews]);
        
        // Reload company data to see updated rating and count
        fetchCompanyData(); 
    };

    useEffect(() => {
        if (id) {
            fetchCompanyData();
            fetchReviews(); // Load reviews when page loads
        }
    }, [id, i18n.language]); // Re-fetch when language changes

    if (loading) {
        return <div className="details-container">{t('loading')}</div>;
    }

    if (error) {
        return <div className="details-container error-message">{error}</div>;
    }

    if (!company) {
        return <div className="details-container">{t('no_company_data')}</div>;
    }
    
    // Helper function to render rating stars
    const renderRatingStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(<i key={i} className="fas fa-star" style={{ color: '#ffc107' }}></i>);
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars.push(<i key={i} className="fas fa-star-half-alt" style={{ color: '#ffc107' }}></i>);
            } else {
                stars.push(<i key={i} className="far fa-star" style={{ color: '#ffc107' }}></i>);
            }
        }
        return <span className="rating-stars">{stars}</span>;
    };
    
    // Get localized description with fallback placeholder
    const description = getLocalizedContent(company.description, i18n.language, t('description_not_available'));
    
    // Determine which language is actually being displayed for the description
    const getDisplayedLanguage = () => {
        if (!company.description) return null;
        if (company.description[i18n.language] && company.description[i18n.language].trim()) {
            return null; // Current language - no hint needed
        }
        if (company.description.et && company.description.et.trim()) {
            return 'et';
        }
        if (company.description.en && company.description.en.trim()) {
            return 'en';
        }
        if (company.description.ru && company.description.ru.trim()) {
            return 'ru';
        }
        return null;
    };
    
    const displayedLang = getDisplayedLanguage();
    
    // Prepare SEO metadata
    const pageTitle = `${company.name} | Kontrollitud.ee`;
    const metaDescription = description && description !== t('description_not_available') ? description.substring(0, 155) : `${company.name} ${company.city ? `- ${company.city}` : ''} - ${t('verified')} business on Kontrollitud.ee`;
    const ogImage = company.image || 'https://kontrollitud.ee/og-default.jpg';
    const currentUrl = `https://kontrollitud.ee/companies/${company.slug || id}`;
    const keywords = [
        company.name,
        company.mainCategory ? t(company.mainCategory) : '',
        company.subCategory ? t(company.subCategory) : '',
        company.city,
        'Estonia',
        'Eesti',
        'verified business',
        'kontrollitud ettevõte'
    ].filter(Boolean).join(', ');
    
    // Format working hours if available
    const formatWorkingHours = (hours) => {
        if (!hours || typeof hours !== 'object') return null;
        return Object.entries(hours).map(([day, time]) => (
            <div key={day} className="hours-row">
                <span className="day">{t(day)}:</span>
                <span className="time">{time}</span>
            </div>
        ));
    };
    
    return (
        <div className="business-details-page">
            {/* SEO Meta Tags */}
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={metaDescription} />
                <meta name="keywords" content={keywords} />
                <meta name="author" content="Kontrollitud.ee" />
                <meta name="robots" content="index, follow" />
                
                {/* Canonical Link */}
                <link rel="canonical" href={currentUrl} />
                
                {/* Open Graph / Facebook */}
                <meta property="og:type" content="business.business" />
                <meta property="og:site_name" content="Kontrollitud.ee" />
                <meta property="og:url" content={currentUrl} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={metaDescription} />
                <meta property="og:image" content={ogImage} />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:image:alt" content={company.name} />
                <meta property="og:locale" content="et_EE" />
                <meta property="og:locale:alternate" content="en_US" />
                <meta property="og:locale:alternate" content="ru_RU" />
                
                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content="@Kontrollitud" />
                <meta name="twitter:url" content={currentUrl} />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={metaDescription} />
                <meta name="twitter:image" content={ogImage} />
                <meta name="twitter:image:alt" content={company.name} />
                
                {/* Telegram */}
                <meta property="telegram:channel" content="@kontrollitud" />
                <meta property="telegram:card" content="summary_large_image" />
                
                {/* Schema.org JSON-LD for LocalBusiness */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "LocalBusiness",
                        "name": company.name,
                        "description": description !== t('description_not_available') ? description : company.name,
                        "image": ogImage,
                        "url": currentUrl,
                        "telephone": company.phone,
                        "email": company.email,
                        "address": {
                            "@type": "PostalAddress",
                            "addressLocality": company.city,
                            "addressCountry": "EE"
                        },
                        "aggregateRating": company.reviewsCount > 0 ? {
                            "@type": "AggregateRating",
                            "ratingValue": company.rating || 0,
                            "reviewCount": company.reviewsCount || 0,
                            "bestRating": 5,
                            "worstRating": 1
                        } : undefined,
                        "url": `https://kontrollitud.ee/companies/${id}`,
                        "telephone": company.phone || undefined,
                        "email": company.email || undefined,
                        "openingHoursSpecification": company.workingHours ? Object.entries(company.workingHours).map(([day, time]) => ({
                            "@type": "OpeningHoursSpecification",
                            "dayOfWeek": day.charAt(0).toUpperCase() + day.slice(1),
                            "opens": time.split('-')[0]?.trim(),
                            "closes": time.split('-')[1]?.trim()
                        })) : undefined
                    }, null, 2)}
                </script>
            </Helmet>

            {/* Back Navigation */}
            <div className="back-navigation">
                <Link to="/" className="back-link">
                    <i className="fas fa-arrow-left"></i> {t('back_to_list')}
                </Link>
            </div>

            {/* Hero Section with Large Image */}
            <section className="hero-section">
                <div className="hero-image-container">
                    {company.image ? (
                        <img 
                            src={company.image} 
                            alt={company.name}
                            className="hero-image"
                        />
                    ) : (
                        <div className="hero-image-placeholder">
                            <span className="hero-category-icon">
                                {getCategoryIcon(company.mainCategory || 'Teenused')}
                            </span>
                            <h2 className="hero-placeholder-text">{company.name}</h2>
                        </div>
                    )}
                    {/* Verified Badge Overlay */}
                    {company.isVerified && (
                        <div className="verified-badge-hero">
                            <i className="fas fa-check-circle"></i>
                            <span>{t('verified')}</span>
                        </div>
                    )}
                </div>
            </section>

            {/* Main Content Grid: Content + Sidebar */}
            <div className="content-grid">
                
                {/* Main Content Area */}
                <div className="main-content">
                    
                    {/* Company Header */}
                    <header className="company-header">
                        <h1 className="company-title">{company.name}</h1>
                        
                        {/* Meta Info */}
                        <div className="company-meta">
                            {company.mainCategory && company.subCategory ? (
                                <>
                                    <span className="category-badge">
                                        {getCategoryIcon(company.mainCategory)} {t(company.mainCategory)}
                                    </span>
                                    <span className="subcategory-badge">
                                        {t(company.subCategory)}
                                    </span>
                                </>
                            ) : (
                                <span className="category-badge">{t(company.category)}</span>
                            )}
                            {company.city && (
                                <span className="city-badge">
                                    <i className="fas fa-map-marker-alt"></i> {t(company.city)}
                                </span>
                            )}
                        </div>

                        {/* Rating */}
                        <div className="rating-section">
                            {renderRatingStars(company.rating || 0)}
                            <span className="rating-value">
                                {(company.rating || 0).toFixed(1)} / 5
                            </span>
                            <span className="rating-count">
                                ({company.reviewsCount || 0} {t('reviews')})
                            </span>
                        </div>
                    </header>

                    {/* Description */}
                    {description && description !== t('description_not_available') && (
                        <section className="description-section">
                            <h2>{t('description')}</h2>
                            {displayedLang && displayedLang !== i18n.language && (
                                <div className="language-fallback-hint">
                                    <i className="fas fa-info-circle"></i>
                                    <span>{t('showing_description_in')} {t(`language_${displayedLang}`)}</span>
                                </div>
                            )}
                            <p className="description-text">{description}</p>
                        </section>
                    )}
                    
                    {/* Reviews Section */}
                    <section className="reviews-section">
                        <h2 className="section-title">
                            {t('customer_reviews')} ({company.reviewsCount || 0})
                        </h2>

                        {/* Review Form */}
                        <ReviewForm 
                            companyId={company._id} 
                            onReviewAdded={handleReviewAdded} 
                        />

                        {/* Reviews List */}
                        <div className="reviews-list">
                            {reviews.length > 0 ? (
                                reviews.map(review => (
                                    <div key={review._id} className="review-item">
                                        <div className="review-header">
                                            <div className="review-user-info">
                                                <span className="review-user">{review.userName}</span>
                                                <div className="review-rating-inline">
                                                    {renderRatingStars(review.rating)}
                                                </div>
                                            </div>
                                            <span className="review-date">
                                                {formatRelativeTime(review.createdAt, currentLocale)}
                                            </span>
                                        </div>
                                        <p className="review-comment">{review.comment}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="no-reviews-message">{t('no_reviews_yet')}</p>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar - Contact Info & Working Hours */}
                <aside className="sidebar">
                    
                    {/* Contact Information Card */}
                    <div className="info-card">
                        <h3 className="info-card-title">
                            <i className="fas fa-info-circle"></i> {t('contact_info')}
                        </h3>
                        
                        <div className="info-list">
                            {company.phone && (
                                <div className="info-item">
                                    <i className="fas fa-phone"></i>
                                    <a href={`tel:${company.phone}`}>{company.phone}</a>
                                </div>
                            )}
                            
                            {company.email && (
                                <div className="info-item">
                                    <i className="fas fa-envelope"></i>
                                    <a href={`mailto:${company.email}`}>{company.email}</a>
                                </div>
                            )}
                            
                            {company.website && (
                                <div className="info-item">
                                    <i className="fas fa-globe"></i>
                                    <a href={company.website} target="_blank" rel="noopener noreferrer">
                                        {t('visit_website')}
                                    </a>
                                </div>
                            )}
                            
                            {company.address && (
                                <div className="info-item">
                                    <i className="fas fa-map-marker-alt"></i>
                                    <span>{company.address}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Working Hours Card */}
                    {company.workingHours && (
                        <div className="info-card">
                            <h3 className="info-card-title">
                                <i className="fas fa-clock"></i> {t('working_hours')}
                            </h3>
                            <div className="working-hours">
                                {formatWorkingHours(company.workingHours)}
                            </div>
                        </div>
                    )}

                    {/* Quick Stats Card */}
                    <div className="info-card stats-card">
                        <h3 className="info-card-title">
                            <i className="fas fa-chart-bar"></i> {t('quick_stats')}
                        </h3>
                        <div className="stats-list">
                            <div className="stat-item">
                                <span className="stat-label">{t('rating')}:</span>
                                <span className="stat-value">{(company.rating || 0).toFixed(1)} / 5</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">{t('reviews')}:</span>
                                <span className="stat-value">{company.reviewsCount || 0}</span>
                            </div>
                            {company.isVerified && (
                                <div className="stat-item verified-stat">
                                    <i className="fas fa-check-circle"></i>
                                    <span>{t('verified_business')}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Social Media Links Card */}
                    {(company.instagramUrl || company.tiktokUrl || company.youtubeUrl) && (
                        <div className="info-card social-card">
                            <h3 className="info-card-title">
                                <i className="fas fa-share-alt"></i> Social Media
                            </h3>
                            <div className="social-media-links-details">
                                {company.instagramUrl && (
                                    <a 
                                        href={company.instagramUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="social-link instagram"
                                        title="Instagram"
                                    >
                                        <FontAwesomeIcon icon={faInstagram} />
                                        <span>Instagram</span>
                                    </a>
                                )}
                                {company.tiktokUrl && (
                                    <a 
                                        href={company.tiktokUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="social-link tiktok"
                                        title="TikTok"
                                    >
                                        <FontAwesomeIcon icon={faTiktok} />
                                        <span>TikTok</span>
                                    </a>
                                )}
                                {company.youtubeUrl && (
                                    <a 
                                        href={company.youtubeUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="social-link youtube"
                                        title="YouTube"
                                    >
                                        <FontAwesomeIcon icon={faYoutube} />
                                        <span>YouTube</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Reviewer Badge Card */}
                    {company.reviewerName && (
                        <div className="info-card reviewer-card">
                            <div className="reviewer-badge-details">
                                <FontAwesomeIcon icon={faUserCheck} className="reviewer-icon" />
                                <div>
                                    <p className="reviewer-label">Verified by</p>
                                    <p className="reviewer-name">{company.reviewerName}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}

export default CompanyDetails;