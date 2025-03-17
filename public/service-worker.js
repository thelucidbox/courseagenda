// Service Worker for CourseAgenda PWA
const CACHE_NAME = 'courseagenda-cache-v1';

// List of resources to cache immediately when the service worker is installed
const PRECACHE_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/app-icon.svg',
  '/icons/apple-touch-icon.png',
  '/icons/favicon-32x32.png',
  '/icons/favicon-16x16.png',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
];

// Resources that should not be cached
const NO_CACHE_URLS = [
  '/api/',
  'chrome-extension://'
];

// Install event - cache the core static assets
self.addEventListener('install', (event) => {
  // Skip waiting forces the waiting service worker to become the active service worker
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Pre-caching resources');
        return cache.addAll(PRECACHE_RESOURCES);
      })
      .catch((error) => {
        console.error('[Service Worker] Pre-cache error:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  // Claim allows the service worker to immediately take control of all open clients 
  event.waitUntil(clients.claim());

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Helper function to determine if a URL should be cached
function shouldCache(url) {
  // Don't cache API requests or other dynamic content
  return !NO_CACHE_URLS.some(nocacheUrl => url.includes(nocacheUrl));
}

// Fetch event - network-first strategy with fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin) ||
      event.request.method !== 'GET') {
    return;
  }

  // Skip if this shouldn't be cached
  if (!shouldCache(event.request.url)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Save a copy of the response in the cache
        if (response.status === 200 && response.type === 'basic') {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, clonedResponse);
            });
        }
        return response;
      })
      .catch(() => {
        // When network fails, try to serve from cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // For navigation requests, serve the index.html as fallback
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
            
            return new Response('Network error occurred', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Listen for messages from the main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});