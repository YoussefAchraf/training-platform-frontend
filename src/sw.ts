
import { precacheAndRoute, createHandlerBoundToURL, matchPrecache } from 'workbox-precaching';
import { NavigationRoute, registerRoute, setCatchHandler } from 'workbox-routing';
import { NetworkFirst, NetworkOnly, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { urlBase64ToUint8Array } from '@/shared/utils/webPush';

declare const self: ServiceWorkerGlobalScope;

const VAPID_PUBLIC_KEY: string | undefined = import.meta.env.VITE_VAPID_PUBLIC_KEY;









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
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  }),
);

// ---- Offline navigation fallback: NavigationRoute above already serves the
// precached app shell once a prior online visit has cached it, but a
// genuinely first-ever visit while offline has nothing to fall back to -
// this catches that case with a small static page instead of a failed
// navigation, the same way a native app shows *something* rather than a
// blank/broken screen when there's no connectivity at all. ----
setCatchHandler(async ({ request }) => {
  if (request.destination === 'document') {
    return (await matchPrecache('/offline.html')) ?? Response.error();
  }
  return Response.error();
});

// ---- App-icon badge count: the Badging API has no server-side concept of
// "current count", so a push that arrives while every app window is closed
// is the only thing that can see it happen - nothing else runs in the
// background to update the home-screen badge. This cache holds this service
// worker's own running total for exactly that case; useAppBadge.ts resyncs
// it to the real, precisely-computed count (via SYNC_BADGE_COUNT below) the
// moment a dashboard is actually open to compute one, so the guess below
// never has to carry the count for long.
const BADGE_CACHE_NAME = 'badge-count-v1';
const BADGE_CACHE_KEY = '/__badge-count__';

// Chromium exposes the Badging API on the worker's navigator, but the
// bundled WebWorker lib types don't all declare it yet - narrow locally
// rather than widen the ambient type or reach for `any`.
type BadgeCapableNavigator = WorkerNavigator & {
  setAppBadge?: (contents?: number) => Promise<void>;
};

async function readBadgeCount(): Promise<number> {
  const cache = await caches.open(BADGE_CACHE_NAME);
  const cached = await cache.match(BADGE_CACHE_KEY);
  if (!cached) return 0;
  const { count } = (await cached.json()) as { count?: number };
  return typeof count === 'number' ? count : 0;
}

async function writeBadgeCount(count: number): Promise<void> {
  const cache = await caches.open(BADGE_CACHE_NAME);
  await cache.put(BADGE_CACHE_KEY, new Response(JSON.stringify({ count })));
}

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
    (async () => {
      await self.registration.showNotification(payload.title ?? 'Training Platform', {
        body: payload.body,
        icon: '/icon-192.png',
        // Android renders this from its alpha channel only, silhouetted and
        // tinted by the system - a monochrome asset, not the colored icon
        // above (see scripts/generate-notification-badge.mjs).
        badge: '/badge-96.png',
        data: { url: payload.url ?? '/' },
      });

      const badgeNavigator = self.navigator as BadgeCapableNavigator;
      if (badgeNavigator.setAppBadge) {
        const next = (await readBadgeCount()) + 1;
        await writeBadgeCount(next);
        await badgeNavigator.setAppBadge(next).catch(() => {});
      }
    })(),
  );
});

// ---- Subscription rotation: browsers are free to invalidate a push
// subscription at any time (expiry, key rotation, Android evicting it under
// storage pressure) and fire this event instead of `push` when it happens.
// This handler's only job is to keep a *browser-level* subscription alive -
// a service worker has no access to `document.cookie`, so it can't attach
// the CSRF header apiClient normally does for a POST, and the Cookie Store
// API that could read cookies without `document` isn't supported outside
// Chromium. Telling the backend about the new subscription is left to
// usePushSubscription.ts's own reconcile-on-load check, which runs with the
// full, correctly-authenticated apiClient the next time the app is open -
// and will pick this new subscription up automatically. ----
self.addEventListener(
  'pushsubscriptionchange',
  ((event: ExtendableEvent) => {
    if (!VAPID_PUBLIC_KEY) return;
    event.waitUntil(
      self.registration.pushManager
        .subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
        })
        .catch(() => {
          // Nothing more to do here - if re-subscribing itself fails (e.g.
          // permission was revoked at the OS level), the next app open will
          // see no subscription and leave status as unsubscribed rather
          // than pretending it recovered.
        }),
    );
  }) as EventListener,
);

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
  if (event.data?.type === 'SYNC_BADGE_COUNT' && typeof event.data.count === 'number') {
    event.waitUntil(writeBadgeCount(event.data.count));
  }
});
