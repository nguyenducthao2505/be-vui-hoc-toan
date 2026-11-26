/* Bộ nhớ đệm để chạy offline. Khi sửa mã, tăng số phiên bản bên dưới. */
const CACHE = 'bvht-v4';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './style.css',
  './core.js', './lessons.js', './games.js', './games2.js', './app.js',
  './icon-192.png', './icon-512.png', './maskable-512.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
});
