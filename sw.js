// Service Worker — 极简出租管理系统
const CACHE = 'rental-v2';

self.addEventListener('install', e => {
  console.log('🚀 SW: installing');
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll(['index.html', 'manifest.json', 'icon-192.png', 'icon-512.png']);
    }).catch(() => { /* some files may not exist yet */ })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  console.log('✅ SW: activated');
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      // Return cached, then update in background
      const fetched = fetch(e.request).then(resp => {
        if (resp && resp.status === 200) {
          const clone = resp.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return resp;
      }).catch(() => cached);
      return cached || fetched;
    })
  );
});