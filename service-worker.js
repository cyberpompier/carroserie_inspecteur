const CACHE_NAME = 'carrosserie-inspecteur-v3';
// All local files + external dependencies
const urlsToCache = [
  // Core files
  '.',
  'index.html',
  'manifest.json',

  // Source code files
  'index.tsx',
  'App.tsx',
  'types.ts',
  'lib/supabase.ts',
  'components/AddDefectModal.tsx',
  'components/AddVehicleModal.tsx',
  'components/Auth.tsx',
  'components/Avatar.tsx',
  'components/BurgerMenu.tsx',
  'components/DefectList.tsx',
  'components/Icons.tsx',
  'components/ImageInspector.tsx',
  'components/InspectionView.tsx',
  'components/ProfilePage.tsx',
  'components/Toolbar.tsx',
  'components/VehicleSelector.tsx',

  // External CDN Dependencies
  'https://cdn.tailwindcss.com',
  'https://aistudiocdn.com/react@^19.2.0',
  'https://aistudiocdn.com/react-dom@^19.2.0/client', // For React 18+ with createRoot
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm',

  // Icons (from the updated manifest)
  'https://storage.googleapis.com/aistudio-ux-public-assets/codelab-helper/fire-inspector-192.png',
  'https://storage.googleapis.com/aistudio-ux-public-assets/codelab-helper/fire-inspector-512.png'
];

self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache, caching all files...');
        // Using addAll, if any request fails, the entire operation fails.
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete all caches that aren't the current one.
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  // Requests to Supabase API should always go to the network.
  if (event.request.url.includes('supabase.co')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Not in cache - fetch from network
        return fetch(event.request);
      }
    )
  );
});