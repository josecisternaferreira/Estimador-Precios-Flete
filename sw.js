const CACHE_NAME = 'estafeta-2026-v2';
const ASSETS = [
  './estimador_estafeta_2026.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Instalar: guardar todos los archivos en caché
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activar: limpiar cachés viejas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: responder desde caché (offline first)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).catch(() => caches.match('./estimador_estafeta_2026.html'));
    })
  );
});
