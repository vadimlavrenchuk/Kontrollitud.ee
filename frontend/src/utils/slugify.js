// Kontrollitud.ee/frontend/src/utils/slugify.js

/**
 * Converts text to URL-friendly slug
 * Handles Cyrillic, Latin, and special characters
 * 
 * @param {string} text - Text to convert
 * @returns {string} URL-friendly slug
 */
export const slugify = (text) => {
  if (!text) return '';

  // Cyrillic to Latin transliteration map
  const cyrillicMap = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
    'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
    'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
    'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
    'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch', 'Ъ': '',
    'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
  };

  // Estonian special characters
  const estonianMap = {
    'ä': 'a', 'ö': 'o', 'ü': 'u', 'õ': 'o',
    'Ä': 'A', 'Ö': 'O', 'Ü': 'U', 'Õ': 'O',
    'š': 's', 'ž': 'z', 'Š': 'S', 'Ž': 'Z'
  };

  let slug = text.toString().trim();

  // Replace Cyrillic characters
  slug = slug.split('').map(char => cyrillicMap[char] || char).join('');
  
  // Replace Estonian characters
  slug = slug.split('').map(char => estonianMap[char] || char).join('');

  // Convert to lowercase and replace spaces/special chars with hyphens
  slug = slug
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start
    .replace(/-+$/, '');            // Trim - from end

  return slug;
};

/**
 * Generate unique slug by appending number if needed
 * 
 * @param {string} baseSlug - Base slug
 * @param {Function} checkExists - Function to check if slug exists
 * @returns {Promise<string>} Unique slug
 */
export const generateUniqueSlug = async (baseSlug, checkExists) => {
  let slug = baseSlug;
  let counter = 1;

  while (await checkExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};
