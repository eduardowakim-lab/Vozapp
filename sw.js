const CACHE_NAME = "rosto-kids-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./robo.jpg",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-512-maskable.png"
];

// Instala e faz cache dos arquivos
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Ativa e limpa caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// Estratégia simples:
// - Para navegação (abrir a página): tenta rede, cai pro cache.
// - Para assets: cache-first.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // só trabalha no mesmo domínio
  if (url.origin !== location.origin) return;

  // Navegação
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put("./index.html", copy));
        return res;
      }).catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Assets
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
