// Service Worker — 极简出租管理系统 v3
const VERSION = 'rental-v3';
const CDN_FILES = [
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install: precache local + CDN files
self.addEventListener('install', e => {
  console.log('🚀 SW ' + VERSION + ': installing');
  e.waitUntil(
    caches.open(VERSION).then(cache => {
      // Local files — guaranteed to work
      return cache.addAll(['index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'])
        .then(() => {
          // CDN files — may fail due to CORS, don't break install
          return Promise.allSettled(
            CDN_FILES.map(url =>
              cache.add(url).catch(() => console.log('SW: CDN precache skipped for', url))
            )
          );
        });
    }).catch(() => {})
  );
  self.skipWaiting();
});

// Activate: delete old caches
self.addEventListener('activate', e => {
  console.log('✅ SW ' + VERSION + ': activated');
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== VERSION).map(k => {
        console.log('🗑️ SW: deleting old cache', k);
        return caches.delete(k);
      })
    ))
  );
  self.clients.claim();
});

// Fetch: cache-first, network fallback (also caches CDN on first load)
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetched = fetch(e.request).then(resp => {
        if (resp && resp.status === 200) {
          const clone = resp.clone();
          caches.open(VERSION).then(cache => cache.put(e.request, clone));
        }
        return resp;
      }).catch(() => cached);
      return cached || fetched;
    })
  );
});
