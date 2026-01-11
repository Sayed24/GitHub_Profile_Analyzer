/* ======================================
   SERVICE WORKER — GitHub Profile Analyzer
====================================== */

const CACHE_NAME = "gh-analyzer-v1";
const API_CACHE = "gh-api-cache-v1";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/css/styles.css",
  "/js/app.js",
  "/js/ui.js",
  "/js/api.js",
  "/js/charts.js",
  "/js/theme.js",
  "/assets/icons/icon-192.png",
  "/assets/icons/icon-512.png"
];

/* ======================================
   INSTALL
====================================== */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

/* ======================================
   ACTIVATE
====================================== */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME && key !== API_CACHE)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* ======================================
   FETCH — STALE WHILE REVALIDATE
====================================== */
self.addEventListener("fetch", event => {
  const { request } = event;

  /* GitHub API requests */
  if (request.url.includes("api.github.com")) {
    event.respondWith(apiCacheStrategy(request));
    return;
  }

  /* Static assets */
  event.respondWith(
    caches.match(request).then(cached => {
      return (
        cached ||
        fetch(request).then(response => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(request, response.clone());
            return response;
          });
        })
      );
    })
  );
});

/* ======================================
   API CACHE STRATEGY
====================================== */
async function apiCacheStrategy(request) {
  const cache = await caches.open(API_CACHE);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then(response => {
      cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}

/* ======================================
   PUSH NOTIFICATIONS (READY)
====================================== */
self.addEventListener("push", event => {
  const data = event.data ? event.data.json() : {};

  const title = data.title || "GitHub Analyzer";
  const options = {
    body: data.body || "New update available",
    icon: "/assets/icons/icon-192.png",
    badge: "/assets/icons/icon-192.png"
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

/* ======================================
   NOTIFICATION CLICK
====================================== */
self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow("/")
  );
});
