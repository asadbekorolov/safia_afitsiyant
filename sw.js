/**
 * SAFIA PWA SERVICE WORKER
 * Implements CacheFirst & StaleWhileRevalidate strategies
 * to ensure 100% offline functionality for app shell, JSON data, and WebP images.
 */

const CACHE_NAME = 'safia-pwa-v1';

// APP SHELL & CORE STATIC ASSETS TO PRE-CACHE
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './admin.html',
  './preview.html',
  './manifest.json',
  './css/style.css',
  './css/components.css',
  './js/storage.js',
  './js/data-loader.js',
  './js/menu.js',
  './js/standards.js',
  './js/flashcards.js',
  './js/quiz.js',
  './js/app.js',
  './js/admin.js',
  './data/dishes.json',
  './data/drinks.json',
  './data/standards.json'
];

// Pre-populate image paths for dishes (001-044) and drinks (001-045)
for (let i = 1; i <= 44; i++) {
  const num = String(i).padStart(3, '0');
  PRECACHE_ASSETS.push(`./assets/images/dishes/dish-${num}.webp`);
}
for (let i = 1; i <= 45; i++) {
  const num = String(i).padStart(3, '0');
  PRECACHE_ASSETS.push(`./assets/images/drinks/drink-${num}.webp`);
}

// 1. INSTALL EVENT - PRECACHE ASSETS
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching App Shell and WebP Assets...');
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Some assets failed to precache during install:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// 2. ACTIVATE EVENT - CLEANUP OLD CACHES
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. FETCH EVENT - HYBRID CACHING STRATEGY
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // CacheFirst strategy for WebP images and static assets
  if (request.destination === 'image' || url.pathname.endsWith('.webp') || url.pathname.includes('/assets/')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        }).catch(() => {
          // Return fallback placeholder if network fails
          return new Response(
            `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"><rect width="100%" height="100%" fill="#fee2e2"/><text x="50%" y="50%" font-size="14" text-anchor="middle" fill="#dc2626">Offline Image</text></svg>`,
            { headers: { 'Content-Type': 'image/svg+xml' } }
          );
        });
      })
    );
    return;
  }

  // StaleWhileRevalidate strategy for HTML, CSS, JS, and JSON
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }
        return networkResponse;
      }).catch((err) => {
        console.log('[SW] Fetch failed, serving cached fallback if available:', err);
      });

      return cachedResponse || fetchPromise;
    })
  );
});
