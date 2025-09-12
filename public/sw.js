// service-Worker.js  (substitua tudo)
const CACHE = 'aproveitai-v1';
const ASSETS = [
  '/', '/index.html',
  '/promocoes.html','/criarpromocao.html',
  '/logo-aproveitai.png','/logo-prometheus.png',
  '/favicon.ico','/manifest.json',
  '/criarpromocao.js','/consultas.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      for (const asset of ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn(`Falha ao armazenar: ${asset}`, err);
        }
      }
    })()
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached =>
      cached ||
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match('/index.html'))
    )
  );
});
