/**
 * SAFIA PWA SERVICE WORKER
 * Optimized for Vercel deployment with '/' start_url,
 * robust offline navigation fallback, and CacheFirst/StaleWhileRevalidate strategies.
 */

const CACHE_NAME = 'safia-pwa-v2';

const ASSETS = [
  '/',
  './',
  'index.html',
  'admin.html',
  'preview.html',
  'css/style.css',
  'css/components.css',
  'js/app.js',
  'js/admin.js',
  'js/data-loader.js',
  'js/menu.js',
  'js/standards.js',
  'js/flashcards.js',
  'js/quiz.js',
  'js/storage.js',
  'manifest.json',
  'data/dishes.json',
  'data/drinks.json',
  'data/standards.json'
];

// Add image paths for dishes (001-044) and drinks (001-045)
for (let i = 1; i <= 44; i++) {
  const num = String(i).padStart(3, '0');
  ASSETS.push(`assets/images/dishes/dish-${num}.webp`);
}
for (let i = 1; i <= 45; i++) {
  const num = String(i).padStart(3, '0');
  ASSETS.push(`assets/images/drinks/drink-${num}.webp`);
}

// 1. INSTALL EVENT - PRECACHE ASSETS
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching App Shell for Vercel...');
      return cache.addAll(ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// 2. ACTIVATE EVENT - PURGE OLD CACHES
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. FETCH EVENT - ROBUST NAVIGATION & ASSET FETCHING
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  // NAVIGATION REQUESTS (HTML Pages / Home Screen Launch)
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/', copy));
          }
          return networkResponse;
        })
        .catch(() => {
          // Robust Offline Navigation Fallback: Try match request, then root '/', then 'index.html'
          return caches.match(request)
            .then((res) => res || caches.match('/'))
            .then((res) => res || caches.match('index.html'));
        })
    );
    return;
  }

  // STATIC WEBP IMAGES & ASSETS (CacheFirst)
  if (request.destination === 'image' || url.pathname.endsWith('.webp') || url.pathname.includes('/assets/')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        }).catch(() => {
          return new Response(
            `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"><rect width="100%" height="100%" fill="#fee2e2"/><text x="50%" y="50%" font-size="14" text-anchor="middle" fill="#dc2626">Offline</text></svg>`,
            { headers: { 'Content-Type': 'image/svg+xml' } }
          );
        });
      })
    );
    return;
  }

  // GENERAL RESOURCES (StaleWhileRevalidate)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return networkResponse;
      }).catch((err) => console.log('[SW] Fetch fallback:', err));

      return cachedResponse || fetchPromise;
    })
  );
});
