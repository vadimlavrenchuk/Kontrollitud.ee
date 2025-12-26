// Kontrollitud.ee/frontend/src/ReviewForm.jsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './styles/ReviewForm.scss';

const API_BASE_URL = 'http://localhost:5000/api/reviews';

function ReviewForm({ companyId, onReviewAdded }) {
    const { t } = useTranslation();
    const [userName, setUserName] = useState('');
    const [rating, setRating] = useState(5);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await fetch(`${API_BASE_URL}/${companyId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userName, rating: Number(rating), comment }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || t('review_submit_error'));
            }

            setSuccess(true);
            // Clear the form
            setUserName('');
            setRating(5);
            setComment('');

            // Call the callback function to update the reviews list
            onReviewAdded(data); 

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Star Rating Component
    const StarRatingSelector = () => {
        return (
            <div className="star-rating-selector">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        className="star-button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        disabled={loading}
                    >
                        <i 
                            className={`fas fa-star ${
                                star <= (hoveredRating || rating) ? 'star-filled' : 'star-empty'
                            }`}
                        />
                    </button>
                ))}
                <span className="rating-label">{rating} {t('stars')}</span>
            </div>
        );
    };

    return (
        <div className="review-form-section">
            <h3 className="review-form-title">{t('add_your_review')}</h3>
            <form onSubmit={handleSubmit} className="review-form">
                
                <div className="form-group">
                    <label htmlFor="userName">{t('your_name')}:</label>
                    <input
                        id="userName"
                        type="text"
                        className="form-input"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder={t('anonymous_placeholder')}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label>{t('rating')}:</label>
                    <StarRatingSelector />
                </div>

                <div className="form-group">
                    <label htmlFor="comment">{t('comment')}:</label>
                    <textarea
                        id="comment"
                        className="form-textarea"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>
                
                <button type="submit" className="submit-button" disabled={loading}>
                    {loading ? t('submitting') : t('submit_review')}
                </button>

                {error && <p className="review-error-message">{error}</p>}
                {success && <p className="review-success-message">{t('review_submitted_success')}</p>}

            </form>
        </div>
    );
}

export default ReviewForm;