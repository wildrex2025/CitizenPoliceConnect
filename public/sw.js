const CACHE_NAME = 'trafficguard-pro-v1';
const STATIC_CACHE = 'static-cache-v1';
const DYNAMIC_CACHE = 'dynamic-cache-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing');
  event.waitUntil(self.skipWaiting());
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(fetchResponse => {
          if (fetchResponse.status === 200) {
            const responseClone = fetchResponse.clone();
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return fetchResponse;
        });
      })
      .catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Push notification received');
  
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'New notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    data: data.data || {}
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'TrafficGuard Pro', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll().then(clients => {
      for (const client of clients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'offline-sync') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  console.log('Syncing offline data');
  return Promise.resolve();
}