// FieldSync service worker
// Current stage: app-shell pre-caching, cache-first delivery,
// dynamic caching, offline fallback, versioning, and cleanup.

const STATIC_CACHE = "fieldsync-static-v1";
const DYNAMIC_CACHE = "fieldsync-dynamic-v1";
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

  // This lesson only uses caching strategies for GET requests.
  // POST/PUT/PATCH/DELETE need the later IndexedDB outbox strategy.
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Frequently changing API data is not blindly cache-first here.
  if (isApiRequest(url)) {
    event.respondWith(fetch(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});
