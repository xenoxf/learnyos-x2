// Self-destructing service worker - immediately unregisters and clears cache
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(names => Promise.all(names.map(n => caches.delete(n))))
      .then(() => self.registration.unregister())
  );
});
self.addEventListener('fetch', () => {});
