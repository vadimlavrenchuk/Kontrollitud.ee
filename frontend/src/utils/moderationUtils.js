// Kontrollitud.ee/frontend/src/utils/moderationUtils.js
// Moderation utility functions

import { 
  BAD_WORDS, 
  SPAM_PATTERNS, 
  CONTENT_REQUIREMENTS,
  SUSPICIOUS_PATTERNS,
  MODERATION_STATUS,
  TRUSTED_USER_CONFIG,
  ANTI_FLOOD
} from './moderationConfig';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

/**
 * Check if text contains bad words
 * @param {string} text - Text to check
 * @returns {object} { isClean: boolean, foundWords: string[] }
 */
export const checkBadWords = (text) => {
  const lowerText = text.toLowerCase();
  const foundWords = [];
  
  // Check all language lists
  Object.values(BAD_WORDS).forEach(wordList => {
    wordList.forEach(badWord => {
      // Use word boundaries to avoid false positives
      const regex = new RegExp(`\\b${badWord}`, 'i');
      if (regex.test(lowerText)) {
        foundWords.push(badWord);
      }
    });
  });
  
  return {
    isClean: foundWords.length === 0,
    foundWords
  };
};

/**
 * Check for spam patterns
 * @param {string} text - Text to check
 * @returns {object} { isSuspicious: boolean, reasons: string[] }
 */
export const checkSpamPatterns = (text) => {
  const reasons = [];
  
  if (SUSPICIOUS_PATTERNS.hasUrls(text)) {
    reasons.push('contains_urls');
  }
  
  if (SUSPICIOUS_PATTERNS.hasEmail(text)) {
    reasons.push('contains_email');
  }
  
  if (SUSPICIOUS_PATTERNS.hasPhone(text)) {
    reasons.push('contains_phone');
  }
  
  if (SUSPICIOUS_PATTERNS.excessiveCaps(text)) {
    reasons.push('excessive_caps');
  }
  
  if (SUSPICIOUS_PATTERNS.repeatedChars(text)) {
    reasons.push('repeated_chars');
  }
  
  if (SUSPICIOUS_PATTERNS.repeatedWords(text)) {
    reasons.push('repeated_words');
  }
  
  return {
    isSuspicious: reasons.length > 0,
    reasons
  };
};

/**
 * Check content requirements
 * @param {string} text - Text to check
 * @returns {object} { isValid: boolean, errors: string[] }
 */
export const checkContentRequirements = (text) => {
  const errors = [];
  const trimmedText = text.trim();
  const wordCount = trimmedText.split(/\s+/).filter(w => w.length > 0).length;
  
  if (trimmedText.length < CONTENT_REQUIREMENTS.minLength) {
    errors.push('too_short');
  }
  
  if (trimmedText.length > CONTENT_REQUIREMENTS.maxLength) {
    errors.push('too_long');
  }
  
  if (wordCount < CONTENT_REQUIREMENTS.minWords) {
    errors.push('too_few_words');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Check if user is trusted (has approved reviews)
 * @param {object} db - Firestore instance
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if user is trusted
 */
export const isUserTrusted = async (db, userId) => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      where('userId', '==', userId),
      where('status', '==', MODERATION_STATUS.APPROVED)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.size >= TRUSTED_USER_CONFIG.minApprovedReviews;
  } catch (error) {
    console.error('Error checking user trust status:', error);
    return false;
  }
};

/**
 * Check anti-flood: has user already reviewed this company recently?
 * @param {object} db - Firestore instance
 * @param {string} userId - User ID
 * @param {string} companyId - Company ID
 * @returns {Promise<object>} { canReview: boolean, reason: string }
 */
export const checkAntiFlood = async (db, userId, companyId) => {
  try {
    const reviewsRef = collection(db, 'reviews');
    
    // Check for same company in last 24h
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);
    
    const companyQuery = query(
      reviewsRef,
      where('userId', '==', userId),
      where('companyId', '==', companyId),
      where('createdAt', '>=', Timestamp.fromDate(yesterday))
    );
    
    const companySnapshot = await getDocs(companyQuery);
    
    if (companySnapshot.size > 0) {
      return {
        canReview: false,
        reason: 'already_reviewed_company_24h'
      };
    }
    
    // Check total reviews in last 24h
    const userQuery = query(
      reviewsRef,
      where('userId', '==', userId),
      where('createdAt', '>=', Timestamp.fromDate(yesterday))
    );
    
    const userSnapshot = await getDocs(userQuery);
    
    if (userSnapshot.size >= ANTI_FLOOD.reviewsPerUserPer24h) {
      return {
        canReview: false,
        reason: 'too_many_reviews_24h'
      };
    }
    
    // Check cooldown (last review time)
    const recentQuery = query(
      reviewsRef,
      where('userId', '==', userId)
    );
    
    const recentSnapshot = await getDocs(recentQuery);
    
    if (recentSnapshot.size > 0) {
      const reviews = [];
      recentSnapshot.forEach(doc => {
        reviews.push(doc.data());
      });
      
      // Sort by createdAt descending
      reviews.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
        return dateB - dateA;
      });
      
      const lastReview = reviews[0];
      const lastReviewTime = lastReview.createdAt?.toDate ? lastReview.createdAt.toDate() : new Date(0);
      const cooldownMs = ANTI_FLOOD.cooldownMinutes * 60 * 1000;
      const timeSinceLastReview = Date.now() - lastReviewTime.getTime();
      
      if (timeSinceLastReview < cooldownMs) {
        const remainingMinutes = Math.ceil((cooldownMs - timeSinceLastReview) / 60000);
        return {
          canReview: false,
          reason: 'cooldown_active',
          remainingMinutes
        };
      }
    }
    
    return {
      canReview: true,
      reason: null
    };
  } catch (error) {
    console.error('Error checking anti-flood:', error);
    return {
      canReview: true,
      reason: null
    };
  }
};

/**
 * Determine moderation status for review
 * @param {string} text - Review text
 * @param {boolean} isTrustedUser - Is user trusted
 * @returns {string} Moderation status
 */
export const determineModerStatus = (text, isTrustedUser = false) => {
  // Check bad words first - instant rejection
  const badWordsCheck = checkBadWords(text);
  if (!badWordsCheck.isClean) {
    return MODERATION_STATUS.REJECTED;
  }
  
  // Check content requirements
  const contentCheck = checkContentRequirements(text);
  if (!contentCheck.isValid) {
    return MODERATION_STATUS.REJECTED;
  }
  
  // Check spam patterns
  const spamCheck = checkSpamPatterns(text);
  if (spamCheck.isSuspicious) {
    // If user is trusted, still needs review but not auto-rejected
    return MODERATION_STATUS.NEEDS_REVIEW;
  }
  
  // If trusted user and passed all checks - auto approve
  if (isTrustedUser && TRUSTED_USER_CONFIG.autoApproveForTrusted) {
    return MODERATION_STATUS.APPROVED;
  }
  
  // New users with clean content - auto approve
  return MODERATION_STATUS.APPROVED;
};

/**
 * Get user-friendly error message
 * @param {string} errorCode - Error code
 * @param {string} lang - Language (ru, et, en)
 * @returns {string} Error message
 */
export const getModerationErrorMessage = (errorCode, lang = 'ru') => {
  const messages = {
    ru: {
      contains_bad_words: 'Пожалуйста, соблюдайте правила сообщества. Ваш отзыв содержит недопустимые слова.',
      contains_urls: 'Отзывы не могут содержать ссылки.',
      contains_email: 'Отзывы не могут содержать email адреса.',
      contains_phone: 'Отзывы не могут содержать номера телефонов.',
      excessive_caps: 'Пожалуйста, не используйте слишком много заглавных букв.',
      repeated_chars: 'Пожалуйста, избегайте повторяющихся символов.',
      repeated_words: 'Пожалуйста, избегайте повторяющихся слов.',
      too_short: `Отзыв слишком короткий. Минимум ${CONTENT_REQUIREMENTS.minLength} символов.`,
      too_long: `Отзыв слишком длинный. Максимум ${CONTENT_REQUIREMENTS.maxLength} символов.`,
      too_few_words: `Отзыв должен содержать минимум ${CONTENT_REQUIREMENTS.minWords} слова.`,
      already_reviewed_company_24h: 'Вы уже оставили отзыв об этой компании. Можно оставить новый отзыв через 24 часа.',
      too_many_reviews_24h: `Вы достигли лимита отзывов (${ANTI_FLOOD.reviewsPerUserPer24h} в день). Попробуйте завтра.`,
      cooldown_active: 'Пожалуйста, подождите несколько минут перед следующим отзывом.'
    },
    et: {
      contains_bad_words: 'Palun järgige kogukonna reegleid. Teie arvustus sisaldab keelatud sõnu.',
      contains_urls: 'Arvustused ei tohi sisaldada linke.',
      contains_email: 'Arvustused ei tohi sisaldada e-posti aadresse.',
      contains_phone: 'Arvustused ei tohi sisaldada telefoninumbreid.',
      excessive_caps: 'Palun ärge kasutage liiga palju suurtähti.',
      repeated_chars: 'Palun vältige korduvaid tähemärke.',
      repeated_words: 'Palun vältige korduvaid sõnu.',
      too_short: `Arvustus on liiga lühike. Miinimum ${CONTENT_REQUIREMENTS.minLength} tähemärki.`,
      too_long: `Arvustus on liiga pikk. Maksimaalselt ${CONTENT_REQUIREMENTS.maxLength} tähemärki.`,
      too_few_words: `Arvustus peab sisaldama vähemalt ${CONTENT_REQUIREMENTS.minWords} sõna.`,
      already_reviewed_company_24h: 'Olete juba jätnud selle ettevõtte kohta arvustuse. Saate jätta uue arvustuse 24 tunni pärast.',
      too_many_reviews_24h: `Olete jõudnud arvustuste limiidini (${ANTI_FLOOD.reviewsPerUserPer24h} päevas). Proovige homme.`,
      cooldown_active: 'Palun oodake mõni minut enne järgmist arvustust.'
    },
    en: {
      contains_bad_words: 'Please follow community guidelines. Your review contains prohibited words.',
      contains_urls: 'Reviews cannot contain links.',
      contains_email: 'Reviews cannot contain email addresses.',
      contains_phone: 'Reviews cannot contain phone numbers.',
      excessive_caps: 'Please do not use too many capital letters.',
      repeated_chars: 'Please avoid repeated characters.',
      repeated_words: 'Please avoid repeated words.',
      too_short: `Review is too short. Minimum ${CONTENT_REQUIREMENTS.minLength} characters.`,
      too_long: `Review is too long. Maximum ${CONTENT_REQUIREMENTS.maxLength} characters.`,
      too_few_words: `Review must contain at least ${CONTENT_REQUIREMENTS.minWords} words.`,
      already_reviewed_company_24h: 'You have already reviewed this company. You can leave a new review in 24 hours.',
      too_many_reviews_24h: `You have reached the review limit (${ANTI_FLOOD.reviewsPerUserPer24h} per day). Try again tomorrow.`,
      cooldown_active: 'Please wait a few minutes before your next review.'
    }
  };
  
  return messages[lang]?.[errorCode] || messages.ru[errorCode] || 'Произошла ошибка при проверке отзыва.';
};
