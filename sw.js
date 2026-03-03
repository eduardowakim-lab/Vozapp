const CACHE_NAME = "rosto-kids-v2";

const ASSETS = [
  "./index.html",
  "./robo.jpg",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-512-maskable.png"
  // NÃO cachear manifest.webmanifest
  // NÃO cachear sw.js
  // NÃO cachear "./"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // só controla o seu domínio
  if (url.origin !== location.origin) return;

  // sempre buscar ao vivo: manifest e sw
  if (url.pathname.endsWith("manifest.webmanifest") || url.pathname.endsWith("sw.js")) {
    event.respondWith(fetch(req));
    return;
  }

  // navegação: tenta rede, cai no cache do index
  if (req.mode === "navigate") {
    event.respondWith(fetch(req).catch(() => caches.match("./index.html")));
    return;
  }

  // demais assets: cache-first
  event.respondWith(caches.match(req).then((cached) => cached || fetch(req)));
});
