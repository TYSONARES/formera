const CACHE_NAME = 'formera-pwa-v62';
const CORE_ASSETS = [
  './',
  './index.html',
  './privacy.html',
  './terms.html',
  './dashboard.html',
  './config.js',
  './landing.js',
  './landing.css',
  './legal.css',
  './styles.css',
  './app.js',
  './vendor/supabase-js-2.112.3.min.js',
  './assets/fonts/fonts.css',
  './assets/fonts/dm-sans-latin-400-normal.woff2',
  './assets/fonts/dm-sans-latin-500-normal.woff2',
  './assets/fonts/dm-sans-latin-600-normal.woff2',
  './assets/fonts/dm-sans-latin-700-normal.woff2',
  './assets/fonts/dm-sans-latin-ext-400-normal.woff2',
  './assets/fonts/dm-sans-latin-ext-500-normal.woff2',
  './assets/fonts/dm-sans-latin-ext-600-normal.woff2',
  './assets/fonts/dm-sans-latin-ext-700-normal.woff2',
  './assets/fonts/manrope-latin-500-normal.woff2',
  './assets/fonts/manrope-latin-600-normal.woff2',
  './assets/fonts/manrope-latin-700-normal.woff2',
  './assets/fonts/manrope-latin-800-normal.woff2',
  './assets/fonts/manrope-latin-ext-500-normal.woff2',
  './assets/fonts/manrope-latin-ext-600-normal.woff2',
  './assets/fonts/manrope-latin-ext-700-normal.woff2',
  './assets/fonts/manrope-latin-ext-800-normal.woff2',
  './pwa.js',
  './manifest.webmanifest',
  './icon.svg',
  './favicon.svg',
  './assets/formera-logo.svg',
  './assets/formera-favicon.svg',
  './assets/kettlebell-stage.jpg',
  './404.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if(request.method !== 'GET') return;

  const url = new URL(request.url);
  if(url.origin !== self.location.origin) return;

  if(request.mode === 'navigate'){
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then(response => response || caches.match('./dashboard.html') || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(request)
      .then(cached => cached || fetch(request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        return response;
      }))
  );
});
