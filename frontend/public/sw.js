// Temporary service worker: clear caches and unregister itself so clients fetch fresh bundles
// This file intentionally does NOT implement any caching/fetch handlers.

self.addEventListener('install', (event) => {
  // Activate immediately so we can unregister in `activate`
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      // Clear all caches created by previous service workers
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      // Unregister this service worker so future navigations are uncontrolled
      await self.registration.unregister();
      // Notify all client windows so they can reload if needed
      const clientList = await clients.matchAll({ type: 'window' });
      for (const client of clientList) {
        try { client.postMessage({ type: 'SW_UNREGISTERED' }); } catch (e) { /* ignore */ }
      }
    } catch (err) {
      console.error('Service worker cleanup failed:', err);
    }
  })());
});

// No fetch handler: let the network handle all requests (prevents caching of old bundles)