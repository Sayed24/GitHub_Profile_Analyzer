/* GitHub Profile Analyzer PWA service worker */
const VERSION = "v5";
const STATIC_CACHE = `ghpa-static-${VERSION}`;
const RUNTIME_CACHE = `ghpa-runtime-${VERSION}`;
const API_CACHE = `ghpa-api-${VERSION}`;

const LOCAL_ASSETS = [
  "./",
  "./index.html",
  "./compare.html",
  "./offline.html",
  "./manifest.webmanifest",
  "./css/styles.css",
  "./js/utils.js",
  "./js/api.js",
  "./js/charts.js",
  "./js/ui.js",
  "./js/theme.js",
  "./js/pwa.js",
  "./js/app.js",
  "./js/compare.js",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/icon-maskable-512.png"
];

const OFFLINE_URL = new URL("./offline.html", self.registration.scope).href;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(LOCAL_ASSETS.map((path) => new URL(path, self.registration.scope).href)))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  const keep = new Set([STATIC_CACHE, RUNTIME_CACHE, API_CACHE]);
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("ghpa-") && !keep.has(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (url.origin === "https://api.github.com") {
    event.respondWith(staleWhileRevalidate(request, API_CACHE));
    return;
  }

  if (url.origin !== self.location.origin) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }

  event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
});

async function networkFirstNavigation(request) {
  try {
    const response = await fetchWithTimeout(request, 4500);
    if (response && response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (_) {
    const cached = await caches.match(request);
    if (cached) return cached;
    const root = await caches.match(new URL("./index.html", self.registration.scope).href);
    return root || caches.match(OFFLINE_URL);
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkPromise = fetch(request)
    .then((response) => {
      if (response && (response.ok || response.type === "opaque")) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);

  if (cached) {
    // Refresh silently for the next visit.
    networkPromise.catch(() => null);
    return cached;
  }

  const network = await networkPromise;
  if (network) return network;
  if (request.destination === "document") return caches.match(OFFLINE_URL);
  return Response.error();
}

function fetchWithTimeout(request, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(request, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

self.addEventListener("push", (event) => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch (_) { payload = { body: event.data ? event.data.text() : "" }; }
  const title = payload.title || "GitHub Profile Analyzer";
  const options = {
    body: payload.body || "There’s an update in GitHub Profile Analyzer.",
    icon: new URL("./assets/icons/icon-192.png", self.registration.scope).href,
    badge: new URL("./assets/icons/icon-192.png", self.registration.scope).href,
    tag: payload.tag || "ghpa-update",
    data: { url: payload.url || new URL("./index.html", self.registration.scope).href }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data && event.notification.data.url
    ? event.notification.data.url
    : new URL("./index.html", self.registration.scope).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.startsWith(self.registration.scope) && "focus" in client) {
          if ("navigate" in client) client.navigate(target);
          return client.focus();
        }
      }
      return self.clients.openWindow ? self.clients.openWindow(target) : undefined;
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});
