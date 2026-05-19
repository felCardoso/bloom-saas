// Bump CACHE_VERSION on every deploy to invalidate old caches and trigger update banner
const CACHE_VERSION = "bloom-v1";

const PRECACHE = [
  "/",
  "/dashboard",
  "/clientes",
  "/pedidos",
  "/agenda",
  "/produtos",
  "/configuracoes",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];

// ─── Install: pre-cache core pages ───────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => {
        // Don't auto-activate — wait for PwaUpdateBanner to send SKIP_WAITING
        // on the very first install, skip waiting immediately (no old SW)
        return self.clients.matchAll().then((clients) => {
          if (clients.length === 0) self.skipWaiting();
        });
      })
  );
});

// ─── Activate: delete old caches ─────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// ─── Fetch: network-first for API + navigation, cache fallback ───────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Skip non-GET
  if (request.method !== "GET") return;

  // API routes: network-only (never serve stale data)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(request));
    return;
  }

  // Everything else: network-first with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then(
          (cached) => cached ?? caches.match("/~offline")
        )
      )
  );
});

// ─── Push: show native notification ──────────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Bloom", body: event.data.text() };
  }

  const { title, body, icon, badge, url, tag } = payload;
  event.waitUntil(
    self.registration.showNotification(title ?? "Bloom", {
      body: body ?? "",
      icon: icon ?? "/icons/icon-192.png",
      badge: badge ?? "/icons/icon-192.png",
      tag: tag,
      data: { url: url ?? "/dashboard" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url ?? "/dashboard";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const existing = clients.find((c) => c.url.includes(self.location.origin));
        if (existing) {
          existing.focus();
          existing.navigate(targetUrl);
        } else {
          self.clients.openWindow(targetUrl);
        }
      })
  );
});

// ─── Message: handle SKIP_WAITING from PwaUpdateBanner ───────────────────────
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
