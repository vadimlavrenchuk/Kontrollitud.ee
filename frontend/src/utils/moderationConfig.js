// Kontrollitud.ee/frontend/src/utils/moderationConfig.js
// Moderation configuration for reviews

export const BAD_WORDS = {
  // Russian profanity and spam phrases
  ru: [
    'хуй', 'пизд', 'ебать', 'ебл', 'бля', 'сук', 'гандон', 'мудак', 'говно',
    'дерьмо', 'долбоеб', 'пидор', 'еблан', 'пидр', 'уебок', 'хуя', 'ублюдок',
    'шлюх', 'сволоч', 'гнид', 'скотин', 'мраз', 'выебать', 'наебать', 'охуе',
    'казино', 'заработок в интернете', 'кликай здесь', 'заработай быстро',
    'инвестиции без риска', 'купить диплом', 'виагра', 'займ срочно'
  ],
  
  // Estonian profanity and spam
  et: [
    'türa', 'perse', 'sitt', 'kurat', 'pede', 'loll', 'idioot', 'debiilik',
    'putsi', 'vittu', 'saatana', 'paskan', 'jobu', 'kahju', 'räme',
    'kasiino', 'kiire raha', 'kliki siia', 'osta diplom', 'laen kiirelt'
  ],
  
  // English profanity and spam
  en: [
    'fuck', 'shit', 'bitch', 'asshole', 'damn', 'crap', 'bastard', 'dick',
    'pussy', 'cock', 'slut', 'whore', 'nigger', 'fag', 'retard', 'idiot',
    'casino', 'click here', 'earn money fast', 'buy diploma', 'viagra',
    'quick loan', 'investment opportunity', 'get rich quick', 'make money online'
  ]
};

// Spam patterns (URLs, excessive caps, etc.)
export const SPAM_PATTERNS = {
  // URLs in text
  url: /https?:\/\/[^\s]+|www\.[^\s]+|\b[a-z0-9-]+\.(com|net|org|ru|ee)\b/gi,
  
  // Email addresses
  email: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi,
  
  // Phone numbers (international format)
  phone: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
  
  // Excessive caps (more than 50% uppercase in words longer than 5 chars)
  excessiveCaps: (text) => {
    const words = text.split(/\s+/).filter(w => w.length > 5);
    const capsWords = words.filter(w => {
      const upperCount = (w.match(/[A-ZА-ЯÄÖÜÕ]/g) || []).length;
      return upperCount / w.length > 0.5;
    });
    return capsWords.length / words.length > 0.3; // More than 30% words in caps
  },
  
  // Repeated characters (like "!!!!!!!" or "aaaaaaa")
  repeatedChars: /(.)\1{5,}/g,
  
  // Repeated words
  repeatedWords: /\b(\w+)\s+\1\b/gi
};

// Minimum content requirements
export const CONTENT_REQUIREMENTS = {
  minLength: 10,
  maxLength: 2000,
  minWords: 3,
  maxUrlsAllowed: 0,
  maxRepeatedChars: 5
};

// Trusted user thresholds
export const TRUSTED_USER_CONFIG = {
  minApprovedReviews: 3, // After 3 approved reviews, user becomes trusted
  autoApproveForTrusted: true
};

// Anti-flood settings
export const ANTI_FLOOD = {
  reviewsPerCompanyPer24h: 1, // 1 review per company per 24 hours
  reviewsPerUserPer24h: 5, // Max 5 reviews total per day
  cooldownMinutes: 5 // 5 minutes between any reviews
};

// Moderation actions
export const MODERATION_STATUS = {
  APPROVED: 'approved',
  PENDING: 'pending',
  REJECTED: 'rejected',
  NEEDS_REVIEW: 'needs_review'
};

// Suspicious patterns that require manual review
export const SUSPICIOUS_PATTERNS = {
  tooShort: (text) => text.trim().length < CONTENT_REQUIREMENTS.minLength,
  tooLong: (text) => text.trim().length > CONTENT_REQUIREMENTS.maxLength,
  hasUrls: (text) => SPAM_PATTERNS.url.test(text),
  hasEmail: (text) => SPAM_PATTERNS.email.test(text),
  hasPhone: (text) => SPAM_PATTERNS.phone.test(text),
  excessiveCaps: (text) => SPAM_PATTERNS.excessiveCaps(text),
  repeatedChars: (text) => SPAM_PATTERNS.repeatedChars.test(text),
  repeatedWords: (text) => SPAM_PATTERNS.repeatedWords.test(text)
};
