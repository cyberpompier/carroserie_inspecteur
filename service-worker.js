const CACHE_NAME = 'carrosserie-inspecteur-v4';

// Déterminer le chemin de base à partir de l'emplacement du service worker lui-même
// C'est la méthode la plus fiable pour résoudre les chemins relatifs.
const base = new URL('.', self.location.href);
const resolve = (path) => new URL(path, base).href;

const urlsToCache = [
  // Core files - résolus en URL absolues
  resolve('.'),
  resolve('index.html'),
  resolve('manifest.json'),

  // Source code files - résolus en URL absolues
  resolve('index.tsx'),
  resolve('App.tsx'),
  resolve('types.ts'),
  resolve('lib/supabase.ts'),
  resolve('components/AddDefectModal.tsx'),
  resolve('components/AddVehicleModal.tsx'),
  resolve('components/Auth.tsx'),
  resolve('components/Avatar.tsx'),
  resolve('components/BurgerMenu.tsx'),
  resolve('components/DefectList.tsx'),
  resolve('components/Icons.tsx'),
  resolve('components/ImageInspector.tsx'),
  resolve('components/InspectionView.tsx'),
  resolve('components/ProfilePage.tsx'),
  resolve('components/Toolbar.tsx'),
  resolve('components/VehicleSelector.tsx'),

  // External CDN Dependencies (déjà absolues)
  'https://cdn.tailwindcss.com',
  'https://aistudiocdn.com/react@^19.2.0',
  'https://aistudiocdn.com/react-dom@^19.2.0/client',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm',

  // Icons (déjà absolues)
  'https://storage.googleapis.com/aistudio-ux-public-assets/codelab-helper/fire-inspector-192.png',
  'https://storage.googleapis.com/aistudio-ux-public-assets/codelab-helper/fire-inspector-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache ouvert, mise en cache de tous les fichiers...');
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
    })
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