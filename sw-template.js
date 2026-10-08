/* Service worker: lets the app open with no signal (e.g. on the train).

   The whole app shell is stored when the worker installs, in a cache named with a hash of the page.
   A new build changes sw.js, the browser installs the new worker, and the old cache is deleted.
   So pages are served from the cache first: no wait on a weak connection, and nothing fetched at
   runtime can overwrite the known-good copy (a captive-portal page or an error response, say). */
const CACHE = "secops-cards-__CACHE_VERSION__";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-180.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  if (new URL(req.url).origin !== self.location.origin) return;

  // Opening the app (including with a query string): the cached shell, network only if it is missing.
  if (req.mode === "navigate") {
    event.respondWith(
      caches.match("./index.html").then((hit) => hit || caches.match("./")).then((hit) => hit || fetch(req))
    );
    return;
  }

  // Everything else (manifest, icons): cached copy, else the network. Responses are never stored here.
  event.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
