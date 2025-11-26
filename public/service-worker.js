// service-worker.js (version complète PWA)
const CACHE_NAME = 'carrosserie-inspecteur-v2';

// Fichiers statiques essentiels à pré-charger lors de l'installation
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
      .then(cache => {
        console.log('✅ SW: Mise en cache des fichiers statiques');
        return cache.addAll(urlsToCache);
      })
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
  const url = new URL(event.request.url);

  // 1. Ignorer les appels API Supabase (toujours en réseau)
  // On ne veut pas servir de vieilles données d'inspection depuis le cache
  if (url.hostname.includes('supabase.co')) {
    return;
  }

  // 2. Stratégie Cache-First avec Network-Fallback et mise en cache dynamique
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Si trouvé dans le cache, on le retourne immédiatement
      if (cachedResponse) {
        return cachedResponse;
      }

      // Sinon, on va chercher sur le réseau
      return fetch(event.request).then(networkResponse => {
        // Vérification basique de la réponse
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
          return networkResponse;
        }

        // IMPORTANT: On met en cache les ressources externes (CDN React, Tailwind, images, icones)
        // pour qu'elles soient disponibles hors ligne au prochain chargement.
        const responseToCache = networkResponse.clone();
        
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // 3. Fallback Offline pour la navigation SPA
        // Si on est hors ligne et qu'on navigue vers une URL (ex: /app), on sert index.html
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});