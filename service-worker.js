const CACHE_NAME = 'carrosserie-inspecteur-v5';

const base = new URL('.', self.location.href);
const resolve = (path) => new URL(path, base).href;

const urlsToCache = [
  // Core files
  resolve('.'),
  resolve('index.html'),
  resolve('manifest.json'),

  // Source code files (now .js)
  resolve('index.js'),
  resolve('App.js'),
  resolve('lib/supabase.js'),
  resolve('components/AddDefectModal.js'),
  resolve('components/AddVehicleModal.js'),
  resolve('components/Auth.js'),
  resolve('components/Avatar.js'),
  resolve('components/BurgerMenu.js'),
  resolve('components/DefectList.js'),
  resolve('components/Icons.js'),
  resolve('components/ImageInspector.js'),
  resolve('components/InspectionView.js'),
  resolve('components/ProfilePage.js'),
  resolve('components/Toolbar.js'),
  resolve('components/VehicleSelector.js'),

  // External CDN Dependencies
  'https://cdn.tailwindcss.com',
  'https://aistudiocdn.com/react@^19.2.0',
  'https://aistudiocdn.com/react-dom@^19.2.0/client',
  'https://aistudiocdn.com/react@^19.2.0/',
  'https://aistudiocdn.com/react-dom@^19.2.0/',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm',

  // Icons
  'https://storage.googleapis.com/aistudio-ux-public-assets/codelab-helper/fire-inspector-192.png',
  'https://storage.googleapis.com/aistudio-ux-public-assets/codelab-helper/fire-inspector-512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Force the waiting service worker to become the active service worker.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache ouvert, mise en cache de tous les fichiers...');
        return cache.addAll(urlsToCache);
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
    }).then(() => self.clients.claim()) // Take control of all clients as soon as the service worker is activated.
  );
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // Les requêtes à l'API Supabase doivent toujours passer par le réseau.
  if (requestUrl.hostname.endsWith('supabase.co')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - retourne la réponse du cache
        if (response) {
          return response;
        }
        // Pas dans le cache - va chercher sur le réseau
        return fetch(event.request);
      }
    )
  );
});