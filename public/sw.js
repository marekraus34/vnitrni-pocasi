const CACHE = 'inner-weather-v2';
const SHELL = ['/', '/manifest.json', '/icon-192.png', '/icon-512.png'];

// Install: cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first for navigation + fonts, cache-first for everything else
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // HTML navigation → always try network, fall back to cached root (/)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/'))
    );
    return;
  }

  // Google Fonts → network with cache write
  if (url.hostname.includes('googleapis.com') || url.hostname.includes('gstatic.com')) {
    event.respondWith(
      caches.open(CACHE).then(cache =>
        fetch(event.request)
          .then(res => { cache.put(event.request, res.clone()); return res; })
          .catch(() => caches.match(event.request))
      )
    );
    return;
  }

  // Everything else → cache first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(res => {
        // Next.js API routy neukládáme do mezipaměti (chceme živá data)
        if (!event.request.url.includes('/api/')) {
          caches.open(CACHE).then(c => c.put(event.request, res.clone()));
        }
        return res;
      }).catch(() => null);
    })
  );
});

// =========================================================================
// NOVÉ: PUSH NOTIFIKACE (Zpracování zpráv ze serveru a kliknutí na oznámení)
// =========================================================================
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Vnitřní počasí';
  const options = {
    body: data.body || 'Máš novou aktualizaci v aplikaci.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
