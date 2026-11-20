// Cambiá este número en cada versión nueva para que se actualice la app instalada
const CACHE_NAME = 'quipu-office-v1.0.0';

// Archivos propios que se guardan en el equipo
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

// Al instalar: guarda los archivos
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE).catch(() => {}))
  );
});

// Al activar: borra versiones viejas del caché
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

// Al pedir un archivo: solo intercepta archivos propios.
// Lo de Google (inicio de sesión, Drive), fuentes y librerías va siempre directo a internet.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((resp) => {
        const copia = resp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copia));
        return resp;
      })
      .catch(() => caches.match(event.request))
  );
});