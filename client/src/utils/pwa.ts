// PWA utilities for service worker registration and app functionality

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

// Register service worker
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('Service Worker registered successfully:', registration.scope);
      
      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Show update available notification
              showUpdateAvailableNotification();
            }
          });
        }
      });
      
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
}

// Initialize PWA install prompt
export function initializeInstallPrompt(): void {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Store the event so it can be triggered later
    deferredPrompt = e;
    
    // Show custom install button
    showInstallButton();
  });

  // Handle app installed event
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    hideInstallButton();
    deferredPrompt = null;
    
    // Track installation
    trackAppInstallation();
  });
}

// Show install button
function showInstallButton(): void {
  const installButton = document.getElementById('pwa-install-btn');
  if (installButton) {
    installButton.style.display = 'block';
  }
}

// Hide install button
function hideInstallButton(): void {
  const installButton = document.getElementById('pwa-install-btn');
  if (installButton) {
    installButton.style.display = 'none';
  }
}

// Trigger PWA installation
export async function installPWA(): Promise<boolean> {
  if (!deferredPrompt) {
    return false;
  }

  try {
    // Show the install prompt
    await deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      return true;
    } else {
      console.log('User dismissed the install prompt');
      return false;
    }
  } catch (error) {
    console.error('Error during PWA installation:', error);
    return false;
  } finally {
    deferredPrompt = null;
  }
}

// Check if app is running in standalone mode
export function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
}

// Get network status
export function getNetworkStatus(): { online: boolean; effectiveType?: string } {
  const connection = (navigator as any).connection || 
                    (navigator as any).mozConnection || 
                    (navigator as any).webkitConnection;
  
  return {
    online: navigator.onLine,
    effectiveType: connection?.effectiveType || 'unknown'
  };
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

// Show local notification
export function showLocalNotification(title: string, options: NotificationOptions = {}): void {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [200, 100, 200],
      ...options
    });

    // Auto close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);
  }
}

// Subscribe to push notifications
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  try {
    const registration = await navigator.serviceWorker.ready;
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(getVapidPublicKey())
    });
    
    // Send subscription to server
    await sendSubscriptionToServer(subscription);
    
    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    return null;
  }
}

// Store data for offline use
export async function storeOfflineData(storeName: string, data: any): Promise<void> {
  if (!('indexedDB' in window)) {
    console.warn('IndexedDB not supported');
    return;
  }

  try {
    const db = await openDatabase();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    await store.put({
      id: Date.now(),
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to store offline data:', error);
  }
}

// Retrieve offline data
export async function getOfflineData(storeName: string): Promise<any[]> {
  if (!('indexedDB' in window)) {
    return [];
  }

  try {
    const db = await openDatabase();
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    
    return await store.getAll();
  } catch (error) {
    console.error('Failed to retrieve offline data:', error);
    return [];
  }
}

// Background sync for offline actions
export async function scheduleBackgroundSync(tag: string): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.ready;
    
    if ('sync' in registration) {
      await (registration as any).sync.register(tag);
      console.log('Background sync scheduled:', tag);
    }
  } catch (error) {
    console.error('Failed to schedule background sync:', error);
  }
}

// Share API integration
export async function shareContent(shareData: ShareData): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return true;
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
      return false;
    }
  } else {
    // Fallback to clipboard API
    if (shareData.url && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareData.url);
        showLocalNotification('Link copied to clipboard');
        return true;
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
    return false;
  }
}

// Device capabilities detection
export function getDeviceCapabilities() {
  return {
    camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
    geolocation: 'geolocation' in navigator,
    vibration: 'vibrate' in navigator,
    fullscreen: 'requestFullscreen' in document.documentElement,
    deviceMemory: (navigator as any).deviceMemory || 'unknown',
    hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
    maxTouchPoints: navigator.maxTouchPoints || 0,
    serviceWorker: 'serviceWorker' in navigator,
    pushManager: 'PushManager' in window,
    notifications: 'Notification' in window,
    indexedDB: 'indexedDB' in window,
    localStorage: 'localStorage' in window,
    sessionStorage: 'sessionStorage' in window
  };
}

// Utility functions
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('TrafficGuardDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains('pendingReports')) {
        db.createObjectStore('pendingReports', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('pendingAlerts')) {
        db.createObjectStore('pendingAlerts', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('offlineData')) {
        db.createObjectStore('offlineData', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function getVapidPublicKey(): string {
  // In production, this should be your VAPID public key
  return 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NM4NTn-RYj1u3h8vOB7Z_KA0ZdcEwKqNPWP4Q8Pq_0K8vZjBwYQ8Lg';
}

async function sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
  try {
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription)
    });
  } catch (error) {
    console.error('Failed to send subscription to server:', error);
  }
}

function showUpdateAvailableNotification(): void {
  showLocalNotification('App Update Available', {
    body: 'A new version of TrafficGuard Pro is available. Refresh to update.',
    tag: 'app-update',
    requireInteraction: true,
    actions: [
      { action: 'update', title: 'Update Now' },
      { action: 'dismiss', title: 'Later' }
    ]
  });
}

function trackAppInstallation(): void {
  // Track PWA installation analytics
  if ('gtag' in window) {
    (window as any).gtag('event', 'pwa_install', {
      event_category: 'engagement',
      event_label: 'trafficguard_pwa'
    });
  }
}