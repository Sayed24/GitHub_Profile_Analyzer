/* ===============================
   SERVICE WORKER — PWA CORE
   Offline • Cache • Performance
=============================== */

const CACHE_NAME = "gh-analyzer-v1";
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./compare.html"
];

/* ===============================
   INSTALL
=============================== */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

/* ===============================
   ACTIVATE
=============================== */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

/* ===============================
   FETCH
   Strategy:
   - API → Network First
   - Static → Cache First
=============================== */
self.addEventListener("fetch", event => {
  const { request } = event;
  const url = new URL(request.url);

  // GitHub API — always fresh
  if (url.origin === "https://api.github.com") {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static files
  event.respondWith(cacheFirst(request));
});

/* ===============================
   CACHE STRATEGIES
=============================== */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  return cached || fetch(request);
}

async function networkFirst(request) {
  try {
    const fresh = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, fresh.clone());
    return fresh;
  } catch {
    return caches.match(request);
  }
}
