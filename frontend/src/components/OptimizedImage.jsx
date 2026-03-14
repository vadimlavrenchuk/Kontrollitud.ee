import React, { useState } from 'react';
import './OptimizedImage.css';

/**
 * OptimizedImage — компонент для оптимизации изображений
 *
 * Cloudinary: генерирует <picture> с AVIF → WebP → auto srcset
 * Прочие URL: рендерит с aspect-ratio и lazy loading
 *
 * @example
 * <OptimizedImage
 *   src="https://res.cloudinary.com/.../image.jpg"
 *   alt="Company logo"
 *   width={400}
 *   height={225}
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
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  const isCloudinaryUrl = src?.includes('cloudinary.com');

  // Строим чистый путь изображения без существующих трансформаций
  const getCleanParts = (url) => {
    const parts = url.split('/upload/');
    if (parts.length !== 2) return null;
    const [base, rawPath] = parts;
    // Убираем блок трансформаций в начале пути (содержит _ или ,)
    const cleanPath = rawPath.replace(/^[^/]+\//, (m) => (/[_,]/.test(m) ? '' : m));
    return { base, cleanPath };
  };

  // Генерирует srcset с явным форматом и несколькими ширинами
  const buildSrcSet = (url, format) => {
    const parsed = getCleanParts(url);
    if (!parsed) return url;
    const { base, cleanPath } = parsed;
    const targetWidths = width
      ? [Math.round(width * 0.5), width, Math.round(width * 1.5)].filter((w) => w >= 80)
      : [400, 800, 1200];
    return targetWidths
      .map((w) => `${base}/upload/f_${format},q_auto,w_${w}/${cleanPath} ${w}w`)
      .join(', ');
  };

  // Строит одиночный оптимизированный URL (fallback для <img src>)
  const buildUrl = (url, format = 'auto') => {
    const parsed = getCleanParts(url);
    if (!parsed) return url;
    const { base, cleanPath } = parsed;
    const wParam = width ? `,w_${width}` : '';
    return `${base}/upload/f_${format},q_auto${wParam}/${cleanPath}`;
  };

  const handleLoad = () => setIsLoaded(true);
  const handleError = () => { setError(true); setIsLoaded(true); };

  const aspectRatio = width && height ? `${width}/${height}` : undefined;
  const wrapperStyle = aspectRatio ? { aspectRatio } : undefined;
  const imgStyle = { objectFit, ...(aspectRatio && { aspectRatio }) };

  // Ошибка или нет src — заглушка
  if (!src || error) {
    return (
      <div
        className={`optimized-image-placeholder ${className}`}
        style={wrapperStyle}
        role="img"
        aria-label={alt || 'Image unavailable'}
      >
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z"
            fill="currentColor"
            opacity="0.3"
          />
        </svg>
      </div>
    );
  }

  // Cloudinary — <picture> с AVIF / WebP / auto fallback + responsive srcset
  if (isCloudinaryUrl) {
    return (
      <picture className={`optimized-image-wrapper ${className}`} style={wrapperStyle}>
        {/* AVIF: наилучшее сжатие, Chrome 85+, Firefox 93+ */}
        <source
          type="image/avif"
          srcSet={buildSrcSet(src, 'avif')}
          sizes={sizes}
        />
        {/* WebP: широкая поддержка (96% браузеров) */}
        <source
          type="image/webp"
          srcSet={buildSrcSet(src, 'webp')}
          sizes={sizes}
        />
        {/* Fallback: f_auto — Cloudinary сам выбирает формат по Accept заголовку */}
        <img
          src={buildUrl(src, 'auto')}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={`optimized-image ${isLoaded ? 'loaded' : ''}`}
          style={imgStyle}
        />
        {placeholder && !isLoaded && (
          <div className="optimized-image-loading" aria-hidden="true" />
        )}
      </picture>
    );
  }

  // Прочие URL (Firebase Storage, внешние) — простой <img> с aspect-ratio
  return (
    <picture className={`optimized-image-wrapper ${className}`} style={wrapperStyle}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={`optimized-image ${isLoaded ? 'loaded' : ''}`}
        style={imgStyle}
      />
      {placeholder && !isLoaded && (
        <div className="optimized-image-loading" aria-hidden="true" />
      )}
    </picture>
  );
};

export default OptimizedImage;
