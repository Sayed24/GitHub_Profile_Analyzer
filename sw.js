/* =========================
   GitHub Analytics Pro
   Service Worker
   ========================= */

const CACHE_NAME = "github-analytics-pro-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/compare.html",
  "/css/style.css",
  "/js/app.js",
  "/js/api.js",
  "/js/ui.js",
  "/js/charts.js",
  "/manifest.json"
];

/* ---------- Install ---------- */

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

/* ---------- Activate ---------- */

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

/* ---------- Fetch ---------- */

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return (
        cached ||
        fetch(event.request)
          .then(response => {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, copy);
            });
            return response;
          })
          .catch(() => cached)
      );
    })
  );
});
