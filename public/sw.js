const CACHE = "far-cache-v1";
const STATIC = ["/ERB.png", "/ERB-original.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(STATIC))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        const clone = r.clone();
        caches.open(CACHE).then((c) => {
          if (e.request.url.startsWith(self.location.origin) && r.ok) {
            c.put(e.request, clone);
          }
        });
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});