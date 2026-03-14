/**
 * Cloudinary Helper Functions
 * Утилиты для работы с Cloudinary CDN
 * 
 * Документация: https://cloudinary.com/documentation/image_transformations
 */

/**
 * Базовая конфигурация Cloudinary
 */
export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dvkj0ica9',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'web_optimized',
  folder: 'companies',
};

/**
 * Преобразует обычный URL в Cloudinary URL
 * 
 * @param {string} imageUrl - Исходный URL изображения
 * @param {Object} options - Параметры трансформации
 * @returns {string} Cloudinary URL
 * 
 * @example
 * const optimizedUrl = getCloudinaryUrl(
 *   'https://example.com/image.jpg',
 *   { width: 800, format: 'webp', quality: 'auto' }
 * );
 */
export const getCloudinaryUrl = (imageUrl, options = {}) => {
  const {
    width,
    height,
    format = 'auto',
    quality = 'auto',
    crop = 'fill',
    gravity = 'auto',
  } = options;

  // Если уже Cloudinary URL — инжектируем трансформации напрямую
  if (imageUrl?.includes('cloudinary.com')) {
    const parts = imageUrl.split('/upload/');
    if (parts.length === 2) {
      const transforms = [
        width ? `w_${width}` : null,
        height ? `h_${height}` : null,
        `c_${crop}`,
        `g_${gravity}`,
        `f_${format}`,
        `q_${quality}`,
      ].filter(Boolean).join(',');
      return `${parts[0]}/upload/${transforms}/${parts[1]}`;
    }
    return imageUrl;
  }

  // Если Firebase Storage, конвертируем через Cloudinary fetch
  if (imageUrl?.includes('firebasestorage.googleapis.com')) {
    const params = [];
    
    if (width) params.push(`w_${width}`);
    if (height) params.push(`h_${height}`);
    params.push(`c_${crop}`);
    params.push(`g_${gravity}`);
    params.push(`f_${format}`);
    params.push(`q_${quality}`);
    
    const transformations = params.join(',');
    
    return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/fetch/${transformations}/${encodeURIComponent(imageUrl)}`;
  }

  // Для других URL возвращаем как есть
  return imageUrl;
};

/**
 * Генерирует srcset для responsive изображений
 * 
 * @param {string} imageUrl - Исходный URL
 * @param {number[]} widths - Массив ширин для srcset
 * @param {Object} options - Дополнительные параметры
 * @returns {string} srcset строка
 * 
 * @example
 * const srcset = generateSrcSet(imageUrl, [400, 800, 1200]);
 * // "url-400w 400w, url-800w 800w, url-1200w 1200w"
 */
export const generateSrcSet = (imageUrl, widths = [400, 800, 1200], options = {}) => {
  return widths
    .map(width => {
      const url = getCloudinaryUrl(imageUrl, { ...options, width });
      return `${url} ${width}w`;
    })
    .join(', ');
};

/**
 * Загружает изображение в Cloudinary
 * 
 * @param {File} file - Файл изображения
 * @param {Object} options - Параметры загрузки
 * @returns {Promise<Object>} Результат загрузки
 * 
 * @example
 * const result = await uploadToCloudinary(file, {
 *   folder: 'companies',
 *   tags: ['company', 'logo']
 * });
 * console.log(result.secure_url);
 */
export const uploadToCloudinary = async (file, options = {}) => {
  const {
    folder = CLOUDINARY_CONFIG.folder,
    tags = [],
    transformation,
  } = options;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('folder', folder);
  
  if (tags.length > 0) {
    formData.append('tags', tags.join(','));
  }
  
  if (transformation) {
    formData.append('transformation', transformation);
  }

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Cloudinary upload failed');
    }

    const data = await response.json();
    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format,
      bytes: data.bytes,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Удаляет изображение из Cloudinary
 * 
 * @param {string} publicId - Public ID изображения в Cloudinary
 * @returns {Promise<boolean>} Успешность удаления
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    // Это требует backend endpoint, так как требуется API secret
    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    });

    return response.ok;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
};

/**
 * Предустановленные трансформации для разных случаев
 */
export const CLOUDINARY_PRESETS = {
  // Миниатюра компании (квадрат)
  companyThumb: {
    width: 200,
    height: 200,
    crop: 'fill',
    gravity: 'face',
    format: 'webp',
    quality: 'auto:good',
  },
  
  // Карточка компании
  companyCard: {
    width: 400,
    height: 225,
    crop: 'fill',
    gravity: 'auto',
    format: 'webp',
    quality: 'auto:good',
  },
  
  // Hero изображение компании
  companyHero: {
    width: 1200,
    height: 400,
    crop: 'fill',
    gravity: 'auto',
    format: 'webp',
    quality: 'auto:best',
  },
  
  // Логотип (прозрачный фон)
  logo: {
    width: 200,
    crop: 'fit',
    format: 'png',
    quality: 'auto:best',
  },
};

/**
 * Получает оптимизированный URL по пресету
 * 
 * @param {string} imageUrl - Исходный URL
 * @param {string} presetName - Название пресета
 * @returns {string} Оптимизированный URL
 * 
 * @example
 * const thumbUrl = getOptimizedUrl(company.image, 'companyThumb');
 */
export const getOptimizedUrl = (imageUrl, presetName) => {
  const preset = CLOUDINARY_PRESETS[presetName];
  if (!preset) {
    console.warn(`Unknown preset: ${presetName}`);
    return imageUrl;
  }
  
  return getCloudinaryUrl(imageUrl, preset);
};

/**
 * Инжектирует трансформации в существующий Cloudinary URL
 * Работает с любыми Cloudinary URL (уже загруженными или нет)
 *
 * @param {string} url - Cloudinary URL
 * @param {number} width - Целевая ширина
 * @returns {string} Оптимизированный URL
 *
 * @example
 * optimizeCloudinary('https://res.cloudinary.com/dvkj0ica9/image/upload/v123/companies/photo.jpg', 400)
 * // => '...upload/f_auto,q_auto,w_400/v123/companies/photo.jpg'
 */
export const optimizeCloudinary = (url, width) => {
  if (!url) return url;

  // Не трогаем не-Cloudinary URL
  if (!url.includes('cloudinary.com')) return url;

  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;

  // Убираем существующие трансформации если они уже есть
  const imagePath = parts[1].replace(/^[^/]+\//, (match) => {
    // Если это трансформации (содержат _ или , или буквы без /) — убираем
    return /[_,]/.test(match) ? '' : match;
  });

  const transforms = width ? `f_auto,q_auto,w_${width}` : 'f_auto,q_auto';
  return `${parts[0]}/upload/${transforms}/${imagePath}`;
};

/**
 * Проверяет, поддерживает ли браузер WebP
 */
export const supportsWebP = () => {
  const elem = document.createElement('canvas');
  if (elem.getContext && elem.getContext('2d')) {
    return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  return false;
};

/**
 * Проверяет, поддерживает ли браузер AVIF
 */
export const supportsAVIF = async () => {
  const avif = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  
  try {
    const res = await fetch(avif);
    const blob = await res.blob();
    return blob.type === 'image/avif';
  } catch {
    return false;
  }
};
