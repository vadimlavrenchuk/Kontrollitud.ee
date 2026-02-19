// Service Worker for Kontrollitud.ee PWA
const CACHE_NAME = 'kontrollitud-v10';
const STATIC_CACHE_NAME = 'kontrollitud-static-v10';
const DYNAMIC_CACHE_NAME = 'kontrollitud-dynamic-v10';

// Static assets to cache immediately (NO HTML - use Network First for HTML)
const STATIC_ASSETS = [
  '/manifest.json',
  '/robots.txt'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting(); // Activate immediately
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== STATIC_CACHE_NAME &&
            cacheName !== DYNAMIC_CACHE_NAME &&
            cacheName !== CACHE_NAME
          ) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Take control immediately
});

// Fetch event - Network First for HTML, Cache First for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip API requests
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  event.respondWith(
    (async () => {
      // NETWORK FIRST for HTML - always fetch fresh version
      if (request.headers.get('accept')?.includes('text/html')) {
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            // Cache for offline fallback only
            const responseClone = networkResponse.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        } catch (error) {
          // Offline fallback
          console.log('[SW] Network failed, using cache for HTML');
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          return caches.match('/index.html');
        }
      }

      // CACHE FIRST for static assets (JS, CSS, images, fonts)
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }

      // Fetch from network
      try {
        const networkResponse = await fetch(request);
        
        // Don't cache non-successful responses
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        // Cache static assets (JS, CSS, images, fonts)
        if (
          request.url.match(/\.(js|jsx|css|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot|ico)$/)
        ) {
          const responseClone = networkResponse.clone();
          caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }

        return networkResponse;
      } catch (error) {
        console.log('[SW] Network failed for:', request.url);
        return new Response('Network error', { status: 408 });
      }
    })()
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
