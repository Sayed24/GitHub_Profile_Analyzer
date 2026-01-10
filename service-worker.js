/* ===========================
   SERVICE WORKER
   GitHub Profile Analyzer
=========================== */

const CACHE_NAME = "github-analyzer-v1";

/* STATIC ASSETS */
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/compare.html",
  "/css/style.css",

  "/js/main.js",
  "/js/api.js",
  "/js/ui.js",
  "/js/charts.js",
  "/js/theme.js",
  "/js/pwa.js",

  "/assets/icons/icon-192.png",
  "/assets/icons/icon-512.png"
];

/* ===========================
   INSTALL
=========================== */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

/* ===========================
   ACTIVATE
=========================== */
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

/* ===========================
   FETCH
   Stale-While-Revalidate
=========================== */
self.addEventListener("fetch", event => {
  const { request } = event;

  // GitHub API requests
  if (request.url.includes("api.github.com")) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Static assets
  event.respondWith(
    caches.match(request).then(cached => {
      return cached || fetch(request);
    })
  );
});

/* ===========================
   STRATEGY
=========================== */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const networkFetch = fetch(request)
    .then(response => {
      cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);

  return cached || networkFetch;
}

/* ===========================
   PUSH EVENTS
=========================== */
self.addEventListener("push", event => {
  const data = event.data?.text() || "New GitHub update available";

  event.waitUntil(
    self.registration.showNotification("GitHub Analyzer", {
      body: data,
      icon: "/assets/icons/icon-192.png",
      badge: "/assets/icons/icon-96.png"
    })
  );
});
