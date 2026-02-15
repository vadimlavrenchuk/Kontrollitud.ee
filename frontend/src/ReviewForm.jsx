// Kontrollitud.ee/frontend/src/ReviewForm.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext.jsx';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faStar, 
    faCommentDots, 
    faLock, 
    faSignInAlt, 
    faUser, 
    faCheckCircle, 
    faComment, 
    faInfoCircle, 
    faSpinner, 
    faPaperPlane, 
    faExclamationCircle 
} from '@fortawesome/free-solid-svg-icons';
import './styles/ReviewForm.scss';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { 
    checkBadWords, 
    checkSpamPatterns, 
    checkContentRequirements,
    checkAntiFlood,
    isUserTrusted,
    determineModerStatus,
    getModerationErrorMessage
} from './utils/moderationUtils';
import { MODERATION_STATUS } from './utils/moderationConfig';

function ReviewForm({ companyId, onReviewAdded }) {
    const { t, i18n } = useTranslation();
    const { user, isAuthenticated } = useAuth();
    const [rating, setRating] = useState(5);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isTrustedUser, setIsTrustedUser] = useState(false);
    const [charCount, setCharCount] = useState(0);

    // Check if user is trusted on mount
    useEffect(() => {
        const checkUserTrust = async () => {
            if (user && user.uid) {
                const trusted = await isUserTrusted(db, user.uid);
                setIsTrustedUser(trusted);
                if (trusted) {
                    console.log('✅ User is trusted - reviews will be auto-approved');
                }
            }
        };
        
        checkUserTrust();
    }, [user]);

    // Update character count
    useEffect(() => {
        setCharCount(comment.length);
    }, [comment]);

    // Calculate average rating for company
    const recalculateCompanyRating = async (companyId) => {
        try {
            console.log('📊 Recalculating rating for company:', companyId);
            
            // Get all reviews for this company
            const reviewsRef = collection(db, 'reviews');
            const q = query(reviewsRef, where('companyId', '==', companyId));
            const snapshot = await getDocs(q);
            
            let totalRating = 0;
            let count = 0;
            
            snapshot.forEach((doc) => {
                totalRating += doc.data().rating || 0;
                count++;
            });
            
            const averageRating = count > 0 ? totalRating / count : 0;
            
            console.log('✅ New rating:', {
                totalRating,
                reviewsCount: count,
                averageRating: averageRating.toFixed(2)
            });
            
            // Update company document
            const companyRef = doc(db, 'companies', companyId);
            await updateDoc(companyRef, {
                rating: parseFloat(averageRating.toFixed(2)),
                reviewsCount: count,
                updatedAt: serverTimestamp()
            });
            
            console.log('✅ Company rating updated successfully');
            return { rating: averageRating, reviewsCount: count };
        } catch (error) {
            console.error('❌ Error recalculating rating:', error);
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Check authentication
        if (!isAuthenticated || !user) {
            toast.error(t('login_required_to_review') || 'Please login to leave a review');
            setError(t('login_required_to_review') || 'You must be logged in to leave a review');
            return;
        }
        
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const currentLang = i18n.language || 'ru';
            
            // LAYER 1: Check bad words
            const badWordsCheck = checkBadWords(comment);
            if (!badWordsCheck.isClean) {
                const errorMsg = getModerationErrorMessage('contains_bad_words', currentLang);
                toast.error(errorMsg);
                setError(errorMsg);
                setLoading(false);
                return;
            }
            
            // LAYER 2: Check content requirements
            const contentCheck = checkContentRequirements(comment);
            if (!contentCheck.isValid) {
                const errorMsg = getModerationErrorMessage(contentCheck.errors[0], currentLang);
                toast.error(errorMsg);
                setError(errorMsg);
                setLoading(false);
                return;
            }
            
            // LAYER 3: Check spam patterns
            const spamCheck = checkSpamPatterns(comment);
            if (spamCheck.isSuspicious) {
                const errorMsg = getModerationErrorMessage(spamCheck.reasons[0], currentLang);
                toast.warning(errorMsg);
                // Don't block, but warn user
            }
            
            // LAYER 4: Anti-flood check
            const floodCheck = await checkAntiFlood(db, user.uid, companyId);
            if (!floodCheck.canReview) {
                const errorMsg = floodCheck.remainingMinutes 
                    ? `${getModerationErrorMessage(floodCheck.reason, currentLang)} (${floodCheck.remainingMinutes} мин.)`
                    : getModerationErrorMessage(floodCheck.reason, currentLang);
                toast.error(errorMsg);
                setError(errorMsg);
                setLoading(false);
                return;
            }
            
            // Determine moderation status
            const moderationStatus = determineModerStatus(comment, isTrustedUser);
            
            console.log('📝 Submitting review:', {
                companyId,
                userId: user.uid,
                userName: user.displayName || user.email,
                rating,
                comment: comment.substring(0, 50) + '...',
                moderationStatus,
                isTrustedUser
            });
            
            // Add review to Firestore
            const reviewData = {
                companyId: companyId,
                userId: user.uid,
                userName: user.displayName || user.email.split('@')[0],
                userEmail: user.email,
                rating: Number(rating),
                comment: comment.trim(),
                status: moderationStatus,
                createdAt: serverTimestamp()
            };
            
            const reviewRef = await addDoc(collection(db, 'reviews'), reviewData);
            console.log('✅ Review added with ID:', reviewRef.id);
            
            // Only recalculate if approved
            if (moderationStatus === MODERATION_STATUS.APPROVED) {
                await recalculateCompanyRating(companyId);
            }
            
            setSuccess(true);
            
            // Show appropriate message based on status
            if (moderationStatus === MODERATION_STATUS.APPROVED) {
                toast.success(t('review_submitted_success') || 'Review submitted successfully!');
            } else if (moderationStatus === MODERATION_STATUS.NEEDS_REVIEW) {
                toast.info('Ваш отзыв отправлен на модерацию и появится после проверки.');
            }
            
            // Clear the form
            setRating(5);
            setComment('');

            // Call the callback function to update the reviews list
            if (onReviewAdded && moderationStatus === MODERATION_STATUS.APPROVED) {
                onReviewAdded({
                    id: reviewRef.id,
                    ...reviewData,
                    createdAt: new Date()
                });
            }

        } catch (err) {
            console.error('❌ Error submitting review:', err);
            setError(err.message);
            toast.error(t('review_submit_error') || 'Failed to submit review');
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
                        disabled={loading || !isAuthenticated}
                        aria-label={`${star} ${t('stars')}`}
                    >
                        <FontAwesomeIcon 
                            icon={faStar}
                            className={star <= (hoveredRating || rating) ? 'star-filled' : 'star-empty'}
                        />
                    </button>
                ))}
                <span className="rating-label">{rating} {t('stars')}</span>
            </div>
        );
    };

    return (
        <div className="review-form-section">
            <h3 className="review-form-title">
                <FontAwesomeIcon icon={faCommentDots} /> {t('add_your_review')}
            </h3>
            
            {!isAuthenticated ? (
                <div className="login-required-notice">
                    <FontAwesomeIcon icon={faLock} />
                    <p>{t('login_required_to_review') || 'Please login to leave a review'}</p>
                    <a href="/auth" className="login-link">
                        <FontAwesomeIcon icon={faSignInAlt} /> {t('login') || 'Login'}
                    </a>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="review-form">
                    
                    <div className="form-group">
                        <label htmlFor="user-display">
                            <FontAwesomeIcon icon={faUser} /> {t('reviewing_as')}:
                        </label>
                        <div className="user-display">
                            <span className="user-badge">
                                {user?.displayName || user?.email?.split('@')[0]}
                            </span>
                            {isTrustedUser && (
                                <span className="trusted-badge" title="Trusted user - auto-approved reviews">
                                    <FontAwesomeIcon icon={faCheckCircle} /> Trusted
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>
                            <FontAwesomeIcon icon={faStar} /> {t('rating')}:
                        </label>
                        <StarRatingSelector />
                    </div>

                    <div className="form-group">
                        <label htmlFor="comment">
                            <FontAwesomeIcon icon={faComment} /> {t('comment')}:
                        </label>
                        <textarea
                            id="comment"
                            className="form-textarea"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder={t('share_your_experience') || 'Share your experience...'}
                            required
                            disabled={loading}
                            minLength={10}
                            maxLength={2000}
                        />
                        <div className="textarea-footer">
                            <small className="char-count" style={{ color: charCount < 10 ? '#ef4444' : charCount > 2000 ? '#f59e0b' : '#6b7280' }}>
                                {charCount} / 2000 {charCount < 10 && '(минимум 10 символов)'}
                            </small>
                            <small className="moderation-hint">
                                <FontAwesomeIcon icon={faInfoCircle} /> Без ссылок, email, телефонов
                            </small>
                        </div>
                    </div>
                    
                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin /> {t('submitting') || 'Submitting...'}
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faPaperPlane} /> {t('submit_review') || 'Submit Review'}
                            </>
                        )}
                    </button>

                    {error && (
                        <div className="review-error-message">
                            <FontAwesomeIcon icon={faExclamationCircle} /> {error}
                        </div>
                    )}
                    {success && (
                        <div className="review-success-message">
                            <FontAwesomeIcon icon={faCheckCircle} /> {t('review_submitted_success') || 'Review submitted successfully!'}
                        </div>
                    )}

                </form>
            )}
        </div>
    );
}

export default ReviewForm;