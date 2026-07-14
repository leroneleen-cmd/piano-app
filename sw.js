/* Clavier service worker — offline app shell.
   Network-first for the page (so updates show when online), cache-first for assets. */
const CACHE = 'clavier-v1';
const ASSETS = [
  './', 'index.html', 'manifest.webmanifest',
  'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((r) => { const rc = r.clone(); caches.open(CACHE).then((c) => c.put('index.html', rc)); return r; })
        .catch(() => caches.match('index.html'))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then((cached) =>
      cached || fetch(req).then((resp) => {
        const rc = resp.clone(); caches.open(CACHE).then((c) => c.put(req, rc)); return resp;
      }).catch(() => cached)
    )
  );
});
