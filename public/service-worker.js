const CACHE_NAME = 'carrosserie-inspecteur-v7';

// NOTE: Tous les chemins sont maintenant relatifs à la racine où se trouve le service worker.
const urlsToCache = [
  // Core files
  '.',
  'index.html',
  'manifest.json',

  // Source code files (now .js)
  'index.js',
  'App.js',
  'lib/supabase.js',
  'components/AddDefectModal.js',
  'components/AddVehicleModal.js',
  'components/Auth.js',
  'components/Avatar.js',
  'components/BurgerMenu.js',
  'components/DefectList.js',
  'components/Icons.js',
  'components/ImageInspector.js',
  'components/InspectionView.js',
  'components/ProfilePage.js',
  'components/Toolbar.js',
  'components/VehicleSelector.js',

  // External CDN Dependencies
  'https://cdn.tailwindcss.com',
  'https://aistudiocdn.com/react@^19.2.0',
  'https://aistudiocdn.com/react-dom@^19.2.0/client',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm',

  // Icons
  'https://storage.googleapis.com/aistudio-ux-public-assets/codelab-helper/fire-inspector-192.png',
  'https://storage.googleapis.com/aistudio-ux-public-assets/codelab-helper/fire-inspector-512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Force le nouveau service worker à devenir actif immédiatement.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache ouvert, mise en cache des fichiers pour la PWA...');
        return cache.addAll(urlsToCache.map(url => new Request(url, { cache: 'reload' })));
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Suppression de l\'ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Prend le contrôle de tous les clients ouverts.
  );
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // Les requêtes à l'API Supabase doivent TOUJOURS passer par le réseau, jamais par le cache.
  if (requestUrl.hostname.endsWith('supabase.co')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Pour toutes les autres requêtes, essayer de répondre depuis le cache d'abord.
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si la ressource est dans le cache, la retourner.
        if (response) {
          return response;
        }
        // Sinon, la chercher sur le réseau.
        return fetch(event.request);
      }
    )
  );
});