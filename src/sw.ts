
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { NetworkFirst, NetworkOnly, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare const self: ServiceWorkerGlobalScope;

const API_ORIGIN = new URL(import.meta.env.VITE_API_URL).origin;



precacheAndRoute(self.__WB_MANIFEST);




registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')));





registerRoute(({ url }) => url.origin === API_ORIGIN && url.pathname.startsWith('/auth'), new NetworkOnly());




registerRoute(
  ({ url, request }) => url.origin === API_ORIGIN && request.method !== 'GET',
  new NetworkOnly(),
);




registerRoute(
  ({ url, request }) => url.origin === API_ORIGIN && request.method === 'GET',
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 8,
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 5 * 60 }),
    ],
  }),
);




registerRoute(
  ({ url, request }) => url.origin === self.location.origin && request.destination !== 'document',
  new CacheFirst({
    cacheName: 'static-assets',
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  }),
);



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





self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
