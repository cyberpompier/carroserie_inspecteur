// service-worker.js  (version allégée)
const CACHE_NAME = 'carrosserie-inspecteur-v1';

// uniquement les fichiers **locaux** générés par Vite
const urlsToCache = [
  '/',
  '/index.html',
  '/index.js',
  '/manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(
        names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // toujours passer les requêtes Supabase en réseau
  if (event.request.url.includes('supabase.co')) return;

  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});