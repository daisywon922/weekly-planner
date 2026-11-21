const appVersion = '1.0.3';
const cacheName = 'weekly-planner-' + appVersion;
const assets = [
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './maskable-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName)
    .then(cache => cache.addAll(assets.map(asset => new Request(asset, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith('weekly-planner-') && key !== cacheName)
      .map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});

self.addEventListener('message', event => {
  if (event.data?.type === 'GET_APP_VERSION') {
    event.source?.postMessage({ type: 'APP_VERSION', version: appVersion });
  }
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || !request.url.startsWith(self.registration.scope)) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request, { cache: 'no-cache' }).catch(async () => {
      const cache = await caches.open(cacheName);
      return await cache.match('./index.html') || Response.error();
    }));
    return;
  }
  event.respondWith(caches.open(cacheName).then(async cache => await cache.match(request) || fetch(request)));
});
