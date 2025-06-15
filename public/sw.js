const CACHE_NAME = 'trafficguard-v1.0.0';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Files to cache for offline use
const STATIC_ASSETS = [
  '/',
  '/traffic-guard',
  '/emergency',
  '/traffic-accidents',
  '/vehicle-tracking',
  '/traffic-monitor',
  '/women-safety',
  '/child-safety',
  '/analytics',
  '/manifest.json'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  '/api/traffic/',
  '/api/vehicles/',
  '/api/emergency/',
  '/api/analytics/'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Cache failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Handle other requests
  event.respondWith(handleResourceRequest(request));
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful API responses
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache for API', url.pathname);
    
    // Fall back to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline response for specific endpoints
    return getOfflineApiResponse(url.pathname);
  }
}

// Handle navigation requests with cache-first for static pages
async function handleNavigationRequest(request) {
  try {
    // Check cache first for app shell
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Try network
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      return networkResponse;
    }

    throw new Error('Network response not ok');
  } catch (error) {
    console.log('Service Worker: Serving offline page');
    
    // Return cached index.html for SPA routing
    const cachedIndex = await caches.match('/');
    if (cachedIndex) {
      return cachedIndex;
    }

    // Fallback offline page
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>TrafficGuard - Offline</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .offline { color: #666; }
          </style>
        </head>
        <body>
          <h1>TrafficGuard Pro</h1>
          <p class="offline">You are currently offline. Some features may not be available.</p>
          <button onclick="window.location.reload()">Try Again</button>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Handle resource requests (CSS, JS, images)
async function handleResourceRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Try network and cache the response
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }

    throw new Error('Network response not ok');
  } catch (error) {
    console.log('Service Worker: Resource not available', request.url);
    
    // Return placeholder for images
    if (request.url.includes('.jpg') || request.url.includes('.png') || request.url.includes('.svg')) {
      return new Response(`
        <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="100" fill="#f0f0f0"/>
          <text x="50" y="50" font-family="Arial" font-size="12" text-anchor="middle" fill="#999">Offline</text>
        </svg>
      `, {
        headers: { 'Content-Type': 'image/svg+xml' }
      });
    }

    throw error;
  }
}

// Provide offline responses for specific API endpoints
function getOfflineApiResponse(pathname) {
  const offlineResponses = {
    '/api/traffic/violations': {
      data: [],
      message: 'Offline mode - violations will sync when online',
      offline: true
    },
    '/api/traffic/rewards/1': {
      totalPoints: 0,
      currentLevel: 'Offline',
      monthlyRank: '-',
      offline: true
    },
    '/api/emergency/alerts': {
      data: [],
      message: 'Emergency services offline - call 100 directly',
      offline: true
    }
  };

  const response = offlineResponses[pathname] || {
    message: 'Service temporarily unavailable - working offline',
    offline: true
  };

  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'violation-report') {
    event.waitUntil(syncViolationReports());
  }
  
  if (event.tag === 'emergency-alert') {
    event.waitUntil(syncEmergencyAlerts());
  }
});

// Sync violation reports when back online
async function syncViolationReports() {
  try {
    const db = await openDatabase();
    const pendingReports = await getPendingReports(db);
    
    for (const report of pendingReports) {
      try {
        const response = await fetch('/api/traffic/violations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(report.data)
        });
        
        if (response.ok) {
          await deletePendingReport(db, report.id);
          console.log('Service Worker: Synced violation report', report.id);
        }
      } catch (error) {
        console.error('Service Worker: Failed to sync report', report.id, error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Background sync failed', error);
  }
}

// Sync emergency alerts when back online
async function syncEmergencyAlerts() {
  try {
    const db = await openDatabase();
    const pendingAlerts = await getPendingEmergencyAlerts(db);
    
    for (const alert of pendingAlerts) {
      try {
        const response = await fetch('/api/emergency/alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alert.data)
        });
        
        if (response.ok) {
          await deletePendingAlert(db, alert.id);
          console.log('Service Worker: Synced emergency alert', alert.id);
        }
      } catch (error) {
        console.error('Service Worker: Failed to sync alert', alert.id, error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Emergency sync failed', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    title: 'TrafficGuard Pro',
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'trafficguard-notification',
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'View Details',
        icon: '/icons/action-view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/action-dismiss.png'
      }
    ]
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      options.title = payload.title || options.title;
      options.body = payload.body || options.body;
      options.data = payload.data || {};
      
      // Custom notification types
      if (payload.type === 'emergency') {
        options.icon = '/icons/emergency-icon.png';
        options.requireInteraction = true;
        options.vibrate = [200, 100, 200, 100, 200];
      } else if (payload.type === 'violation') {
        options.icon = '/icons/violation-icon.png';
        options.tag = 'violation-update';
      }
    } catch (error) {
      console.error('Service Worker: Error parsing push payload', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event.action);
  
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  let targetUrl = '/';
  
  if (event.notification.data) {
    targetUrl = event.notification.data.url || targetUrl;
  }
  
  if (event.action === 'view') {
    targetUrl = event.notification.data?.viewUrl || targetUrl;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(targetUrl) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// Database operations for offline storage
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('TrafficGuardDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('pendingReports')) {
        db.createObjectStore('pendingReports', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('pendingAlerts')) {
        db.createObjectStore('pendingAlerts', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

function getPendingReports(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingReports'], 'readonly');
    const store = transaction.objectStore('pendingReports');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function getPendingEmergencyAlerts(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingAlerts'], 'readonly');
    const store = transaction.objectStore('pendingAlerts');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function deletePendingReport(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingReports'], 'readwrite');
    const store = transaction.objectStore('pendingReports');
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

function deletePendingAlert(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingAlerts'], 'readwrite');
    const store = transaction.objectStore('pendingAlerts');
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}