const CACHE = "level-up-shared-glass-v1";
const CORE = ["/offline.html", "/manifest.json", "/favicon.svg", "/fonts/dm-sans.ttf", "/fonts/barlow-medium.ttf", "/icons/icon-192.png", "/icons/icon-512.png", "/icons/icon-maskable-512.png"];
const PAGES = new Set(["/", "/stations", "/leaderboard", "/event-info", "/offline"]);

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith("level-up-") && key !== CACHE).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/signin-with-chatgpt") || url.pathname.startsWith("/signout-with-chatgpt") || url.pathname.startsWith("/callback") || url.pathname.startsWith("/api/")) return;
  if (url.pathname.startsWith("/entry/") || url.pathname === "/register" || url.pathname === "/my-result" || url.pathname.startsWith("/admin")) {
    if(request.mode === "navigate") event.respondWith(fetch(request).catch(async()=> (await caches.match("/offline.html")) || Response.error()));
    return;
  }
  // Never mix router/RSC payloads with full HTML documents in the cache.
  if (request.headers.has("RSC") || url.searchParams.has("_rsc") || request.headers.get("Accept")?.includes("text/x-component")) return;
  const navigation = request.mode === "navigate" && PAGES.has(url.pathname);
  const asset = ["image", "style", "script", "font"].includes(request.destination);
  if (!navigation && !asset) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(request);
      const isHtml = response.headers.get("content-type")?.includes("text/html");
      if (response.ok && !response.redirected && (navigation ? isHtml : !isHtml)) {
        await cache.put(request, response.clone());
      }
      return response;

    } catch {
      return (await cache.match(request)) ||
        (navigation ? await cache.match("/offline.html") : Response.error());
    }
  })());
});
