const CACHE_NAME = 'carrosserie-inspecteur-v2';
const urlsToCache = [
  '.',
  'index.html',
  'manifest.json',
  // Code files
  'index.tsx',
  'App.tsx',
  'lib/supabase.ts',
  // Components
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
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Use addAll with a catch block to prevent install failure if one asset is missing
        return cache.addAll(urlsToCache).catch(err => {
          console.error('Failed to cache all files:', err);
        });
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
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