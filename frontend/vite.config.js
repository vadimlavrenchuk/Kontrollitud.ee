import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteImagemin from 'vite-plugin-imagemin'

/**
 * Vite Configuration с оптимизацией изображений
 * 
 * Image Optimization Strategy:
 * - Автоматическая конвертация в WebP (~30% экономии) и AVIF (~50% экономии)
 * - Сжатие JPEG/PNG без видимой потери качества
 * - Code splitting для оптимизации загрузки JavaScript
 * - Inline для мелких файлов (<4KB) для уменьшения HTTP-запросов
 * 
 * Форматы:
 * - AVIF: Самый современный, лучшее сжатие, поддержка Chrome 85+, Firefox 93+
 * - WebP: Отличная поддержка (96% браузеров), хорошее сжатие
 * - JPEG/PNG: Fallback для старых браузеров
 */

// https://vite.dev/config/
export default defineConfig({
  // Оптимизация pre-bundling для ускорения dev и prod
  optimizeDeps: {
    include: [
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/storage',
      'react',
      'react-dom',
      'react-router-dom',
      'react-i18next',
      'i18next',
      'leaflet',
      'react-leaflet',
      'react-toastify'
    ],
    // Принудительная оптимизация для избежания waterfall
    force: false,
    // Исключаем уже оптимизированные модули
    exclude: ['@fortawesome/fontawesome-svg-core']
  },
  plugins: [
    react(),
    viteImagemin({
      // Оптимизация для производства без видимой потери качества
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false,
      },
      optipng: {
        optimizationLevel: 7,
      },
      mozjpeg: {
        quality: 80, // Качество JPEG 80% - оптимальный баланс качества и размера
      },
      pngquant: {
        quality: [0.70, 0.90], // Улучшенное качество PNG
        speed: 4,
      },
      svgo: {
        plugins: [
          {
            name: 'removeViewBox',
            active: false,
          },
          {
            name: 'removeEmptyAttrs',
            active: false,
          },
          {
            name: 'removeUselessDefs',
            active: true,
          },
          {
            name: 'cleanupIDs',
            active: true,
          },
        ],
      },
      // WebP конверсия - отличная поддержка браузерами, экономия ~30%
      webp: {
        quality: 80,
        lossless: false, // Lossy для лучшего сжатия
        method: 6, // Максимальное сжатие (0-6)
      },
      // AVIF конверсия - самый современный формат, экономия ~50%
      avif: {
        quality: 75,
        speed: 4, // Баланс скорости конвертации и качества (0-10)
        lossless: false,
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    // Дополнительные оптимизации для production
    minify: 'esbuild', // Используем esbuild (быстрее и встроен в Vite)
    sourcemap: false, // Отключаем sourcemaps в продакшене
    // Настройки для оптимизации ассетов
    assetsInlineLimit: 4096, // Файлы < 4KB будут inline (base64)
    chunkSizeWarningLimit: 1000, // Предупреждение при чанках > 1MB
    rollupOptions: {
      output: {
        // Используем функцию для rolldown совместимости
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // React core - критический, загружается первым
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-core';
            }
            // React Router - отдельный chunk
            if (id.includes('react-router')) {
              return 'react-router';
            }
            // Firebase - разделяем на auth и firestore для оптимизации
            if (id.includes('firebase/auth') || id.includes('@firebase/auth')) {
              return 'firebase-auth';
            }
            if (id.includes('firebase/firestore') || id.includes('@firebase/firestore')) {
              return 'firebase-firestore';
            }
            if (id.includes('firebase/') || id.includes('@firebase/')) {
              return 'firebase-core';
            }
            // UI библиотеки
            if (id.includes('@fortawesome')) {
              return 'ui-vendor';
            }
            // i18n
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'i18n-vendor';
            }
            // Все остальные vendor dependencies
            return 'vendor';
          }
        },
        // Оптимизация имен файлов для кэширования
        assetFileNames: (assetInfo) => {
          // Проверка на существование name для rolldown совместимости
          if (!assetInfo.name) {
            return `assets/[name]-[hash][extname]`;
          }
          let extType = assetInfo.name.split('.').pop();
          // Изображения в отдельную папку
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp|avif/i.test(extType)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          // Шрифты в отдельную папку
          if (/woff|woff2|ttf|otf|eot/i.test(extType)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
  },
})
