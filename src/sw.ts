
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { NetworkFirst, NetworkOnly, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare const self: ServiceWorkerGlobalScope;









const API_PATH_PREFIX = '/api/';



precacheAndRoute(self.__WB_MANIFEST);




registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')));





registerRoute(({ url }) => url.pathname.startsWith(`${API_PATH_PREFIX}auth`), new NetworkOnly());

// Any non-GET request to the API (create/update/delete) must never be
// served from cache and must never itself be cached - mutations are not
// idempotent reads.
registerRoute(
  ({ url, request }) => url.pathname.startsWith(API_PATH_PREFIX) && request.method !== 'GET',
  new NetworkOnly(),
);

// ---- API: other GETs get NetworkFirst, so the app still shows the last-
// known data (with a visible "offline" indicator elsewhere in the UI) when
// the network is unavailable, but always prefers a live response first. ----
registerRoute(
  ({ url, request }) => url.pathname.startsWith(API_PATH_PREFIX) && request.method === 'GET',
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 8,
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 5 * 60 }),
    ],
  }),
);

// ---- Same-origin hashed build assets are immutable - safe to serve
// cache-first indefinitely, matching nginx's own 1-year Cache-Control on
// /assets/ for the exact same reason (filename changes when content does).
registerRoute(
  ({ url, request }) => url.origin === self.location.origin && request.destination !== 'document',
  new CacheFirst({
    cacheName: 'static-assets',
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  }),
);

// ---- Push notifications (subscribe/unsubscribe UI lands in Phase 4; the
// service worker's receiving end is wired here since it's the same file). --
self.addEventListener('push', (event) => {
  if (!event.data) return;
  let payload: { title?: string; body?: string; url?: string };
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'Training Platform', body: event.data.text() };
  }
  event.waitUntil(
    self.registration.showNotification(payload.title ?? 'Training Platform', {
      body: payload.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: payload.url ?? '/' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data as { url?: string } | undefined)?.url ?? '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((client) => new URL(client.url).pathname === targetUrl);
      if (existing) return existing.focus();
      return self.clients.openWindow(targetUrl);
    }),
  );
});

// ---- Update lifecycle: wait for the page to explicitly ask (see
// useServiceWorkerRegistration.ts's "Refresh" toast action) rather than
// silently taking over - a business app's users shouldn't have tabs
// reloaded out from under them without a chance to save in-progress work. --
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
