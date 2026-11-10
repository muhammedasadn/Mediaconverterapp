// ----------------------------------------------------------------------------
// Universal Media Converter — High-Performance Service Worker & Offline Cache
// Cache-First Strategy for WebAssembly & Static Assets
// ----------------------------------------------------------------------------

const APP_CACHE_NAME = 'universal-converter-app-v2';
const WASM_CACHE_NAME = 'universal-converter-wasm-v1';
const OFFLINE_URL = '/';

const ASSETS_TO_PRECACHE = [
  '/',
  '/manifest.json',
  '/compress',
  '/edit',
  '/batch',
  '/info',
  '/history',
  '/settings',
  '/import',
  '/mp4-to-mp3',
  '/youtube-mp4-to-mp3',
];

// Install: precache offline application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching App Shell for 100% Offline Resilience...');
      return cache.addAll(ASSETS_TO_PRECACHE);
    })
  );
  self.skipWaiting();
});

// Activate: prune outdated cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== APP_CACHE_NAME && name !== WASM_CACHE_NAME) {
            console.log('[SW] Purging deprecated cache namespace:', name);
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Optimized routing
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Strategy 1: Cache-First for WebAssembly core files & external CDN binaries
  if (url.pathname.endsWith('.wasm') || url.hostname.includes('unpkg.com') || url.hostname.includes('jsdelivr.net')) {
    event.respondWith(
      caches.open(WASM_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Strategy 2: Network-First with Cache Fallback for dynamic pages and app shell
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(APP_CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
        });
      })
  );
});
