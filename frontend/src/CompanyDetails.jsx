// Kontrollitud.ee/frontend/src/CompanyDetails.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReviewForm from './ReviewForm.jsx'; // 🟢 Импортируем форму
import './styles/CompanyDetails.scss'; // Для стилей

const API_COMPANY_BASE = 'http://localhost:5000/api/companies';
const API_REVIEW_BASE = 'http://localhost:5000/api/reviews';

function CompanyDetails() {
    const { id } = useParams();
    const { t } = useTranslation();
    const [company, setCompany] = useState(null);
    const [reviews, setReviews] = useState([]); // 🟢 Состояние для отзывов
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

    // 🟢 Функция для загрузки отзывов
    const fetchReviews = async () => {
        try {
            const reviewResponse = await fetch(`${API_REVIEW_BASE}/${id}`);
            const reviewData = await reviewResponse.json();
            setReviews(reviewData);
        } catch (err) {
            console.error(t('reviews_load_error'), err);
        }
    };
    
    // 🟢 Функция, вызываемая после добавления нового отзыва
    const handleReviewAdded = (newReview) => {
        // Обновляем список отзывов, добавляя новый в начало
        setReviews([newReview, ...reviews]);
        
        // Перезагружаем данные компании, чтобы увидеть обновленный рейтинг и счетчик
        fetchCompanyData(); 
    };

    useEffect(() => {
        if (id) {
            fetchCompanyData();
            fetchReviews(); // 🟢 Загружаем отзывы при загрузке страницы
        }
    }, [id]);

    if (loading) {
        return <div className="details-container">{t('loading')}</div>;
    }

    if (error) {
        return <div className="details-container error-message">{error}</div>;
    }

    if (!company) {
        return <div className="details-container">{t('no_company_data')}</div>;
    }
    
    // Вспомогательная функция для отображения рейтинга звездочками
    const renderRatingStars = (rating) => {
        const fullStars = '★'.repeat(Math.round(rating));
        const emptyStars = '☆'.repeat(5 - Math.round(rating));
        return <span className="rating-stars">{fullStars}{emptyStars}</span>;
    };
    
    return (
        <div className="details-container">
            <header className="company-details-header">
                <h2 className="details-title">{company.name}</h2>
                <div className="rating-info">
                    {renderRatingStars(company.averageRating)}
                    <span className="average-rating-text">
                        {company.averageRating.toFixed(1)} / 5
                    </span>
                    <span className="review-count-text">
                        ({company.reviewCount} {t('reviews')})
                    </span>
                </div>
            </header>

            <section className="details-main-section">
                <p className="details-category">{t('category')}: {company.category}</p>
                <p className="details-description">{company.description}</p>
                <p className="details-contact">{t('contact_email')}: {company.contactEmail}</p>
            </section>
            
            <hr className="details-separator" />
            
            {/* 🟢 СЕКЦИЯ ОТЗЫВОВ */}
            <section className="reviews-section">
                <h3 className="section-title">{t('customer_reviews')} ({company.reviewCount})</h3>

                {/* 1. Форма для добавления отзыва */}
                <ReviewForm 
                    companyId={company._id} 
                    onReviewAdded={handleReviewAdded} 
                />

                {/* 2. Список отзывов */}
                <div className="reviews-list">
                    {reviews.length > 0 ? (
                        reviews.map(review => (
                            <div key={review._id} className="review-item">
                                <div className="review-header">
                                    <span className="review-user">{review.userName}</span>
                                    <span className="review-date">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="review-rating">
                                    {renderRatingStars(review.rating)}
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
    );
}

export default CompanyDetails;