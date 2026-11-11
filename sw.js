// Keeps ColorNotes working with no internet. Change the version when files change.
const CACHE = 'colornotes-v3';
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Show the saved copy straight away, and refresh it in the background when online
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const hit = await cache.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then(res => {
      if (res.ok || res.type === 'opaque') cache.put(e.request, res.clone());
      return res;
    }).catch(() => hit);
    if (hit) { e.waitUntil(net); return hit; }
    return net;
  }));
});
