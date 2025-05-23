
const CACHE_NAME = 'pwa-cache-v1';
const urlsToCache = [
  '/',
  '/kwadrat/html.html',
  '/kwadrat/kwadratowe.js',
  '/kwadrat/skrypt.js',
  '/index.html',
  '/tabliczka.html',
  '/znaki.html',
  '/dzielenie.html',
  '/manifest.json',
  '/did.png',
  '/didd.png',
  '/diddy.png',
  '/images/icon.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
