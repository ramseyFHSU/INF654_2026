const STATIC_CACHE = "fieldSync-static-v1";

const APP_SHELL = [
  "/",
  "/index.html",
  "/css/styles.css",
  "/css/materialize.min.css",
  "/js/app.js",
  "/js/ui.js",
  "/js/materialize.min.js",
  "/offline.html",
];

//Install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(APP_SHELL);
    }),
  );
});

//Activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(keys.filter((key) => key.startsWith("fieldSync-")))
          .filter((key) => key !== STATIC_CACHE)
          .map((key) => caches.delete(key));
      })
      .then(() => self.clients.claim()),
  );
});

//Fetch
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    (async () => {
      const cachedResponse = await caches.match(event.request);

      if (cachedResponse) {
        return cachedResponse;
      }

      try {
        return await fetch(event.request);
      } catch (error) {
        return caches.match("/offline.html");
      }
    })(),
  );
});
