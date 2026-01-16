const CACHE_NAME = 'taskflow-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

// Install
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => 
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch - Network first, then cache
self.addEventListener('fetch', (e) => {
  // Skip non-GET requests and Supabase API calls
  if (e.request.method !== 'GET' || e.request.url.includes('supabase')) {
    return;
  }
  
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// Background sync for offline tasks
self.addEventListener('sync', (e) => {
  if (e.tag === 'sync-tasks') {
    e.waitUntil(syncTasks());
  }
});

async function syncTasks() {
  // Will be handled by main app
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => client.postMessage({ type: 'SYNC_TASKS' }));
  });
}
