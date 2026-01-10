/* =========================================================
   SERVICE WORKER — GITHUB ANALYZER
   Strategy: Stale While Revalidate
========================================================= */

const CACHE_NAME = "github-analyzer-v1";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/offline.html",
  "/compare.html",

  "/css/style.css",

  "/js/main.js",
  "/js/api.js",
  "/js/ui.js",
  "/js/charts.js",
  "/js/pwa.js",
  "/js/compare.js",

  "/manifest.json",

  "/assets/icons/icon-192.png",
  "/assets/icons/icon-512.png"
];

/* =========================================================
   INSTALL
========================================================= */

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

/* =========================================================
   ACTIVATE
========================================================= */

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* =========================================================
   FETCH — STALE WHILE REVALIDATE
========================================================= */

self.addEventListener("fetch", event => {
  const request = event.request;

  // GitHub API — network first
  if (request.url.includes("api.github.com")) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets — cache first
  event.respondWith(staleWhileRevalidate(request));
});

/* =========================================================
   STRATEGIES
========================================================= */

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then(response => {
      if (response && response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached || fetchPromise || caches.match("/offline.html");
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch {
    return cache.match(request);
  }
}

/* =========================================================
   FALLBACK
========================================================= */

self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match("/offline.html")
    )
  );
});
