/**
 * Content Moderation Utility
 * Автоматическая модерация контента с blacklist фильтрацией
 */

// Blacklist запрещенных слов (можно расширять)
const BLACKLIST_WORDS = [
  // Спам и мошенничество
  'casino', 'казино', 'kasiino',
  'porn', 'порно', 'porno',
  'viagra', 'виагра',
  'bitcoin', 'crypto', 'криптовалюта', 'krüpto',
  'loan', 'кредит', 'laen',
  'gambling', 'азартные', 'hasartmäng',
  'pharmacy', 'аптека', 'apteek',
  'forex', 'форекс',
  
  // Подозрительные паттерны
  'click here', 'кликни здесь', 'kliki siia',
  'buy now', 'купи сейчас', 'osta kohe',
  'earn money', 'заработай', 'teenida raha',
  'make money', 'зарабатывай',
  'free money', 'бесплатные деньги', 'tasuta raha',
  
  // Оскорбления (базовый список)
  'scam', 'мошенник', 'pettus',
  'fake', 'фейк', 'võlts',
  
  // SEO спам
  'seo services', 'seo услуги',
  'backlinks', 'бэклинки',
  'buy followers', 'купить подписчиков',
];

// Suspicious URL паттерны
const SUSPICIOUS_URL_PATTERNS = [
  /https?:\/\/[^\s]+\.ru\//i,  // Подозрительные .ru домены в описании
  /bit\.ly|tinyurl|short\.link/i,  // URL shorteners
  /\d{10,}/,  // Телефонные номера (10+ цифр подряд)
  /\$\d+|\d+\$/,  // Цены со знаком доллара
  /(buy|sell|cheap)\s+(online|here)/i,  // "Buy online", "Sell here"
];

/**
 * Проверка текста на запрещенные слова
 * @param {string} text - Текст для проверки
 * @returns {Object} - {isClean: boolean, foundWords: string[]}
 */
export function checkBlacklist(text) {
  if (!text || typeof text !== 'string') {
    return { isClean: true, foundWords: [] };
  }
  
  const lowerText = text.toLowerCase();
  const foundWords = [];
  
  for (const word of BLACKLIST_WORDS) {
    // Проверка с границами слов (не срабатывает на части слова)
    const regex = new RegExp(`\\b${word.toLowerCase()}\\b`, 'i');
    if (regex.test(lowerText)) {
      foundWords.push(word);
    }
  }
  
  return {
    isClean: foundWords.length === 0,
    foundWords
  };
}

/**
 * Проверка на подозрительные URL паттерны
 * @param {string} text - Текст для проверки
 * @returns {boolean} - true если чисто
 */
export function checkSuspiciousPatterns(text) {
  if (!text || typeof text !== 'string') {
    return true;
  }
  
  for (const pattern of SUSPICIOUS_URL_PATTERNS) {
    if (pattern.test(text)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Проверка на чрезмерное количество ссылок
 * @param {string} text - Текст для проверки
 * @returns {boolean} - true если нормально
 */
export function checkExcessiveLinks(text) {
  if (!text || typeof text !== 'string') {
    return true;
  }
  
  // Считаем количество URL в тексте
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const matches = text.match(urlRegex);
  const linkCount = matches ? matches.length : 0;
  
  // Более 3 ссылок в описании - подозрительно
  return linkCount <= 3;
}

/**
 * Проверка минимальной длины контента (антиспам)
 * @param {string} name - Название компании
 * @param {string} description - Описание
 * @returns {boolean} - true если валидно
 */
export function checkContentLength(name, description) {
  if (!name || !description) return false;
  
  // Название: минимум 3 символа, максимум 100
  if (name.length < 3 || name.length > 100) return false;
  
  // Описание: минимум 20 символов (реальное описание бизнеса)
  if (description.length < 20) return false;
  
  return true;
}

/**
 * Проверка на повторяющиеся символы (спам паттерн)
 * @param {string} text - Текст для проверки
 * @returns {boolean} - true если нормально
 */
export function checkRepeatingChars(text) {
  if (!text || typeof text !== 'string') return true;
  
  // Проверка на 5+ повторяющихся символов подряд (!!!!!!, ААААА)
  const repeatingPattern = /(.)\1{4,}/;
  if (repeatingPattern.test(text)) return false;
  
  // Проверка на excessive caps (более 50% текста заглавными)
  const capsCount = (text.match(/[A-ZА-ЯÄÖÜÕŠŽ]/g) || []).length;
  const totalLetters = (text.match(/[a-zA-Zа-яА-ЯäöüõšžÄÖÜÕŠŽ]/g) || []).length;
  
  if (totalLetters > 10 && capsCount / totalLetters > 0.5) {
    return false;
  }
  
  return true;
}

/**
 * Главная функция модерации компании
 * @param {Object} companyData - Данные компании
 * @returns {Object} - {approved: boolean, reason: string, score: number}
 */
export function moderateCompany(companyData) {
  const { name, description, website, category } = companyData;
  
  // Инициализируем результат
  const result = {
    approved: true,
    reason: '',
    score: 100,  // Начальный "trust score"
    flags: []
  };
  
  // 1. Проверка длины контента
  if (!checkContentLength(name, description)) {
    result.approved = false;
    result.reason = 'Content too short or invalid length';
    result.score -= 50;
    result.flags.push('invalid_length');
  }
  
  // 2. Проверка blacklist в названии
  const nameCheck = checkBlacklist(name);
  if (!nameCheck.isClean) {
    result.approved = false;
    result.reason = `Blacklisted words in name: ${nameCheck.foundWords.join(', ')}`;
    result.score -= 80;
    result.flags.push('blacklist_name');
  }
  
  // 3. Проверка blacklist в описании
  const descCheck = checkBlacklist(description);
  if (!descCheck.isClean) {
    result.approved = false;
    result.reason = `Blacklisted words in description: ${descCheck.foundWords.join(', ')}`;
    result.score -= 60;
    result.flags.push('blacklist_description');
  }
  
  // 4. Проверка подозрительных паттернов
  if (!checkSuspiciousPatterns(description)) {
    result.approved = false;
    result.reason = 'Suspicious URL patterns detected';
    result.score -= 70;
    result.flags.push('suspicious_urls');
  }
  
  // 5. Проверка excessive links
  if (!checkExcessiveLinks(description)) {
    result.approved = false;
    result.reason = 'Too many links in description';
    result.score -= 40;
    result.flags.push('excessive_links');
  }
  
  // 6. Проверка повторяющихся символов
  if (!checkRepeatingChars(name) || !checkRepeatingChars(description)) {
    result.approved = false;
    result.reason = 'Spam pattern detected (repeating chars or excessive caps)';
    result.score -= 50;
    result.flags.push('spam_pattern');
  }
  
  // 7. Проверка website URL (базовая)
  if (website) {
    try {
      const url = new URL(website);
      // Проверка на локальные и подозрительные домены
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        result.score -= 30;
        result.flags.push('local_website');
      }
    } catch (e) {
      result.score -= 20;
      result.flags.push('invalid_website_url');
    }
  }
  
  // Финальный score не может быть отрицательным
  result.score = Math.max(0, result.score);
  
  // Логирование для админа (можно отправлять в Firestore для аналитики)
  console.log('[Content Moderation]', {
    company: name,
    approved: result.approved,
    score: result.score,
    flags: result.flags
  });
  
  return result;
}

/**
 * Валидация honeypot поля (должно быть пустым)
 * @param {string} honeypotValue - Значение скрытого поля
 * @returns {boolean} - true если не бот
 */
export function validateHoneypot(honeypotValue) {
  // Honeypot должен быть пустым (боты обычно заполняют все поля)
  return !honeypotValue || honeypotValue.trim() === '';
}

/**
 * Проверка времени заполнения формы (антибот)
 * @param {number} formStartTime - Timestamp начала заполнения
 * @returns {boolean} - true если время нормальное
 */
export function validateFormTiming(formStartTime) {
  if (!formStartTime) return true;
  
  const timeSpent = Date.now() - formStartTime;
  
  // Менее 3 секунд - скорее всего бот
  if (timeSpent < 3000) return false;
  
  // Более 30 минут - подозрительно, но пропустим
  // (пользователь мог отвлечься)
  
  return true;
}

export default {
  moderateCompany,
  checkBlacklist,
  checkSuspiciousPatterns,
  checkExcessiveLinks,
  checkContentLength,
  checkRepeatingChars,
  validateHoneypot,
  validateFormTiming
};
