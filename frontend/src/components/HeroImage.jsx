// Kontrollitud.ee/frontend/src/components/HeroImage.jsx

import React, { useState, useEffect } from 'react';
import './HeroImage.scss';

/**
 * Optimized hero image component with blur-up loading effect
 * Supports WebP format with JPEG fallback
 */
function HeroImage({ 
  jpgSrc, 
  webpSrc, 
  alt, 
  width = 1920, 
  height = 1080,
  placeholder = null 
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    // Immediate load for above-the-fold hero images
    setIsInView(true);
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  // Tiny placeholder (20px wide) - blurred SVG representation
  const defaultPlaceholder = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3CfeColorMatrix values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 100 -1' result='s'/%3E%3CfeFlood x='0' y='0' width='100%25' height='100%25'/%3E%3CfeComposite operator='out' in='s'/%3E%3CfeComposite in2='SourceGraphic'/%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3C/filter%3E%3Cimage width='100%25' height='100%25' x='0' y='0' preserveAspectRatio='none' style='filter: url(%23b);' href='${jpgSrc}'/%3E%3C/svg%3E`;

  return (
    <div className={`hero-image-wrapper ${isLoaded ? 'loaded' : 'loading'}`}>
      {/* Placeholder (blurred, loads instantly) */}
      {!isLoaded && (
        <img
          src={placeholder || defaultPlaceholder}
          alt=""
          aria-hidden="true"
          className="hero-image-placeholder"
          width={width}
          height={height}
        />
      )}

      {/* Main image with WebP support */}
      {isInView && (
        <picture>
          <source
            type="image/webp"
            srcSet={webpSrc}
          />
          <source
            type="image/jpeg"
            srcSet={jpgSrc}
          />
          <img
            src={jpgSrc}
            alt={alt}
            width={width}
            height={height}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            onLoad={handleLoad}
            className="hero-image-main"
          />
        </picture>
      )}
    </div>
  );
}

export default HeroImage;
