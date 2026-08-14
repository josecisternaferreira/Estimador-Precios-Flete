const CACHE_NAME = 'estafeta-2026-v4';
const BASE_PATH = '/Estimador-Precios-Flete/';
const ASSETS = [
  BASE_PATH,
  BASE_PATH + 'index.html',
  BASE_PATH + 'manifest.json',
  BASE_PATH + 'icon-192.png',
  BASE_PATH + 'icon-512.png'
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

// Fetch
//
// El HTML y el manifest van por red primero: la app lleva el tarifario dentro
// de index.html, así que servirlo desde caché sin revalidar dejaba a la PWA
// mostrando precios viejos indefinidamente (pasó entre febrero y julio 2026).
// Si la red falla se usa la copia en caché, así sigue funcionando offline.
// Los iconos, que no cambian, se siguen sirviendo desde caché primero.
const RED_PRIMERO = /\.html$|\.json$|\/$/;

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  if (RED_PRIMERO.test(new URL(event.request.url).pathname)) {
    event.respondWith(
      fetch(event.request)
        .then(resp => {
          const copia = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, copia));
          return resp;
        })
        .catch(() => caches.match(event.request)
          .then(cached => cached || caches.match(BASE_PATH + 'index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).catch(() => caches.match(BASE_PATH + 'index.html'));
    })
  );
});
