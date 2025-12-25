// Kontrollitud.ee/frontend/src/ReviewForm.jsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './styles/ReviewForm.scss'; // Будем использовать этот файл для стилей

const API_BASE_URL = 'http://localhost:5000/api/reviews';

function ReviewForm({ companyId, onReviewAdded }) {
    const { t } = useTranslation();
    const [userName, setUserName] = useState('');
    const [rating, setRating] = useState(5); // Начинаем с 5 звезд
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
            // Очищаем форму
            setUserName('');
            setRating(5);
            setComment('');

            // Вызываем функцию обратного вызова для обновления списка отзывов
            onReviewAdded(data); 

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
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
                    <label htmlFor="rating">{t('rating')}:</label>
                    <select
                        id="rating"
                        className="form-select"
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        required
                        disabled={loading}
                    >
                        {[5, 4, 3, 2, 1].map(r => (
                            <option key={r} value={r}>{r} {t('stars')}</option>
                        ))}
                    </select>
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