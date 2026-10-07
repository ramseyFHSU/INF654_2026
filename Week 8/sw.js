// FieldSync service worker
// Current stage: app-shell pre-caching, cache-first delivery,
// dynamic caching, offline fallback, versioning, cleanup, and Firebase CRUD.

// Cache version is bumped because app.js and the app shell changed.
const STATIC_CACHE = "fieldSync-static-v4";
const DYNAMIC_CACHE = "fieldSync-dynamic-v4";
const CACHE_PREFIX = "fieldsync-";
const CURRENT_CACHES = [STATIC_CACHE, DYNAMIC_CACHE];

const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
  "/offline.html",
  "/css/styles.css",
  "/js/ui.js",
  "/js/app.js",
  "/js/firebase-config.js",
  "/js/observations-service.js",
  "/images/icons/icon-192.png",
  "/images/icons/icon-512.png",
  "/images/icons/maskable-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL)),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        const oldCaches = keys.filter(
          (key) =>
            key.startsWith(CACHE_PREFIX) && !CURRENT_CACHES.includes(key),
        );

        return Promise.all(oldCaches.map((key) => caches.delete(key)));
      })
      .then(() => self.clients.claim()),
  );
});

function isApiRequest(url) {
  return (
    url.origin === self.location.origin && url.pathname.startsWith("/api/")
  );
}

function isApprovedExternalAsset(url) {
  return [
    "cdnjs.cloudflare.com",
    "fonts.googleapis.com",
    "fonts.gstatic.com",
    "www.gstatic.com",
  ].includes(url.hostname);
}

function shouldRuntimeCache(request, url) {
  const cacheableDestinations = new Set([
    "document",
    "style",
    "script",
    "image",
    "font",
  ]);

  if (!cacheableDestinations.has(request.destination)) {
    return false;
  }

  return url.origin === self.location.origin || isApprovedExternalAsset(url);
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    const url = new URL(request.url);

    if (
      shouldRuntimeCache(request, url) &&
      (response.ok || response.type === "opaque")
    ) {
      const cache = await caches.open(DYNAMIC_CACHE);
      await cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    if (request.mode === "navigate") {
      const offlinePage = await caches.match("/offline.html");
      if (offlinePage) return offlinePage;
    }

    return new Response("Resource unavailable while offline.", {
      status: 504,
      statusText: "Offline",
    });
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // CRUD writes and other non-GET requests are not handled by Cache Storage.
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Same-origin API data is never blindly cache-first.
  if (isApiRequest(url)) {
    event.respondWith(fetch(request));
    return;
  }

  // Firestore requests generally have an empty request.destination,
  // so shouldRuntimeCache() will not put database responses into Cache Storage.
  event.respondWith(cacheFirst(request));
});
