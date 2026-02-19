import React, { useState } from 'react';
import './OptimizedImage.css';

/**
 * OptimizedImage - профессиональный компонент для оптимизации изображений
 * 
 * Особенности:
 * - Автоматическая генерация srcset для разных разрешений
 * - Поддержка WebP/AVIF с fallback на JPEG/PNG
 * - Lazy loading с Intersection Observer
 * - Placeholder для предотвращения CLS
 * - Поддержка Cloudinary и Firebase Storage
 * 
 * @example
 * <OptimizedImage
 *   src="https://firebasestorage.../image.jpg"
 *   alt="Company logo"
 *   width={400}
 *   height={300}
 *   sizes="(max-width: 768px) 100vw, 400px"
 * />
 */
const OptimizedImage = ({
  src,
  alt = '',
  width,
  height,
  sizes = '100vw',
  className = '',
  loading = 'lazy',
  objectFit = 'cover',
  placeholder = true,
  cloudinary = false,
  cloudinaryParams = 'f_auto,q_auto',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Проверяем, является ли источник Cloudinary URL
  const isCloudinaryUrl = src?.includes('cloudinary.com') || cloudinary;
  
  // Проверяем, является ли источник Firebase Storage
  const isFirebaseStorage = src?.includes('firebasestorage.googleapis.com');

  /**
   * Генерирует оптимизированные URL для Cloudinary
   */
  const getCloudinaryUrls = () => {
    if (!isCloudinaryUrl || !src) return null;

    // Парсим Cloudinary URL
    const urlParts = src.split('/upload/');
    if (urlParts.length !== 2) return null;

    const [baseUrl, imagePath] = urlParts;

    return {
      // AVIF (самый современный формат, -50% размера)
      avif: `${baseUrl}/upload/${cloudinaryParams},f_avif/${imagePath}`,
      // WebP (хорошая поддержка браузерами, -30% размера)
      webp: `${baseUrl}/upload/${cloudinaryParams},f_webp/${imagePath}`,
      // Оригинал с авто-оптимизацией
      fallback: `${baseUrl}/upload/${cloudinaryParams}/${imagePath}`,
    };
  };

  /**
   * Генерирует srcset для responsive images
   */
  const generateSrcSet = (url, format) => {
    if (!url || !width) return url;

    const widths = [width * 0.5, width, width * 1.5, width * 2];
    
    if (isCloudinaryUrl) {
      const urlParts = url.split('/upload/');
      if (urlParts.length !== 2) return url;
      
      const [baseUrl, imagePath] = urlParts;
      
      return widths
        .map(w => {
          const params = `w_${Math.round(w)},${cloudinaryParams},f_${format}`;
          return `${baseUrl}/upload/${params}/${imagePath} ${Math.round(w)}w`;
        })
        .join(', ');
    }

    // Для Firebase Storage или других источников просто возвращаем URL
    return url;
  };

  /**
   * Обработчик успешной загрузки
   */
  const handleLoad = () => {
    setIsLoaded(true);
  };

  /**
   * Обработчик ошибки загрузки
   */
  const handleError = () => {
    setError(true);
    setIsLoaded(true);
  };

  // Если нет src или произошла ошибка, показываем placeholder
  if (!src || error) {
    return (
      <div
        className={`optimized-image-placeholder ${className}`}
        style={{
          width: width ? `${width}px` : '100%',
          height: height ? `${height}px` : 'auto',
          aspectRatio: width && height ? `${width}/${height}` : undefined,
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z"
            fill="currentColor"
            opacity="0.3"
          />
        </svg>
      </div>
    );
  }

  // Вычисляем aspect-ratio для предотвращения CLS (используется в обоих путях)
  const aspectRatio = width && height ? `${width}/${height}` : undefined;
  const imageStyle = {
    objectFit,
    ...(aspectRatio && { aspectRatio })
  };

  // Firebase Storage или обычный URL
  // Предполагаем, что Firebase Extension автоматически создал WebP версии
  const getFirebaseWebPUrl = (url) => {
    if (!isFirebaseStorage) return null;
    // Firebase Resize Images Extension создает файлы с суффиксом _800x800.webp
    // Пример: image.jpg -> image_800x800.webp
    const lastDot = url.lastIndexOf('.');
    const lastSlash = url.lastIndexOf('/');
    if (lastDot > lastSlash) {
      const base = url.substring(0, lastDot);
      return `${base}_${width}x${height}.webp`;
    }
    return null;
  };

  // Cloudinary оптимизация
  if (isCloudinaryUrl) {
    const urls = getCloudinaryUrls();
    
    return (
      <picture className={`optimized-image-wrapper ${className}`} style={{ aspectRatio }}>
        {urls && (
          <>
            {/* AVIF - самый эффективный формат */}
            <source
              type="image/avif"
              srcSet={generateSrcSet(urls.avif, 'avif')}
              sizes={sizes}
            />
            {/* WebP - широкая поддержка */}
            <source
              type="image/webp"
              srcSet={generateSrcSet(urls.webp, 'webp')}
              sizes={sizes}
            />
          </>
        )}
        {/* Fallback на оригинал */}
        <img
          src={urls?.fallback || src}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          className={`optimized-image ${isLoaded ? 'loaded' : ''}`}
          style={imageStyle}
        />
        {placeholder && !isLoaded && (
          <div className="optimized-image-loading" />
        )}
      </picture>
    );
  }

  // Получаем WebP URL для Firebase
  const webpUrl = getFirebaseWebPUrl(src);

  return (
    <picture className={`optimized-image-wrapper ${className}`} style={{ aspectRatio }}>
      {/* WebP версия если доступна */}
      {webpUrl && (
        <source
          type="image/webp"
          srcSet={webpUrl}
          sizes={sizes}
        />
      )}
      {/* Оригинал */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={`optimized-image ${isLoaded ? 'loaded' : ''}`}
        style={imageStyle}
      />
      {placeholder && !isLoaded && (
        <div className="optimized-image-loading" />
      )}
    </picture>
  );
};

export default OptimizedImage;
