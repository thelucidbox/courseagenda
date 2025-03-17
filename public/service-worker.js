// Basic Service Worker for CourseAgenda PWA
const CACHE_NAME = 'courseagenda-cache-v1';

// Simple cache list - minimal for development
const CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/apple-touch-icon.png',
  '/icons/favicon-32x32.png',
  '/icons/favicon-16x16.png'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing');
  
  // Activate the service worker immediately
  self.skipWaiting();
  
  // Cache basic files
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching basic files');
        return cache.addAll(CACHE_URLS);
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating');
  
  // Take control of all clients
  event.waitUntil(
    clients.claim()
  );
  
  // Clean up old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Network-first fetch strategy with cache fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and API calls
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone the response for the cache
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME)
          .then(cache => {
            if (response.status === 200) {
              cache.put(event.request, responseToCache);
            }
          });
        
        return response;
      })
      .catch(() => {
        // Try to get from cache if network fails
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // If it's a navigation request, return the homepage
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
            
            // Otherwise return a simple error
            return new Response('Network error - app is offline', {
              status: 503,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});