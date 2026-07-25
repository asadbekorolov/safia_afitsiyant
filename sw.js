/**
 * SAFIA PWA SERVICE WORKER (v10 Cache Key)
 * Ensures 100% fresh 3-language JSON datasets are served offline.
 */

const CACHE_NAME = 'safia-pwa-v10';

const ASSETS = [
  '/',
  './',
  'index.html',
  'admin.html',
  'preview.html',
  'css/style.css',
  'css/components.css',
  'js/i18n.js',
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

for (let i = 1; i <= 44; i++) {
  const num = String(i).padStart(3, '0');
  ASSETS.push(`assets/images/dishes/dish-${num}.webp`);
}
for (let i = 1; i <= 45; i++) {
  const num = String(i).padStart(3, '0');
  ASSETS.push(`assets/images/drinks/drink-${num}.webp`);
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW v10] Precaching 3-language App Shell and Assets...');
      return cache.addAll(ASSETS).catch((err) => console.warn('[SW] Pre-cache warning:', err));
    }).then(() => self.skipWaiting())
  );
});

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

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

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
          return caches.match(request)
            .then((res) => res || caches.match('/'))
            .then((res) => res || caches.match('index.html'));
        })
    );
    return;
  }

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
