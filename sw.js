const CACHE_NAME = 'buffetCache-v2';
// Rutas a cachear al instalar el SW. Ajusta si cambias nombres.
const URLS_TO_CACHE = [
  './',          // carpeta actual
  './index.html' // HTML principal
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Estrategia cache-first para documentos HTML (navegación)
self.addEventListener('fetch', event => {
  const req = event.request;

  // Solo interceptamos navegaciones / documentos
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      caches.match(req).then(cached => {
        if (cached) return cached; // servir desde caché si existe

        return fetch(req).then(res => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, resClone));
          return res;
        }).catch(() => cached || Response.error());
      })
    );
  }
});
